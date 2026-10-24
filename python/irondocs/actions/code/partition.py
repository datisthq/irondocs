import ast

from ...models.partition import Partition


def partition_code(code: str, line: int = 1, filename: str = "<block>") -> Partition:
    """
    Split a Python snippet into its top-level import statements (hoistable to
    the surrounding module) and the rest of its statements, numbering them as
    if the snippet started on `line` of `filename`.
    """
    tree = ast.parse("\n" * (line - 1) + code, filename=filename)
    imports: list[ast.stmt] = []
    body: list[ast.stmt] = []
    for node in tree.body:
        if isinstance(node, ast.Import | ast.ImportFrom):
            imports.append(node)
        else:
            body.append(node)
    return Partition(imports=imports, body=body)
