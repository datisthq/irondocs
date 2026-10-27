import ast

from ...models.block import Block
from ...models.module import Doctest, DoctestModule
from ...models.partition import Partition
from ..code.hoist import hoist_imports


def render_test_module(
    blocks: list[tuple[Block, Partition]], filename: str
) -> DoctestModule:
    """
    Assemble the test module from parsed blocks and their partitioned code.
    Imports are deduped across all blocks and shared; every block becomes one
    doctest named after its heading, its `name` option or the file's basename.
    """
    imports, future_flags = hoist_imports(blocks, filename)

    fallback = filename.removesuffix(".md")
    names = assign_names([block for block, _ in blocks], fallback)
    doctests = [
        Doctest(
            name=name,
            line=block.line,
            body=ast.Module(body=partition.body, type_ignores=[]),
            skip=block.skip,
            only=block.only,
        )
        for name, (block, partition) in zip(names, blocks, strict=True)
    ]
    return DoctestModule(
        imports=ast.Module(body=imports, type_ignores=[]),
        doctests=doctests,
        future_flags=future_flags,
    )


def assign_names(blocks: list[Block], fallback: str) -> list[str]:
    auto_totals: dict[str, int] = {}
    for block in blocks:
        if block.name is None:
            auto = block.heading or fallback
            auto_totals[auto] = auto_totals.get(auto, 0) + 1

    seen: dict[str, int] = {}
    names: list[str] = []
    for block in blocks:
        if block.name is not None:
            names.append(block.name)
            continue
        auto = block.heading or fallback
        if auto_totals.get(auto, 0) <= 1:
            names.append(auto)
            continue
        occurrence = seen.get(auto, 0) + 1
        seen[auto] = occurrence
        names.append(f"{auto} #{occurrence}")
    return names
