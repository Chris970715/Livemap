"""
Unit tests for parsing line-based LLM output.

gpt-oss models wrap labels in markdown ("**VERDICT:** SUPPORTED"); before the
label-aware parser every such verdict silently became NOT_ENOUGH_INFO.
"""

import pytest

from app.agent.claim_extraction import ClaimExtractor
from app.agent.llm_text import normalize_verdict, parse_labeled_line
from app.agent.qa_verifier import QAVerifier

# Raw gpt-oss-20b output captured from a live verification call (2026-10-01)
MARKDOWN_VERDICT = """**VERDICT:** SUPPORTED
**CONFIDENCE:** 5

**EVIDENCE_QUOTES:**
- "[Reuters]: Russian President Vladimir Putin signed a decree increasing the size of the armed forces by 15,000 servicemen."
- "[AP]: A Kremlin decree published Monday raises the number of military personnel by 15,000."

**REASONING:**
Both sources report the decree.
The number 15,000 is consistent."""

parse_verdict = QAVerifier._parse_verdict


def parse_claims(content: str):
    # _parse_claims only needs _create_claim; skip building an LLM client
    return object.__new__(ClaimExtractor)._parse_claims(content)


class TestParseLabeledLine:
    @pytest.mark.parametrize(
        "line",
        [
            "VERDICT: SUPPORTED",
            "**VERDICT:** SUPPORTED",
            "VERDICT: **SUPPORTED**",
            "- **Verdict:** Supported",
            "1. **VERDICT:** SUPPORTED",
            "### VERDICT: SUPPORTED",
            "VERDICT - SUPPORTED",
        ],
    )
    def test_should_extract_label_and_value_from_formatting_variants(self, line):
        label, value = parse_labeled_line(line, {"VERDICT"})
        assert label == "VERDICT"
        assert normalize_verdict(value) == "SUPPORTED"

    def test_should_keep_markdown_characters_inside_values(self):
        assert parse_labeled_line("CLAIM: C# is #1 in usage", {"CLAIM"}) == ("CLAIM", "C# is #1 in usage")

    def test_should_ignore_lines_with_unknown_labels(self):
        assert parse_labeled_line("Note: the decree - signed Monday", {"VERDICT"}) is None


class TestNormalizeVerdict:
    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            ("**NOT_ENOUGH_INFO**", "NOT_ENOUGH_INFO"),
            ("not enough info", "NOT_ENOUGH_INFO"),
            ("Not enough information", "NOT_ENOUGH_INFO"),
            ("REFUTED.", "REFUTED"),
            ("SUPPORTED | REFUTED | NOT_ENOUGH_INFO", None),
            ("maybe", None),
        ],
    )
    def test_should_map_variants_to_canonical_verdicts(self, value, expected):
        assert normalize_verdict(value) == expected


class TestParseVerdict:
    def test_should_parse_markdown_formatted_verdict(self):
        result = parse_verdict(MARKDOWN_VERDICT)

        assert result["verdict"] == "SUPPORTED"
        assert result["confidence"] == 5
        assert len(result["evidence_quotes"]) == 2
        assert result["reasoning"] == "Both sources report the decree. The number 15,000 is consistent."

    def test_should_parse_plain_verdict_with_inline_reasoning(self):
        result = parse_verdict("VERDICT: REFUTED\nCONFIDENCE: 4/5\nREASONING: Officials denied it.")

        assert result["verdict"] == "REFUTED"
        assert result["confidence"] == 4
        assert result["reasoning"] == "Officials denied it."

    def test_should_read_verdict_value_from_next_line(self):
        result = parse_verdict("**VERDICT:**\nSupported\n**CONFIDENCE:**\n80%")

        assert result["verdict"] == "SUPPORTED"
        assert result["confidence"] == 4

    def test_should_stop_reasoning_at_next_label_and_skip_separators(self):
        result = parse_verdict("REASONING:\nfoo bar\n---\nVERDICT: REFUTED\nThat is all.")

        assert result["verdict"] == "REFUTED"
        assert result["reasoning"] == "foo bar"

    def test_should_keep_quote_text_intact(self):
        result = parse_verdict('VERDICT: SUPPORTED\nEVIDENCE_QUOTES:\n* "[X]: #MeToo trended in C#"\n1. "[Y]: -5°C"')

        assert result["evidence_quotes"] == ["[X]: #MeToo trended in C#", "[Y]: -5°C"]

    def test_should_default_to_not_enough_info_when_unparseable(self):
        assert parse_verdict("I cannot determine this.")["verdict"] == "NOT_ENOUGH_INFO"


class TestParseClaims:
    def test_should_parse_markdown_formatted_claims(self):
        claims = parse_claims(
            "**CLAIM:** Russia added 15,000 soldiers to its army.\n"
            "**ORIGINAL:** Putin adds 15,000 soldiers\n"
            "**TYPE:** factual\n"
            "**VERIFIABLE:** yes\n"
        )

        assert [c.text for c in claims] == ["Russia added 15,000 soldiers to its army."]
        assert claims[0].claim_type == "factual"
        assert claims[0].is_verifiable is True

    def test_should_parse_numbered_claims_with_values_on_next_line(self):
        claims = parse_claims("1. **Claim:**\nKyiv was hit by #2 missile wave\n2. **CLAIM:** Odesa port closed\n")

        assert [c.text for c in claims] == ["Kyiv was hit by #2 missile wave", "Odesa port closed"]
        assert [c.id for c in claims] == ["claim_001", "claim_002"]
