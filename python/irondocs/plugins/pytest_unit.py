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

    def test_collects_mdx_and_svx_files(self, pytester: pytest.Pytester):
        pytester.makeini("[pytest]\nirondocs_files = docs/*\n")
        docs = pytester.mkdir("docs")
        (docs / "tabs.mdx").write_text(
            "## Tabs\n\n<Tab>\n  ```python test\n  assert True\n  ```\n</Tab>\n"
        )
        (docs / "note.svx").write_text(
            "<script>\n  let x = 1\n</script>\n\n## Note\n\n```python test\nassert True\n```\n"
        )
        result = pytester.runpytest("-v")
        result.assert_outcomes(passed=2)
        result.stdout.fnmatch_lines(
            ["*docs/note.svx::Note PASSED*", "*docs/tabs.mdx::Tabs PASSED*"]
        )

    def test_reports_invalid_mdx_as_a_collection_error(self, pytester: pytest.Pytester):
        pytester.makeini("[pytest]\nirondocs_files = docs/*.mdx\n")
        docs = pytester.mkdir("docs")
        (docs / "bad.mdx").write_text("<!-- note -->\n")
        result = pytester.runpytest()
        result.assert_outcomes(errors=1)
        result.stdout.fnmatch_lines(["*bad.mdx: Unexpected character*"])
        result.stdout.no_fnmatch_line("*parse_markdown*")

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

    def test_ignores_a_failing_import_only_skipped_blocks_use(
        self, pytester: pytest.Pytester
    ):
        md = "## A\n\n```python test skip\nimport not_released\n```\n\n## B\n\n```python test\nassert True\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1, skipped=1)

    def test_shares_an_import_from_a_skipped_block(self, pytester: pytest.Pytester):
        md = "## A\n\n```python test skip\nimport math\n```\n\n## B\n\n```python test\nassert math.pi > 3\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1, skipped=1)

    def test_shares_an_import_with_a_focused_block(self, pytester: pytest.Pytester):
        md = "## A\n\n```python test\nimport math\n```\n\n## B\n\n```python test only\nassert math.pi > 3\n```\n"
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=1, skipped=1)

    def test_fails_collection_when_two_blocks_bind_one_name_differently(
        self, pytester: pytest.Pytester
    ):
        md = "## A\n\n```python test\nfrom math import sqrt\n```\n\n## B\n\n```python test\nfrom cmath import sqrt\n```\n"
        write(pytester, md)
        result = pytester.runpytest()
        result.assert_outcomes(errors=1)
        result.stdout.fnmatch_lines(["*sqrt*math*cmath*"])

    def test_applies_a_future_import_from_any_block(self, pytester: pytest.Pytester):
        md = '## A\n\n```python test\nimport os\n```\n\n## B\n\n```python test\nfrom __future__ import annotations\ndef f(x: Undefined): ...\nassert f.__annotations__ == {"x": "Undefined"}\n```\n'
        write(pytester, md)
        pytester.runpytest().assert_outcomes(passed=2)

    def test_shows_only_the_failing_block_in_a_failure(self, pytester: pytest.Pytester):
        md = "# Intro line\n\nProse.\n\n```python test\nx = 1\n```\n\n## Fails\n\n```python test\ny = 1\nassert y == 2\n```\n"
        write(pytester, md)
        result = pytester.runpytest()
        result.assert_outcomes(passed=1, failed=1)
        result.stdout.fnmatch_lines(
            ["*```python test", "*y = 1", ">*assert y == 2", "*docs/sum.md:13: Assert*"]
        )
        result.stdout.no_fnmatch_line("*Intro line*")

    def test_reports_the_line_of_a_function_failing_inside_a_block(
        self, pytester: pytest.Pytester
    ):
        md = "# H\n\n```python test\ndef f():\n    assert False\n\nf()\n```\n"
        write(pytester, md)
        result = pytester.runpytest()
        result.stdout.fnmatch_lines(["*docs/sum.md:5: AssertionError*"])

    def test_reports_a_compile_time_syntax_error_at_its_line(
        self, pytester: pytest.Pytester
    ):
        write(pytester, "# H\n\nText.\n\n```python test\nx = 1\nreturn x\n```\n")
        result = pytester.runpytest()
        result.assert_outcomes(errors=1)
        result.stdout.fnmatch_lines(["*docs/sum.md*line 7*"])

    def test_shows_only_the_import_in_an_import_failure(self, pytester: pytest.Pytester):
        md = "# Intro line\n\nProse.\n\n## Imports\n\n```python test\nimport not_installed\n```\n"
        write(pytester, md)
        result = pytester.runpytest()
        result.assert_outcomes(failed=1)
        result.stdout.fnmatch_lines([">*import not_installed", "*docs/sum.md:8: Module*"])
        result.stdout.no_fnmatch_line("*Intro line*")

    @pytest.mark.parametrize(
        ("pattern", "collected"),
        [
            ("docs/*.md", ["docs/top.md"]),
            ("docs/**/*.md", ["docs/sub/deep/low.md", "docs/sub/mid.md", "docs/top.md"]),
            ("docs/**", ["docs/sub/deep/low.md", "docs/sub/mid.md", "docs/top.md"]),
            ("./docs/sub/*.md", ["docs/sub/mid.md"]),
            ("docs/s?b/*.md", ["docs/sub/mid.md"]),
            ("docs/[r-t]ub/*.md", ["docs/sub/mid.md"]),
            ("docs/[!s]*.md", ["docs/top.md"]),
            ("mid.md", ["docs/sub/mid.md"]),
        ],
    )
    def test_matches_irondocs_files_as_path_globs(
        self, pytester: pytest.Pytester, pattern: str, collected: list[str]
    ):
        pytester.makeini(f"[pytest]\nirondocs_files = {pattern}\n")
        for path in ["docs/top.md", "docs/sub/mid.md", "docs/sub/deep/low.md"]:
            (pytester.path / path).parent.mkdir(parents=True, exist_ok=True)
            (pytester.path / path).write_text("```python test\nassert True\n```\n")
        result = pytester.runpytest("--collect-only", "-q")
        ids = sorted(line.split("::")[0] for line in result.outlines if "::" in line)
        assert ids == collected

    def test_matches_an_absolute_irondocs_files_pattern(self, pytester: pytest.Pytester):
        docs = pytester.path / "docs"
        pytester.makeini(f"[pytest]\nirondocs_files = {docs.as_posix()}/*.md\n")
        pytester.mkdir("docs")
        (docs / "top.md").write_text("```python test\nassert True\n```\n")
        pytester.runpytest().assert_outcomes(passed=1)


def write(pytester: pytest.Pytester, content: str):
    pytester.makeini(INI)
    pytester.mkdir("docs")
    (pytester.path / "docs" / "sum.md").write_text(content)
