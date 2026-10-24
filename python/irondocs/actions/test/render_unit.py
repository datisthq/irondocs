import ast

from ...models.block import Block
from ..code.partition import partition_code
from .render import render_test_module


class TestRenderTestModule:
    def test_returns_no_doctests_for_empty_input(self):
        module = render_test_module([], "foo.md")
        assert module.doctests == []
        assert module.imports.body == []

    def test_turns_a_single_block_into_a_doctest(self):
        module = render_test_module([pair(Block(heading="Adds", code="x = 1"))], "foo.md")
        assert [d.name for d in module.doctests] == ["Adds"]
        assert ast.unparse(module.doctests[0].body) == "x = 1"

    def test_suffixes_duplicate_headings(self):
        module = render_test_module(
            [
                pair(Block(heading="Adds", code="a")),
                pair(Block(heading="Adds", code="b")),
            ],
            "foo.md",
        )
        assert [d.name for d in module.doctests] == ["Adds #1", "Adds #2"]

    def test_dedupes_imports_across_blocks(self):
        module = render_test_module(
            [
                pair(Block(heading="A", code="from lib import add\nadd(1, 2)")),
                pair(Block(heading="B", code="from lib import add\nadd(3, 4)")),
            ],
            "foo.md",
        )
        assert ast.unparse(module.imports) == "from lib import add"

    def test_falls_back_to_filename_basename_when_heading_is_empty(self):
        module = render_test_module([pair(Block(heading="", code="ok()"))], "setup.md")
        assert module.doctests[0].name == "setup"

    def test_keeps_an_empty_body_for_an_imports_only_block(self):
        module = render_test_module(
            [pair(Block(heading="X", code="import os"))], "foo.md"
        )
        assert module.doctests[0].body.body == []
        assert ast.unparse(module.imports) == "import os"

    def test_uses_block_name_verbatim_instead_of_heading_when_set(self):
        block = Block(heading="ignored", code="x", name="explicit name")
        module = render_test_module([pair(block)], "foo.md")
        assert module.doctests[0].name == "explicit name"

    def test_does_not_suffix_user_supplied_duplicate_names(self):
        module = render_test_module(
            [
                pair(Block(heading="h", code="a", name="same")),
                pair(Block(heading="h", code="b", name="same")),
            ],
            "foo.md",
        )
        assert [d.name for d in module.doctests] == ["same", "same"]

    def test_carries_skip_only_and_line(self):
        block = Block(heading="X", code="x", line=5, skip=True, only=True)
        doctest = render_test_module([pair(block)], "foo.md").doctests[0]
        assert (doctest.skip, doctest.only, doctest.line) == (True, True, 5)


def pair(block: Block):
    return block, partition_code(block.code, block.line)
