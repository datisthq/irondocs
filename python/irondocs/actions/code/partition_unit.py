import ast

import pytest

from .partition import partition_code


class TestPartitionCode:
    def test_returns_empty_imports_when_code_has_none(self):
        result = partition_code("x = 1")
        assert result.imports == []
        assert render(result.body) == "x = 1"

    def test_hoists_an_import(self):
        result = partition_code("import os\nos.getcwd()")
        assert render(result.imports) == "import os"
        assert render(result.body) == "os.getcwd()"

    def test_hoists_a_multi_line_from_import(self):
        result = partition_code("from x import (\n    a,\n    b,\n)\na + b")
        assert render(result.imports) == "from x import a, b"
        assert render(result.body) == "a + b"

    def test_hoists_a_relative_import(self):
        result = partition_code("from .x import a\na()")
        assert render(result.imports) == "from .x import a"

    def test_hoists_multiple_imports_and_preserves_body_order(self):
        code = "import a\nfrom b import c\nv = a.x + c\nrun(v)"
        result = partition_code(code)
        assert len(result.imports) == 2
        assert render(result.body) == "v = a.x + c\nrun(v)"

    def test_keeps_nested_imports_in_the_body(self):
        result = partition_code("def f():\n    import os\n    return os")
        assert result.imports == []
        assert len(result.body) == 1

    def test_numbers_statements_from_the_given_line(self):
        result = partition_code("import os\nx = 1", line=10)
        assert result.imports[0].lineno == 10
        assert result.body[0].lineno == 11

    def test_reports_syntax_errors_at_the_document_line(self):
        with pytest.raises(SyntaxError) as excinfo:
            partition_code("x = 1\nx = (", line=7, filename="doc.md")
        assert excinfo.value.filename == "doc.md"
        assert excinfo.value.lineno == 8


def render(nodes: list[ast.stmt]):
    return "\n".join(ast.unparse(node) for node in nodes)
