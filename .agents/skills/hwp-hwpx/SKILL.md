---
name: hwp-hwpx
description: "Work with Korean Hangul Word Processor documents: read, inspect, convert, create, clone, or safely edit .hwp and .hwpx files. Use when the user mentions HWP, HWPX, 한글파일, 한컴오피스, 공문, 기안문, 보고서, 회의록, 제안서, 양식 치환, HWP to HWPX conversion, text extraction from Korean office documents, or asks Codex to review/edit/propose changes for a Hangul document."
---

# HWP/HWPX Documents

Use this skill for Korean Hangul Word Processor files. HWPX is a ZIP package containing XML parts; preserve that package structure unless the user explicitly asks for a lossy text-only extraction.

Bundled scripts and templates are adapted for Codex from `https://github.com/jkf87/hwpx-skill` (upstream README states MIT).

## First Steps

1. Resolve this skill directory as `SKILL_DIR`, for example `.agents/skills/hwp-hwpx` in the PULSE repo.
2. Identify inputs and extensions before editing:
   - `.hwp`: convert to `.hwpx` first, then continue.
   - `.hwpx`: inspect or clone/edit directly.
   - Markdown/text: generate `.hwpx` using the bundled templates.
3. Prefer `python` on Windows and `python3` on Unix-like shells. Use a Python 3.11-3.13 virtual environment when installing `python-hwpx`; Python 3.14 may lack compatible prebuilt `lxml` wheels for this dependency chain. Do not add these packages to PULSE app requirements unless the user is integrating HWP/HWPX support into the application runtime.

Common dependencies:

```bash
python -m pip install -r ".agents/skills/hwp-hwpx/requirements.txt"
```

## Decision Rules

Choose the safest workflow:

- Convert `.hwp` to `.hwpx`: use `scripts/convert_hwp.py`.
- Read or summarize `.hwpx`: use `scripts/text_extract.py`; use markdown format when table/nested text matters.
- Fill an existing form or preserve layout: use `scripts/clone_form.py`; this is the default for complex files.
- Edit an existing `.hwpx`: unpack, make a minimal XML or ZIP-level text change, repack, then validate.
- Create a new `.hwpx`: use `scripts/build_hwpx.py` plus a template; for rich government-style documents, read `references/template-styles.md` and `references/xml-structure.md`.
- Review a public document or 공문서 text: read `references/gonmunseo-2025-writing-rules.md` before drafting or making suggestions.

Never replace `<hp:t>` nodes sequentially just because text appears in that order. That destroys runs and formatting. For form-like documents, clone the ZIP package and replace exact strings.

## Reading

Extract text:

```bash
python ".agents/skills/hwp-hwpx/scripts/text_extract.py" input.hwpx --format markdown --output extracted.md
```

If the input is `.hwp`, convert first:

```bash
python ".agents/skills/hwp-hwpx/scripts/convert_hwp.py" input.hwp -o input.hwpx
```

Use `--info --json` on `.hwp` when the user only wants metadata.

## Form Clone

Use this path when the document contains tables, images, official forms, signatures, stamps, fixed layouts, or anything the user wants to remain visually identical.

1. Analyze the source:

```bash
python ".agents/skills/hwp-hwpx/scripts/clone_form.py" --analyze source.hwpx
python ".agents/skills/hwp-hwpx/scripts/clone_form.py" source.hwpx --auto-analyze replacements-template.json
```

2. Create `replacements.json` with exact source text as keys and replacement text as values.
3. Clone:

```bash
python ".agents/skills/hwp-hwpx/scripts/clone_form.py" source.hwpx output.hwpx --map replacements.json --validate
python ".agents/skills/hwp-hwpx/scripts/fix_namespaces.py" output.hwpx
python ".agents/skills/hwp-hwpx/scripts/validate.py" output.hwpx
```

Use `--keywords keywords.json` only as a fallback after long phrase replacements; keyword replacements are applied inside `<hp:t>` text.

## Existing HWPX Edit

For narrow edits that cannot be expressed as a clone map:

```bash
python ".agents/skills/hwp-hwpx/scripts/office/unpack.py" input.hwpx unpacked
# edit the smallest required XML part
python ".agents/skills/hwp-hwpx/scripts/office/pack.py" unpacked output.hwpx
python ".agents/skills/hwp-hwpx/scripts/fix_namespaces.py" output.hwpx
python ".agents/skills/hwp-hwpx/scripts/validate.py" output.hwpx
```

Keep `mimetype` as the first ZIP entry and stored without compression. Validate all XML after edits.

## New HWPX

For straightforward Markdown-to-HWPX:

```bash
python ".agents/skills/hwp-hwpx/scripts/md2hwpx.py" input.md -o output.hwpx --template report --title "문서 제목"
python ".agents/skills/hwp-hwpx/scripts/fix_namespaces.py" output.hwpx
python ".agents/skills/hwp-hwpx/scripts/validate.py" output.hwpx
```

For rich cover pages, section bars, or images, import `scripts/hwpx_helpers.py` and build `section0.xml` explicitly. Read:

- `references/xml-structure.md` for required section, image, and table structure.
- `references/template-styles.md` before using template-specific style IDs.
- `references/report-style.md` or `references/official-doc-style.md` for report/public document styling.

## Verification

Always validate generated or edited `.hwpx` files:

```bash
python ".agents/skills/hwp-hwpx/scripts/validate.py" output.hwpx
python ".agents/skills/hwp-hwpx/scripts/verify_hwpx.py" --result output.hwpx
```

When cloning or editing an existing document, compare against the source:

```bash
python ".agents/skills/hwp-hwpx/scripts/verify_hwpx.py" --source source.hwpx --result output.hwpx --json verify-report.json
```

Treat validation failures as blockers. If validation passes but the document may be visually sensitive, mention the residual risk and recommend opening in Hancom Office or a trusted viewer for final visual inspection.

## Resource Map

- `scripts/convert_hwp.py`: HWP binary to HWPX conversion.
- `scripts/text_extract.py`: HWPX text extraction.
- `scripts/clone_form.py`: layout-preserving form cloning and text replacement.
- `scripts/build_hwpx.py`: template plus XML assembly.
- `scripts/fix_namespaces.py`: namespace and header count cleanup.
- `scripts/validate.py`: structural validation.
- `scripts/verify_hwpx.py`: source/result comparison.
- `templates/`: base, report, government, gonmun, minutes, proposal template XML.
- `assets/`: sample/reference HWPX templates.
- `references/`: HWPX format, XML internals, style IDs, public document rules, and troubleshooting.
