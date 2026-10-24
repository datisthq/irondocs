import ast
from dataclasses import dataclass


@dataclass
class Doctest:
    """
    One runnable test assembled from a block: its final name, the line its code
    starts on, its skip/only flags and its body as a module of its own.
    """

    name: str
    line: int
    body: ast.Module
    skip: bool = False
    only: bool = False


@dataclass
class DoctestModule:
    """
    The test module assembled from one markdown document: the imports hoisted
    from every block, deduped and shared, and one doctest per block.
    """

    imports: ast.Module
    doctests: list[Doctest]
