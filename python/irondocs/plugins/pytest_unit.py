import pytest

INI = "[pytest]\nirondocs_files = docs/*.md\n"


class TestPytestPlugin:
    def test_runs_a_marked_block_as_a_test(self, pytester: pytest.Pytester):
        write(pytester, "## Adds\n\n```python test\nassert 1 + 1 == 2\n```\n")
        result = pytester.runpytest("-v")
        result.assert_outcomes(passed=1)
        result.stdout.fnmatch_lines(["*docs/sum.md::Adds PASSED*"])

    def test_reports_a_failure_at_the_markdown_line(self, pytester: pytest.Pytester):
        write(
            pytester, "## Fails\n\nText.\n\n```python test\nx = 1\nassert x == 2\n```\n"
        )
        result = pytester.runpytest()
        result.assert_outcomes(failed=1)
        result.stdout.fnmatch_lines(
            ["*assert 1 == 2*", "*docs/sum.md:7: AssertionError*"]
        )

    def test_ignores_files_outside_the_patterns(self, pytester: pytest.Pytester):
        pytester.makeini(INI)
        pytester.makefile(".md", README="```python test\nassert False\n```\n")
        result = pytester.runpytest()
        result.assert_outcomes()

    def test_collects_a_file_named_on_the_command_line(self, pytester: pytest.Pytester):
        path = pytester.makefile(".md", README="```python test\nassert True\n```\n")
        result = pytester.runpytest(str(path), "-v")
        result.assert_outcomes(passed=1)
        result.stdout.fnmatch_lines(["*README.md::README PASSED*"])

    def test_shares_hoisted_imports_across_blocks(self, pytester: pytest.Pytester):
        md = "## A\n\n```python test\nimport math\n```\n\n## B\n\n```python test\nassert math.pi > 3\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=2)

    def test_isolates_names_defined_in_bodies(self, pytester: pytest.Pytester):
        md = "## A\n\n```python test\nx = 1\n```\n\n## B\n\n```python test\nx\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1, failed=1)

    def test_injects_pytest(self, pytester: pytest.Pytester):
        md = "```python test\nwith pytest.raises(ZeroDivisionError):\n    1 / 0\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1)

    def test_runs_top_level_await(self, pytester: pytest.Pytester):
        md = (
            "```python test\nimport asyncio\nassert await asyncio.sleep(0, 5) == 5\n```\n"
        )
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1)

    def test_skips_a_block_marked_skip(self, pytester: pytest.Pytester):
        write(pytester, "## H\n\n```python test skip\nassert False\n```\n")
        pytester.runpytest().assert_outcomes(skipped=1)

    def test_runs_only_blocks_marked_only(self, pytester: pytest.Pytester):
        md = "## A\n\n```python test only\nassert True\n```\n\n## B\n\n```python test\nassert False\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1, skipped=1)

    def test_prefers_skip_over_only(self, pytester: pytest.Pytester):
        md = "## A\n\n```python test skip only\nassert False\n```\n\n## B\n\n```python test\nassert True\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1, skipped=1)

    def test_reports_a_syntax_error_as_a_collection_error(
        self, pytester: pytest.Pytester
    ):
        write(pytester, "## H\n\n```python test\nx = (\n```\n")
        result = pytester.runpytest()
        result.assert_outcomes(errors=1)
        result.stdout.fnmatch_lines(["*docs/sum.md*line 4*"])

    def test_collects_nothing_without_marked_blocks(self, pytester: pytest.Pytester):
        write(pytester, "# H\n\n```python\nassert False\n```\n")
        pytester.runpytest().assert_outcomes()


def write(pytester: pytest.Pytester, content: str):
    pytester.makeini(INI)
    pytester.mkdir("docs")
    (pytester.path / "docs" / "sum.md").write_text(content)
