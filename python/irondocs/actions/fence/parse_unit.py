from ...models.fence import Fence
from .parse import parse_fence


class TestParseFence:
    def test_returns_no_options_for_an_empty_info_string(self):
        assert parse_fence("") == Fence(options=[], attributes={})

    def test_splits_bare_tokens_on_any_whitespace(self):
        assert parse_fence("test\tskip  only") == Fence(
            options=["test", "skip", "only"], attributes={}
        )

    def test_reads_double_and_single_quoted_attributes(self):
        assert parse_fence("test name=\"a b\" title='c d'") == Fence(
            options=["test"], attributes={"name": "a b", "title": "c d"}
        )

    def test_never_counts_words_inside_an_attribute_value_as_options(self):
        assert parse_fence('title="the only test to skip"').options == []

    def test_unescapes_quotes_inside_a_quoted_value(self):
        assert parse_fence(r'test name="has \"esc\""').attributes == {"name": 'has "esc"'}

    def test_reads_an_unquoted_attribute_value_up_to_whitespace(self):
        assert parse_fence("test name=plain skip") == Fence(
            options=["test", "skip"], attributes={"name": "plain"}
        )

    def test_keys_a_hyphenated_attribute_by_its_full_key(self):
        assert parse_fence('test data-name="x"').attributes == {"data-name": "x"}

    def test_keeps_backslashes_in_an_unquoted_value(self):
        assert parse_fence(r"path=C:\dir").attributes == {"path": r"C:\dir"}
