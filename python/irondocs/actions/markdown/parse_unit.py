from ...models.block import Block
from .parse import parse_markdown


class TestParseMarkdown:
    def test_returns_empty_list_for_empty_source(self):
        assert parse_markdown("") == []

    def test_returns_empty_list_when_no_marked_blocks(self):
        md = "# Title\n\n```python\nx = 1\n```\n"
        assert parse_markdown(md) == []

    def test_extracts_a_marked_block_under_a_heading(self):
        md = "## Adds two numbers\n\n```python test\nassert 1 + 1 == 2\n```\n"
        assert parse_markdown(md) == [
            Block(heading="Adds two numbers", code="assert 1 + 1 == 2", line=4)
        ]

    def test_returns_each_duplicate_heading_block_separately(self):
        md = "## Adds\n\n```python test\na\n```\n\n## Adds\n\n```python test\nb\n```\n"
        assert parse_markdown(md) == [
            Block(heading="Adds", code="a", line=4),
            Block(heading="Adds", code="b", line=10),
        ]

    def test_ignores_heading_lines_inside_a_fenced_code_block(self):
        md = "## Real\n\n```python test\n# not a heading\nassert True\n```\n"
        blocks = parse_markdown(md)
        assert len(blocks) == 1
        assert blocks[0].heading == "Real"

    def test_extracts_only_marked_blocks_when_interleaved_with_unmarked(self):
        md = "\n".join(
            [
                "## H",
                "```python",
                "illustrative",
                "```",
                "```python test",
                "runnable",
                "```",
            ]
        )
        assert parse_markdown(md) == [Block(heading="H", code="runnable", line=6)]

    def test_returns_empty_heading_when_no_heading_precedes_the_block(self):
        md = "```python test\nassert True\n```\n"
        assert parse_markdown(md) == [Block(heading="", code="assert True", line=2)]

    def test_accepts_py_with_test_token(self):
        md = "```py test\nx = 1\n```"
        assert parse_markdown(md) == [Block(heading="", code="x = 1", line=2)]

    def test_does_not_accept_other_languages_with_test_token(self):
        md = "```ts test\nconst x = 1\n```"
        assert parse_markdown(md) == []

    def test_ignores_blocks_nested_in_lists(self):
        md = "- item\n\n  ```python test\n  x = 1\n  ```\n"
        assert parse_markdown(md) == []

    def test_reads_heading_text_without_markup(self):
        md = "## The `sum` **function**\n\n```python test\nx\n```\n"
        assert parse_markdown(md)[0].heading == "The sum function"

    def test_captures_name_as_the_blocks_name_override(self):
        md = '## H\n\n```python test name="custom"\nx\n```\n'
        assert parse_markdown(md) == [Block(heading="H", code="x", line=4, name="custom")]

    def test_captures_the_skip_token(self):
        md = "## H\n\n```python test skip\nx\n```\n"
        assert parse_markdown(md) == [Block(heading="H", code="x", line=4, skip=True)]

    def test_captures_the_only_token(self):
        md = "## H\n\n```python test only\nx\n```\n"
        assert parse_markdown(md) == [Block(heading="H", code="x", line=4, only=True)]

    def test_captures_combined_options(self):
        md = '## H\n\n```python test only name="focus me"\nx\n```\n'
        assert parse_markdown(md) == [
            Block(heading="H", code="x", line=4, name="focus me", only=True)
        ]

    def test_does_not_pick_up_tokens_that_appear_inside_a_name_value(self):
        md = '## H\n\n```python test name="includes skip word"\nx\n```\n'
        assert parse_markdown(md) == [
            Block(heading="H", code="x", line=4, name="includes skip word")
        ]

    def test_does_not_match_name_inside_another_word(self):
        md = '## H\n\n```python test myname="x"\ny\n```\n'
        assert parse_markdown(md) == [Block(heading="H", code="y", line=4)]

    def test_reads_options_only_from_bare_tokens_never_from_attribute_values(self):
        md = "\n".join(
            [
                "## H",
                '```python title="how to test it"',
                "a",
                "```",
                '```python test title="the only one to skip"',
                "b",
                "```",
            ]
        )
        assert parse_markdown(md) == [Block(heading="H", code="b", line=6)]

    def test_does_not_read_data_name_as_the_name(self):
        md = '## H\n\n```python test data-name="x"\ny\n```\n'
        assert parse_markdown(md) == [Block(heading="H", code="y", line=4)]

    def test_reads_a_single_quoted_name(self):
        md = "## H\n\n```python test name='x y'\ny\n```\n"
        assert parse_markdown(md) == [Block(heading="H", code="y", line=4, name="x y")]

    def test_accepts_a_tab_between_the_language_and_its_options(self):
        md = "## H\n\n```python\ttest\ny\n```\n"
        assert parse_markdown(md) == [Block(heading="H", code="y", line=4)]

    def test_never_reads_yaml_front_matter_as_a_heading(self):
        md = "---\ntitle: Page\norder: 2\n---\n\n```python test\na\n```\n"
        assert parse_markdown(md) == [Block(heading="", code="a", line=7)]

    def test_keeps_the_first_heading_of_a_file_that_starts_with_a_bom(self):
        md = "\ufeff# Title\n\n```python test\na\n```\n"
        assert parse_markdown(md) == [Block(heading="Title", code="a", line=4)]
