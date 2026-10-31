from textlane import md, textlane
from textlane.mdast import PhrasingContent

from ...models.block import Block
from ..fence.parse import parse_fence

LANGUAGES = {"py", "python"}

# Front matter would otherwise read as a setext heading and name every test after the YAML;
# `...` is YAML's own document end, which remark-frontmatter's preset does not close on
PROCESSOR = (
    textlane()
    .use(md.parse())
    .use(
        md.frontmatter(
            ["yaml", {"type": "yaml", "fence": {"open": "---", "close": "..."}}]
        )
    )
)


def parse_markdown(source: str) -> list[Block]:
    """
    Extract runnable code blocks from markdown. A block is runnable when its
    fence info string starts with `python` or `py` and includes the token `test`.
    The fence may also carry `skip`, `only`, and `name="..."` options.
    """
    tree = PROCESSOR.parse(source)
    blocks: list[Block] = []
    current_heading = ""

    for node in tree["children"]:
        if node["type"] == "heading":
            current_heading = read_text(node["children"])
        elif node["type"] == "code":
            if node.get("lang") not in LANGUAGES:
                continue

            fence = parse_fence(node.get("meta") or "")
            if "test" not in fence.options:
                continue

            position = node.get("position")
            block = Block(
                heading=current_heading,
                code=node["value"],
                line=position["start"]["line"] + 1 if position else 1,
            )
            block.name = fence.attributes.get("name")
            if "skip" in fence.options:
                block.skip = True
            if "only" in fence.options:
                block.only = True
            blocks.append(block)
    return blocks


def read_text(nodes: list[PhrasingContent]) -> str:
    parts: list[str] = []
    for node in nodes:
        match node:
            case {"type": "image"}:
                parts.append(node.get("alt") or "")
            case {"type": "text" | "inlineCode" | "html" | "inlineMath"}:
                parts.append(node["value"])
            case {"type": "emphasis" | "strong" | "delete" | "link" | "linkReference"}:
                parts.append(read_text(node["children"]))
    return "".join(parts)
