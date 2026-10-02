"""
Helpers for parsing line-based LLM output ("LABEL: value").

Models format labels differently — gpt-oss often writes "**VERDICT:** SUPPORTED",
"- **Verdict:** Supported" or puts the value on the next line, where older models
wrote "VERDICT: SUPPORTED". Only the label is normalized; values keep their text
(so "C#" or "#1" in a quote or claim survive).
"""

import re
from collections.abc import Iterable

# Optional bullet/number, markdown around the label, ":" or " - " separator
_LABEL_LINE = re.compile(
    r"^(?:[-*+•]\s+|\d+[.)]\s+)?[*_`#\s]*"
    r"(?P<label>[A-Za-z][A-Za-z_ ]{0,30}?)"
    r"[*_`\s]*(?::|\s[-–]\s)[*_`\s]*"
    r"(?P<value>.*?)[*`\s]*$"
)
_LIST_ITEM = re.compile(r"^(?:[-*+•]|\d+[.)])\s+(?P<text>.*)$")
_SEPARATOR = re.compile(r"[-=_*\s]{3,}")
_VERDICT = re.compile(r"(SUPPORTED|REFUTED|NOT_ENOUGH_INFO)(?:RMATION)?\b")


def parse_labeled_line(line: str, labels: Iterable[str]) -> tuple[str, str] | None:
    """Return (LABEL, value) when the line starts with one of `labels`, else None."""
    match = _LABEL_LINE.match(line.strip())
    if not match:
        return None
    label = re.sub(r"\s+", "_", match["label"].strip()).upper()
    if label not in labels:
        return None
    return label, match["value"].strip()


def strip_markdown_edges(text: str) -> str:
    """Remove emphasis/code markers wrapping a value, keeping its inner text."""
    return text.strip().strip("*`").strip()


def list_item_text(line: str) -> str | None:
    """Text of a bulleted/numbered list item or a bare quoted line, else None."""
    line = line.strip()
    match = _LIST_ITEM.match(line)
    if match:
        return match["text"].strip()
    if line[:1] in "\"“'":
        return line
    return None


def is_separator(line: str) -> bool:
    return bool(_SEPARATOR.fullmatch(line.strip()))


def normalize_verdict(value: str) -> str | None:
    """Map "Supported", "NOT ENOUGH INFO", "**REFUTED**." to the canonical verdict."""
    if "|" in value:  # model echoed the template "SUPPORTED | REFUTED | ..."
        return None
    match = _VERDICT.match(re.sub(r"[\s-]+", "_", strip_markdown_edges(value).upper()))
    return match.group(1) if match else None
