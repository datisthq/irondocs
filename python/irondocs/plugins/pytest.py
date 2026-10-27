import ast
import asyncio
import inspect
from collections.abc import Iterator
from fnmatch import fnmatch
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

        imports = compile(module.imports, filename, "exec")
        focused = any(d.only and not d.skip for d in module.doctests)
        for doctest in module.doctests:
            item = DoctestItem.from_parent(self, name=doctest.name)
            item.imports = imports
            item.body = compile_body(doctest, source, filename, self.config)
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
    if not file_path.is_relative_to(rootpath):
        return False
    relative = file_path.relative_to(rootpath).as_posix()
    return any(
        fnmatch(relative, pattern)
        or ("/" not in pattern and fnmatch(file_path.name, pattern))
        for pattern in patterns
    )


def compile_body(doctest: Doctest, source: str, filename: str, config: pytest.Config):
    rewrite_asserts(doctest.body, source.encode(), filename, config)
    return compile(doctest.body, filename, "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
