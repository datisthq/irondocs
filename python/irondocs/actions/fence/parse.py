import re

from ...models.fence import Fence

TOKEN = re.compile(
    r"([A-Za-z_][\w-]*)=(?:\"((?:\\.|[^\"\\])*)\"?|'((?:\\.|[^'\\])*)'?|(\S*))|(\S+)"
)
ESCAPE = re.compile(r"\\(.)")


def parse_fence(meta: str) -> Fence:
    """
    Split a fence info string into its bare options and its `key="value"` attributes.
    Values may be double-quoted, single-quoted or bare; a backslash escapes a quote.
    """
    fence = Fence()
    for match in TOKEN.finditer(meta):
        key, double, single, bare, option = match.groups()
        if key is None:
            if option is not None:
                fence.options.append(option)
            continue
        quoted = double if double is not None else single
        fence.attributes[key] = (
            ESCAPE.sub(r"\1", quoted) if quoted is not None else bare or ""
        )
    return fence
