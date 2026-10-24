import re

from markdown_it import MarkdownIt
from markdown_it.token import Token

from ...models.block import Block

LANGUAGES = {"py", "python"}
NAME_PATTERN = re.compile(r'\bname="([^"]*)"')


def parse_markdown(source: str) -> list[Block]:
    """
    Extract runnable code blocks from markdown. A block is runnable when its
    fence info string starts with `python` or `py` and includes the token `test`.
    The fence may also carry `skip`, `only`, and `name="..."` options.
    """
    tokens = MarkdownIt("commonmark").parse(source)
    blocks: list[Block] = []
    current_heading = ""

    for index, token in enumerate(tokens):
        if token.level != 0:
            continue
        if token.type == "heading_open":
            current_heading = read_text(tokens[index + 1])
        elif token.type == "fence":
            lang, _, meta = token.info.strip().partition(" ")
            if lang not in LANGUAGES:
                continue

            name_match = NAME_PATTERN.search(meta)
            options = NAME_PATTERN.sub("", meta).split()
            if "test" not in options:
                continue

            block = Block(
                heading=current_heading,
                code=token.content.removesuffix("\n"),
                line=token.map[0] + 2 if token.map else 1,
            )
            if name_match:
                block.name = name_match[1]
            if "skip" in options:
                block.skip = True
            if "only" in options:
                block.only = True
            blocks.append(block)
    return blocks


def read_text(token: Token) -> str:
    if token.children is None:
        return token.content
    parts: list[str] = []
    for child in token.children:
        if child.type in ("text", "code_inline", "html_inline"):
            parts.append(child.content)
        elif child.type == "softbreak":
            parts.append("\n")
        elif child.children:
            parts.append(read_text(child))
    return "".join(parts)
