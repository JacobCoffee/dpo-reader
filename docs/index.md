# DPO Reader

Turn Discourse threads into podcasts. Each author gets their own voice.

I built this because I got tired of skimming long forum threads. Point it at any Discourse URL and it synthesizes the whole thing with different voices for each participant. Listen while doing other things.

## Quick Start

`````{tab-set}
````{tab-item} Install
```bash
uv tool install dpo-reader
```
````

````{tab-item} Listen
```bash
dpo-reader listen "https://discuss.python.org/t/your-thread"
```
````

````{tab-item} TUI Player
```bash
dpo-reader listen "https://discuss.python.org/t/your-thread" --ui
```
````
`````

## Example Output

```
DPO Reader - Discourse to Audio

✓ Loaded: PEP 772: Packaging Council governance process (Round 3)
  Posts: 102 | Authors: 19
  Engine: openai

                Voice Assignments
┏━━━━━━━━━━━━━━┳━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Author       ┃ Posts ┃ Voice                  ┃
┡━━━━━━━━━━━━━━╇━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━┩
│ barry        │    21 │ Voice A (deeper tone)  │
│ pf_moore     │    20 │ Voice B (mid-range)    │
│ pradyunsg    │    10 │ Voice C (higher pitch) │
│ AA-Turner    │     7 │ Voice D (energetic)    │
│ tim.one      │     6 │ Voice E (calm)         │
│ jezdez       │     6 │ Voice F (gravelly)     │
│ dstufft      │     5 │ Voice G (brighter)     │
│ bernatgabor  │     5 │ Voice H (neutral)      │
│ willingc     │     5 │ Voice I (clear)        │
│ notatallshaw │     3 │ Voice J (relaxed)      │
│ trobitaille  │     3 │ Voice A (deeper tone)  │
│ sirosen      │     2 │ Voice B (mid-range)    │
│ hugovk       │     2 │ Voice C (higher pitch) │
│ rgommers     │     2 │ Voice D (energetic)    │
│ ncoghlan     │     1 │ Voice E (calm)         │
│ brettcannon  │     1 │ Voice F (gravelly)     │
│ steve.dower  │     1 │ Voice G (brighter)     │
│ BrenBarn     │     1 │ Voice H (neutral)      │
│ h-vetinari   │     1 │ Voice I (clear)        │
└──────────────┴───────┴────────────────────────┘

Launching player (generating audio in background)...
```

## Features

- **Multi-voice synthesis** - Each author gets assigned a unique voice
- **Three TTS engines** - OpenAI (best quality), Bark (local, neural), Piper (fast, CPU-only)
- **Start anywhere** - Jump to any post number via URL or `-s` flag
- **Interactive TUI** - Real-time read-along with playback controls
- **Web UI** - Browser-based player using Web Speech API
- **Caching** - Resume interrupted generations

## Contents

```{toctree}
:maxdepth: 2

usage
engines
changelog
api/index
```

## Installation

`````{tab-set}
````{tab-item} uv (recommended)
```bash
uv tool install dpo-reader
```
````

````{tab-item} pipx
```bash
pipx install dpo-reader
```
````

````{tab-item} With Piper
```bash
uv pip install dpo-reader[piper]
```
````
`````

## License

MIT
