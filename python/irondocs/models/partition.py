import ast
from dataclasses import dataclass


@dataclass
class Partition:
    """
    A code snippet split into its top-level import statements (hoistable to the
    surrounding module) and the rest of its statements, both numbered by their
    lines in the markdown document.
    """

    imports: list[ast.stmt]
    body: list[ast.stmt]
