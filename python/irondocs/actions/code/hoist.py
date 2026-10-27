import __future__
import ast

from ...models.block import Block
from ...models.partition import Partition


def hoist_imports(
    blocks: list[tuple[Block, Partition]], filename: str
) -> tuple[list[ast.stmt], int]:
    """
    Merge every block's imports into the statements shared by the whole file, plus the
    compiler flags of its `from __future__` imports. An import only skipped blocks use
    is guarded, so a pending module cannot fail the blocks that run.
    """
    focused = any(block.only and not block.skip for block, _ in blocks)
    running = [(not b.skip and (b.only or not focused), p) for b, p in blocks]

    flags = 0
    sources: dict[str, str] = {}
    shared: dict[str, ast.stmt] = {}
    guarded: dict[str, ast.stmt] = {}
    for runs, partition in sorted(running, key=lambda pair: not pair[0]):
        for node in partition.imports:
            if isinstance(node, ast.ImportFrom) and node.module == "__future__":
                for alias in node.names:
                    flags |= getattr(__future__, alias.name).compiler_flag
                continue
            for local, source in read_bindings(node):
                bound = sources.setdefault(local, source)
                if bound != source:
                    raise ImportError(
                        f"{filename} imports {local!r} as both {bound} and {source}"
                    )
            key = ast.unparse(node)
            if runs:
                shared.setdefault(key, node)
            elif key not in shared:
                guarded.setdefault(key, guard_import(node))
    return [*shared.values(), *guarded.values()], flags


def read_bindings(node: ast.stmt):
    if isinstance(node, ast.Import):
        for alias in node.names:
            if alias.asname:
                yield alias.asname, f"import {alias.name}"
            else:
                yield alias.name.split(".")[0], f"import {alias.name.split('.')[0]}"
    elif isinstance(node, ast.ImportFrom):
        module = "." * node.level + (node.module or "")
        for alias in node.names:
            if alias.name != "*":
                yield alias.asname or alias.name, f"from {module} import {alias.name}"


def guard_import(node: ast.stmt) -> ast.stmt:
    handler = ast.ExceptHandler(
        type=ast.Name("ImportError", ctx=ast.Load()), name=None, body=[ast.Pass()]
    )
    guard = ast.Try(body=[node], handlers=[handler], orelse=[], finalbody=[])
    return ast.fix_missing_locations(ast.copy_location(guard, node))
