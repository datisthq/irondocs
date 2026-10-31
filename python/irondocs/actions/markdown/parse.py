from collections.abc import Sequence
from dataclasses import dataclass

from textlane import md, textlane
from textlane.mdast import Code, Nodes, PhrasingContent

from ...models.block import Block
from ..fence.parse import parse_fence

LANGUAGES = {"py", "python"}

# Front matter would otherwise read as a setext heading and name every test after the YAML;
# `...` is YAML's own document end, which remark-frontmatter's preset does not close on
FRONTMATTER = md.frontmatter(
    ["yaml", {"type": "yaml", "fence": {"open": "---", "close": "..."}}]
)
MARKDOWN_PROCESSOR = textlane().use(md.parse()).use(FRONTMATTER)
MDX_PROCESSOR = textlane().use(md.parse()).use(md.mdx()).use(FRONTMATTER)


@dataclass
class State:
    heading: str
    blocks: list[Block]


def parse_markdown(source: str, *, mdx: bool = False) -> list[Block]:
    """
    Extract runnable code blocks from markdown, or from MDX when `mdx` is set. A
    block is runnable when its fence info string starts with `python` or `py` and
    includes the token `test`. The fence may also carry `skip`, `only`, and
    `name="..."` options.
    """
    processor = MDX_PROCESSOR if mdx else MARKDOWN_PROCESSOR
    state = State(heading="", blocks=[])
    collect_blocks(processor.parse(source)["children"], state)
    return state.blocks


# Containers are walked too: a `test` block inside a list, quote or JSX element is still a
# test, and skipping it would pass the suite without running it
def collect_blocks(nodes: Sequence[Nodes], state: State):
    for node in nodes:
        match node:
            case {"type": "heading"}:
                state.heading = read_text(node["children"]).strip()
            case {"type": "code"}:
                block = read_block(node, state.heading)
                if block is not None:
                    state.blocks.append(block)
            case {"type": "blockquote" | "list" | "listItem" | "mdxJsxFlowElement"}:
                collect_blocks(node["children"], state)


def read_block(node: Code, heading: str) -> Block | None:
    if node.get("lang") not in LANGUAGES:
        return None
    fence = parse_fence(node.get("meta") or "")
    if "test" not in fence.options:
        return None

    position = node.get("position")
    block = Block(
        heading=heading,
        code=node["value"],
        line=position["start"]["line"] + 1 if position else 1,
    )
    block.name = fence.attributes.get("name")
    if "skip" in fence.options:
        block.skip = True
    if "only" in fence.options:
        block.only = True
    return block


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
