import { useState } from 'react';

const starterPrompts = [
  'A quiet glasshouse floating above the clouds at sunrise',
  'A tiny ramen shop on a rainy neon-lit street',
  'A vintage botanical poster of a moonlit desert'
];

function SparkIcon() {
  return <span className="spark-icon" aria-hidden="true">✦</span>;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [gallery, setGallery] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async (event) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isGenerating) return;

    setError('');
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Generation failed. Please try again.');

      setGallery((current) => [
        { id: crypto.randomUUID(), image: data.image, prompt: data.prompt },
        ...current
      ]);
      setPrompt('');
    } catch (generationError) {
      setError(generationError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearStudio = () => {
    setPrompt('');
    setGallery([]);
    setError('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Lucid home">
          <span className="brand-mark"><SparkIcon /></span>
          <span>LUCID</span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" /> Studio mode
          <button className="clear-button" onClick={clearStudio} disabled={!prompt && !gallery.length}>
            Clear studio
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow"><SparkIcon /> AI IMAGE STUDIO</p>
          <h1>Make the <em>unseen</em><br />feel real.</h1>
          <p className="hero-copy">Turn a thought into a visual. Describe what you imagine and let Lucid bring it into focus.</p>
        </section>

        <section className="composer-section" aria-label="Image prompt">
          <form className="composer" onSubmit={generateImage}>
            <label htmlFor="prompt">Describe your image</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="A cinematic scene, an impossible place, a feeling..."
              maxLength={1000}
              rows={3}
              disabled={isGenerating}
            />
            <div className="composer-footer">
              <span className="character-count">{prompt.length} / 1,000</span>
              <button className="generate-button" type="submit" disabled={!prompt.trim() || isGenerating}>
                {isGenerating ? <><span className="spinner" /> Creating</> : <><SparkIcon /> Generate image</>}
              </button>
            </div>
          </form>
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="prompt-ideas">
            <span>Try a starting point</span>
            {starterPrompts.map((idea) => (
              <button key={idea} onClick={() => setPrompt(idea)} disabled={isGenerating}>{idea}</button>
            ))}
          </div>
        </section>

        <section className="gallery-section" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR CREATIONS</p>
              <h2>{gallery.length ? 'A little more vivid.' : 'Your canvas is waiting.'}</h2>
            </div>
            {gallery.length > 0 && <span className="image-count">{gallery.length} {gallery.length === 1 ? 'image' : 'images'}</span>}
          </div>

          {gallery.length === 0 ? (
            <div className="empty-state">
              <div className="empty-orbit"><SparkIcon /></div>
              <p>Your generated images will appear here.</p>
              <span>Start with a feeling, a place, or a wild idea.</span>
            </div>
          ) : (
            <div className="gallery-grid">
              {gallery.map((item) => (
                <article className="image-card" key={item.id}>
                  <div className="image-frame">
                    <img src={item.image} alt={item.prompt} />
                    <a className="download-button" href={item.image} download={`lucid-${item.id}.png`} aria-label="Download image">↓</a>
                  </div>
                  <p>{item.prompt}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer><span>Lucid studio</span><span>Ideas, made visible.</span></footer>
    </div>
  );
}

export default App;
