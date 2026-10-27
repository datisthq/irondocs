import ast
import asyncio
import inspect
import re
from collections.abc import Iterator
from pathlib import Path
from types import CodeType
from typing import TYPE_CHECKING

import pytest
from _pytest._code.code import ExceptionInfo, TerminalRepr
from _pytest.assertion.rewrite import rewrite_asserts

from ..actions.code.partition import partition_code
from ..actions.markdown.parse import parse_markdown
from ..actions.test.render import render_test_module
from ..models.module import Doctest

# pytest < 8.3 has no public `TracebackStyle`, and the plugin loads on every pytest run
if TYPE_CHECKING:
    from _pytest._code.code import TracebackStyle


def pytest_addoption(parser: pytest.Parser):
    """
    Register the `irondocs_files` ini option: glob patterns of the markdown files
    whose `python test` blocks run as tests.
    """
    parser.addini(
        "irondocs_files",
        type="args",
        default=[],
        help="Glob patterns of markdown files whose `python test` blocks run as tests",
    )


def pytest_collect_file(file_path: Path, parent: pytest.Collector):
    """
    Collect a markdown file when it matches `irondocs_files` or was named on the
    command line.
    """
    if file_path.suffix != ".md":
        return None
    if not parent.session.isinitpath(file_path) and not match_files(file_path, parent):
        return None
    return MarkdownFile.from_parent(parent, path=file_path)


class MarkdownFile(pytest.File):
    """
    A markdown document whose runnable code blocks are collected as doctests.
    """

    def collect(self) -> Iterator[pytest.Item]:
        source = self.path.read_text(encoding="utf-8")
        filename = str(self.path)
        blocks = parse_markdown(source)
        partitions = [partition_code(b.code, b.line, filename) for b in blocks]
        module = render_test_module(list(zip(blocks, partitions)), self.path.name)

        first_line = min((node.lineno - 1 for node in module.imports.body), default=1)
        imports = compile_shifted(
            module.imports, filename, module.future_flags, first_line
        )
        focused = any(d.only and not d.skip for d in module.doctests)
        for doctest in module.doctests:
            item = DoctestItem.from_parent(self, name=doctest.name)
            item.imports = imports
            item.body = compile_body(
                doctest, source, filename, self.config, module.future_flags
            )
            item.line = doctest.line
            if doctest.skip:
                item.add_marker(pytest.mark.skip(reason="irondocs: skip"))
            elif focused and not doctest.only:
                item.add_marker(pytest.mark.skip(reason="irondocs: only"))
            yield item


class DoctestItem(pytest.Item):
    """
    One runnable code block. Runs the hoisted imports, then the block's body,
    in a fresh namespace; a body with top-level `await` runs in its own event loop.
    """

    imports: CodeType
    body: CodeType
    line: int

    def runtest(self):
        namespace: dict[str, object] = {
            "__name__": self.path.stem,
            "__file__": str(self.path),
            "pytest": pytest,
        }
        exec(self.imports, namespace)
        result = eval(self.body, namespace)
        if inspect.iscoroutine(result):
            asyncio.run(result)

    def reportinfo(self):
        return self.path, self.line - 1, self.name

    def repr_failure(
        self,
        excinfo: ExceptionInfo[BaseException],
        style: "TracebackStyle | None" = None,
    ) -> str | TerminalRepr:
        excinfo.traceback = excinfo.traceback.cut(path=self.path)
        return super().repr_failure(excinfo, style)


def match_files(file_path: Path, parent: pytest.Collector):
    patterns: list[str] = parent.config.getini("irondocs_files")
    rootpath = parent.config.rootpath
    relative = (
        file_path.relative_to(rootpath).as_posix()
        if file_path.is_relative_to(rootpath)
        else None
    )
    for pattern in patterns:
        if "/" not in pattern:
            if translate_glob(pattern).fullmatch(file_path.name):
                return True
        elif Path(pattern).is_absolute():
            if translate_glob(pattern).fullmatch(file_path.as_posix()):
                return True
        elif relative is not None:
            if translate_glob(pattern.removeprefix("./")).fullmatch(relative):
                return True
    return False


def translate_glob(pattern: str) -> re.Pattern[str]:
    parts: list[str] = []
    segments = pattern.split("/")
    for index, segment in enumerate(segments):
        last = index == len(segments) - 1
        if segment == "**":
            parts.append(".*" if last else "(?:[^/]+/)*")
            continue
        parts.append(translate_segment(segment) + ("" if last else "/"))
    return re.compile("".join(parts))


def translate_segment(segment: str) -> str:
    out: list[str] = []
    index = 0
    while index < len(segment):
        char = segment[index]
        close = segment.find("]", index + 2) if char == "[" else -1
        if char == "*":
            out.append("[^/]*")
        elif char == "?":
            out.append("[^/]")
        elif close != -1:
            body = segment[index + 1 : close]
            negate = body.startswith("!")
            body = body.removeprefix("!").replace("\\", "\\\\").replace("^", "\\^")
            out.append(f"[{'^' if negate else ''}{body}]")
            index = close
        else:
            out.append(re.escape(char))
        index += 1
    return "".join(out)


def compile_body(
    doctest: Doctest, source: str, filename: str, config: pytest.Config, flags: int
):
    rewrite_asserts(doctest.body, source.encode(), filename, config)
    flags |= ast.PyCF_ALLOW_TOP_LEVEL_AWAIT
    return compile_shifted(doctest.body, filename, flags, doctest.line - 1)


# pytest prints a failing frame's source from `co_firstlineno`, which is 1 for a module;
# compiling relative to the fence line and shifting back keeps the excerpt to the block
def compile_shifted(tree: ast.Module, filename: str, flags: int, fence_line: int):
    offset = fence_line - 1
    ast.increment_lineno(tree, -offset)
    try:
        code = compile(tree, filename, "exec", flags=flags)
    except SyntaxError as error:
        if error.lineno is not None:
            error.lineno += offset
        if error.end_lineno is not None:
            error.end_lineno += offset
        raise
    return shift_lines(code, offset)


def shift_lines(code: CodeType, offset: int) -> CodeType:
    consts = tuple(
        shift_lines(const, offset) if isinstance(const, CodeType) else const
        for const in code.co_consts
    )
    return code.replace(co_firstlineno=code.co_firstlineno + offset, co_consts=consts)
