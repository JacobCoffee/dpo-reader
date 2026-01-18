# TTS Engines

DPO Reader supports three text-to-speech backends with different trade-offs.

## Bark (Default)

Neural TTS that runs locally. Produces natural-sounding speech with good intonation and emotion.

```bash
dpo-reader listen URL -e bark
```

- **Quality**: Excellent
- **Speed**: ~10 seconds per sentence
- **Hardware**: GPU recommended (MPS on Apple Silicon, CUDA on NVIDIA)
- **Install**: Included by default

Bark works without a GPU but runs slower. On Apple Silicon Macs, it uses Metal Performance Shaders automatically.

## OpenAI

Cloud-based TTS with the best quality. Requires an API key and costs money per character.

```bash
export OPENAI_API_KEY=sk-...
dpo-reader listen URL -e openai
```

- **Quality**: Best
- **Speed**: Fast (network-dependent)
- **Hardware**: Any (runs in cloud)
- **Cost**: ~$0.015 per 1K characters

Get an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

Available voices: alloy, echo, fable, onyx, nova, shimmer.

## Piper

Lightweight local TTS optimized for CPU. Good for batch processing or machines without GPUs.

```bash
uv pip install dpo-reader[piper]
dpo-reader listen URL -e piper
```

- **Quality**: Good
- **Speed**: ~0.1 seconds per sentence
- **Hardware**: CPU only (~50MB models)
- **Install**: `dpo-reader[piper]`

Piper uses ONNX runtime and works on any machine. Models download automatically on first use.

## Comparison

| Engine | Quality | Speed | Requirements |
|--------|---------|-------|--------------|
| OpenAI | Best | Fast | API key ($) |
| Bark | Excellent | Slow | GPU helps |
| Piper | Good | Fast | CPU only |
