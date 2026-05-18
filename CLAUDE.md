# Audio Mixer App

A web-based multi-track audio mixer built with React, TypeScript, and the Web Audio API.

## Tech Stack

- **React** — UI components and state management
- **TypeScript** — strict typing throughout
- **Tailwind CSS** — utility-first styling
- **Web Audio API** — audio playback, routing, and processing (no external audio libraries)

## Features

- Multiple audio tracks loaded simultaneously
- Per-track volume and pan controls
- Global play / stop transport
- Waveform display for each track

## Project Structure

```
src/
  components/       # React UI components (Track, MixerBoard, WaveformDisplay, etc.)
  hooks/            # Custom React hooks (useAudioEngine, useTrack, etc.)
  audio/            # Web Audio API wrappers and audio graph utilities
  types/            # Shared TypeScript interfaces and types
  utils/            # Pure helper functions (dB conversion, time formatting, etc.)
```

## Dev Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # production build
npm run typecheck # run tsc --noEmit
npm run lint      # run ESLint
npm test          # run tests
```

## Architecture Notes

- The Web Audio API context lives in a single `AudioContext` instance managed by `useAudioEngine`. All track nodes connect through this shared context.
- Each track owns its own `GainNode` (volume) and `StereoPannerNode` (pan) wired in series before the master output.
- Waveform display reads from `AnalyserNode` data via `requestAnimationFrame` — do not block the render loop.
- Audio files are decoded once with `AudioContext.decodeAudioData` and stored as `AudioBuffer` — avoid re-decoding on play.

## Key Conventions

- TypeScript strict mode is on — no `any`, no non-null assertion without a comment explaining why.
- Tailwind only — no external CSS files or inline `style` props except for dynamic audio-driven values (e.g., waveform canvas dimensions).
- State that drives the audio graph (volume, pan, playback) must stay in sync: update both React state and the corresponding Web Audio node parameter immediately.
- Keep audio logic out of components — components call hooks, hooks call audio utilities.
