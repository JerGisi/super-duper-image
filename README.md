# Lucid — AI image studio

Lucid is a small React + Express image generation studio. The browser sends prompts to the local Express API, which keeps the provider API key on the server and returns the generated image to the gallery.

## Setup

Requirements: Node.js 18+ and an API key for an OpenAI-compatible image generation provider.

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
IMAGE_API_KEY=your_api_key_here
# Optional: defaults to OpenAI's API
IMAGE_API_BASE_URL=https://api.openai.com/v1
IMAGE_MODEL=gpt-image-1
IMAGE_SIZE=1024x1024
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

`OPENAI_API_KEY` is also accepted as a fallback for providers that use the conventional variable name. Never commit `.env`.

## Run

Start the API and Vite development server together:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For a production-style run, build the client and start the API with `NODE_ENV=production npm run build && NODE_ENV=production npm start`.

## API

`POST /api/generate` accepts `{ "prompt": "..." }`, validates a non-empty prompt up to 1,000 characters, and proxies the request to `IMAGE_API_BASE_URL/images/generations`. The endpoint supports providers returning either `url` or `b64_json` image data.
