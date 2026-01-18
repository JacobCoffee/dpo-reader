# DPO Reader - Claude Code Instructions

## Project Overview

Convert Discourse forum threads to multi-voice audio using TTS engines (OpenAI, Bark, Piper).

## Development

```bash
make dev          # Install dev dependencies
make ci           # Run lint -> fmt -> type-check -> test
make docs-serve   # Serve docs with live reload
```

## Release Process (Immutable Releases)

```bash
# Bump version and push tag
uv version --bump patch          # Bump to 0.1.1 (or minor/major)
git add pyproject.toml
git commit -m "chore: bump version to 0.1.1"
git tag v0.1.1
git push origin main --tags      # CD workflow auto-triggers
```

The CD workflow:

1. Builds distribution
2. Signs with Sigstore
3. Creates draft GitHub release with assets
4. Publishes to PyPI
5. Publishes release (removes draft status)
6. Creates PR for changelog update

## Pre-commit

Uses `prek` (faster pre-commit alternative):

```bash
uv tool install prek
prek install
```
