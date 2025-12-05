import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [videos, setVideos] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      const res = await fetch(`${API_BASE_URL}/videos`);
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      setErrorMsg("Could not load videos.");
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!url.trim()) {
      setErrorMsg("Please enter a valid YouTube URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error adding video.");
      }

      const newVideo = await res.json();

      setVideos((prev) => [newVideo, ...prev]);
      setUrl("");
      setInfoMsg("Video saved successfully.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Do you really want to delete this video?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Could not delete video.");
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  function getYoutubeUrl(video) {
    if (video.youtube_id) {
      return `https://www.youtube.com/watch?v=${video.youtube_id}`;
    }
    return video.url || "#";
  }

  return (
    <div className="page">
      <div className="appShell">
        <header className="appHeader">
          <div>
            <h1 className="title">
              <span className="logoCircle">▶</span> YouTube Links
            </h1>
            <p className="subtitle">
              Speichere deine Lieblingsvideos in einer schlanken Übersicht.
            </p>
          </div>
          <span className="techPill">FastAPI · React</span>
        </header>

        <main className="main">
          <section className="surface formCard">
            <h2 className="sectionTitle">Neues Video hinzufügen</h2>
            <form className="form" onSubmit={handleAdd}>
              <input
                className="input"
                type="url"
                placeholder="YouTube-URL einfügen…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className="button" disabled={loading}>
                {loading ? "Speichere…" : "Video speichern"}
              </button>
            </form>

            {errorMsg && <div className="alert alertError">{errorMsg}</div>}
            {infoMsg && <div className="alert alertInfo">{infoMsg}</div>}
          </section>

          <section className="surface listWrapper">
            <div className="listHeader">
              <div>
                <h2 className="sectionTitle">Gespeicherte Videos</h2>
                <p className="listSubtitle">
                  {videos.length > 0
                    ? "Klick auf ein Thumbnail, um das Video zu öffnen."
                    : "Noch keine Videos gespeichert."}
                </p>
              </div>
              <span className="counterBadge">
                {videos.length} gespeichert
              </span>
            </div>

            <div className="list">
              {videos.map((video) => (
                <article key={video.id} className="card">
                  {video.thumbnail_url && (
                    <a
                      href={getYoutubeUrl(video)}
                      target="_blank"
                      rel="noreferrer"
                      className="thumbWrapper"
                    >
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="thumbnail"
                      />
                      <span className="thumbOverlay">Ansehen</span>
                    </a>
                  )}

                  <div className="cardBody">
                    <h3 className="cardTitle" title={video.title}>
                      {video.title}
                    </h3>

                    <div className="metaRow">
                      {video.channel_title && (
                        <span className="chip">
                          Kanal: {video.channel_title}
                        </span>
                      )}

                      {video.duration && (
                        <span className="chip chipMuted">
                          Dauer: {video.duration}
                        </span>
                      )}
                    </div>

                    <div className="cardActions">
                      <a
                        className="primaryLink"
                        href={getYoutubeUrl(video)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Auf YouTube öffnen
                      </a>
                      <button
                        className="ghostButton"
                        onClick={() => handleDelete(video.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {videos.length === 0 && (
                <div className="emptyState">
                  <div className="emptyIcon">📺</div>
                  <h3>Keine Videos gespeichert</h3>
                  <p>Füge oben eine YouTube-URL ein, um zu starten.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
