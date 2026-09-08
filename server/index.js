import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate', async (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!prompt) {
    return res.status(400).json({ error: 'Add a prompt before generating an image.' });
  }
  if (prompt.length > 1000) {
    return res.status(400).json({ error: 'Prompts must be 1,000 characters or fewer.' });
  }

  const apiKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.IMAGE_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.IMAGE_MODEL || 'gpt-image-1';

  if (!apiKey) {
    return res.status(503).json({
      error: 'Image generation is not configured yet. Add IMAGE_API_KEY to your .env file.'
    });
  }

  try {
    const providerResponse = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, prompt, size: process.env.IMAGE_SIZE || '1024x1024', n: 1 })
    });

    const payload = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
      const providerMessage = payload?.error?.message || 'The image provider could not complete the request.';
      return res.status(providerResponse.status >= 400 && providerResponse.status < 500 ? 502 : 503)
        .json({ error: providerMessage });
    }

    const image = payload?.data?.[0];
    if (!image?.url && !image?.b64_json) {
      return res.status(502).json({ error: 'The image provider returned an unexpected response.' });
    }

    return res.json({
      image: image.url || `data:image/png;base64,${image.b64_json}`,
      prompt
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    return res.status(502).json({ error: 'Could not reach the image provider. Please try again.' });
  }
});

const clientDist = path.resolve(__dirname, '../dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(port, () => {
  console.log(`Lucid API listening on http://localhost:${port}`);
});
