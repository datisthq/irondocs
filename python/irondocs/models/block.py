from dataclasses import dataclass


@dataclass
class Block:
    """
    A runnable code block extracted from a markdown document, paired with the
    heading that immediately precedes it (or the empty string when none does),
    the 1-based line its code starts on and any per-block options the author set
    in the fence info string.
    """

    heading: str
    code: str
    line: int = 1
    name: str | None = None
    skip: bool = False
    only: bool = False
