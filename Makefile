.DEFAULT_GOAL := help
.PHONY: help install install-global dev test lint type-check fmt clean preview info test-listen test-bark web ci docs docs-serve docs-clean

TEST_URL := "https://discuss.python.org/t/c-api-for-querying-whether-the-gil-is-enabled-pyinterpreterstate-isgilenabled/"

##@ Help

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation

install: ## Install with piper TTS (local dev)
	@if [ -d ".venv" ]; then \
		echo "Using existing .venv"; \
	else \
		uv venv --python 3.13; \
	fi
	uv pip install -e ".[piper]"

install-global: ## Install as global tool (available as `dpo-reader`)
	uv tool install --python 3.13 -e ".[piper]"

dev: ## Install with all dev dependencies
	@if [ -d ".venv" ]; then \
		echo "Using existing .venv"; \
	else \
		uv venv --python 3.13; \
	fi
	uv sync
	uv pip install -e ".[piper]"

install-bark: ## Install with bark TTS (GPU recommended)
	@if [ -d ".venv" ]; then \
		echo "Using existing .venv"; \
	else \
		uv venv --python 3.13; \
	fi
	uv pip install -e ".[bark]"

##@ Development

test: ## Run tests
	uv run pytest

lint: ## Lint with ruff
	uv run ruff check src/
	uv run ruff format --check src/

type-check: ## Type check with ty
	uv run ty check src/

fmt: ## Format code
	uv run ruff format src/
	uv run ruff check --fix src/

clean: ## Clean build artifacts
	rm -rf .venv __pycache__ src/*.egg-info .pytest_cache .ruff_cache *.wav
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

##@ CI

ci: lint type-check test ## Run all CI checks (lint, type-check, test)

##@ Testing

preview: ## Preview thread content (no TTS)
	uv run dpo-reader preview $(TEST_URL)

info: ## Get thread info
	uv run dpo-reader info $(TEST_URL)

test-listen: ## Test listen with piper (3 posts)
	uv run dpo-reader listen $(TEST_URL) -n 3 -o test.wav -e piper --no-play

test-bark: ## Test listen with bark (3 posts)
	uv run dpo-reader listen $(TEST_URL) -n 3 -o test-bark.wav -e bark --no-play

##@ Web

web: ## Serve web frontend
	cd web && uv run python -m http.server 8080

##@ Documentation

docs-clean: ## Clean built documentation
	@echo "=> Cleaning documentation build assets"
	@rm -rf docs/_build
	@echo "=> Removed existing documentation build assets"

docs: docs-clean ## Build documentation
	@echo "=> Building documentation"
	uv sync
	uv run sphinx-build -M html docs docs/_build/ -E -a -j auto --keep-going

docs-serve: docs-clean ## Serve documentation with live reload
	@echo "=> Serving documentation"
	uv sync
	uv run sphinx-autobuild docs docs/_build/ -j auto --open-browser
