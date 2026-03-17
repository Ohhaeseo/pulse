# AGENT: Environment Management Guide

This file serves as a guide for the AI Agent to manage the PULSE project environment.

## OpenAI Docs MCP

Always use the OpenAI developer documentation MCP server if you need to work with the OpenAI API, ChatGPT Apps SDK, or Codex, unless the user explicitly asks for a different source.

## Context7 MCP

Always use Context7 when you need library or framework documentation, setup steps, configuration details, or current package usage examples, unless the official vendor documentation is more authoritative.

## Skill Directory

Use `./.agents/skills` as the canonical repository skill directory.
Do not recreate `./.agent/skills`; the repository now uses the official `.agents/skills` layout.

## One-Click Startup (Recommended)

To verify the environment for all submodules (Frontend, Backend, AI), run the following workflow:

`view_file .agents/workflows/agent_startup.md`
(or if supported, run it directly)

## Manual Verification Steps

If you need to verify manually, follow these steps:

### 1. Python (AI Server)
- **Path**: `c:\PULSE\pulse_python`
- **Activation**: **MUST** activate virtual environment:
  - Windows: `.venv\Scripts\activate`
  - Mac/Linux: `source .venv/bin/activate`
- **Check Script**: Run `python check_env.py`
  - Checks Python version
  - Checks `requirements.txt` packages
  - Checks CUDA/GPU availability

### 2. Spring Boot (Main Backend)
- **Path**: `c:\PULSE\pulse_spring`
- **Build Check**: `./gradlew.bat clean build -x test`

### 3. Frontend (React)
- **Path**: `c:\PULSE\pulse_FE`
- **Dependency Check**: `npm list`

## Dependency Management

- Always check `requirements.txt`, `build.gradle`, and `package.json` before starting work.
- If a dependency is missing, install it and update the configuration file immediately.

## Troubleshooting

- **MongoDB Connection**: Ensure `mongod` is running. Check `.env` in `pulse_python` for `MONGO_URI`.
- **CUDA/GPU**: If `check_env.py` reports "CUDA is NOT available", pytorch will fall back to CPU. This is acceptable for dev but slower.
