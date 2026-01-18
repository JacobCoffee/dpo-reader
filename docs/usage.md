# Usage

## Basic Commands

### Listen to a Thread

```bash
dpo-reader listen "https://discuss.python.org/t/your-thread"
```

This fetches the thread, synthesizes audio with different voices per author, and plays it.

### Interactive TUI

```bash
dpo-reader listen "https://discuss.python.org/t/your-thread" --ui
```

The TUI shows the current post text alongside the author list. Audio generates in the background while you listen.

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ←/→ | Skip 5 seconds |
| ↑/↓ | Speed up/down |
| n/p | Next/Previous post |
| l | Toggle logs |
| q | Quit |

### Start from a Specific Post

Discourse URLs with a post number work automatically:

```bash
dpo-reader listen "https://discuss.python.org/t/topic/12345/50" --ui
```

Or use the `-s` flag:

```bash
dpo-reader listen "https://discuss.python.org/t/topic/12345" -s 50
```

### Export Without Playing

```bash
dpo-reader export "https://discuss.python.org/t/your-thread" -o thread.wav
```

### Preview and Info

See what you're getting into before generating audio:

```bash
# Show author stats and estimated duration
dpo-reader info "https://discuss.python.org/t/your-thread"

# Show first few posts
dpo-reader preview "https://discuss.python.org/t/your-thread"
```

## Options

```
-o, --output PATH         Output file (default: output.wav)
-e, --engine ENGINE       openai | bark | piper
-s, --start-post INT      Start from this post number
-n, --max-posts INT       Limit number of posts
--ui                      Interactive TUI with controls
--no-attribution          Skip "Author says:" prefix
--no-play                 Don't auto-play after generating
-c, --cache-dir PATH      Cache audio chunks (resume if generation crashes)
-p, --pause FLOAT         Seconds between posts (default: 1.5)
-f, --file PATH           Load from local JSON file (for testing)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Required for OpenAI engine |

You can also put these in a `.env` file in your working directory.

## Web UI (Experimental)

There's a browser-based player that uses Web Speech API for text-to-speech:

```bash
make web
```

This serves a local web interface at `http://localhost:8080`. Paste a Discourse URL and it will fetch the thread and play it using your browser's built-in TTS.

**Limitations:**
- Some Discourse instances block CORS requests from browsers
- Voice quality depends on your browser/OS speech synthesis
- For best results, use the CLI with Bark or OpenAI engines instead
