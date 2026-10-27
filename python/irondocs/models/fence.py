from dataclasses import dataclass, field


@dataclass
class Fence:
    """
    A fence info string after its language: bare tokens (`test`, `skip`, `only`) and
    `key="value"` attributes, the livemark convention.
    """

    options: list[str] = field(default_factory=list)
    attributes: dict[str, str] = field(default_factory=dict)
