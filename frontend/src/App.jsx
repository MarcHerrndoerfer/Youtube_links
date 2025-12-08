import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [videos, setVideos] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  
  const [authMode, setAuthMode] = useState("login"); 
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");

  const [token, setToken] = useState(
    () => localStorage.getItem("access_token") || ""
  );

  useEffect(() => {
    if (token) {
      fetchVideos();
    } else {
      setVideos([]);
    }
  }, [token]);

  function getAuthHeaders() {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async function fetchVideos() {
    if (!token) {
      setErrorMsg("Please log in first.");
      return;
    }

    try {
      setErrorMsg("");
      const res = await fetch(`${API_BASE_URL}/videos`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("access_token");
        throw new Error("Not authorized. Please log in again.");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Could not load videos.");
      }

      const data = await res.json();
      setVideos(data);
    } catch (err) {
      setVideos([]);
      setErrorMsg(err.message || "Could not load videos.");
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!token) {
      setErrorMsg("Please log in first.");
      return;
    }

    if (!url.trim()) {
      setErrorMsg("Please enter a valid YouTube URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ url }),
      });

      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("access_token");
        throw new Error("Not authorized. Please log in again.");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error adding video.");
      }

      const newVideo = await res.json();

      setVideos((prev) => {
        const exists = prev.some((v) => v.id === newVideo.id);
        if (exists) return prev;
        return [newVideo, ...prev];
      });
      setUrl("");
      setInfoMsg("Video saved successfully.");
    } catch (err) {
      setErrorMsg(err.message || "Error adding video.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!token) {
      setErrorMsg("Please log in first.");
      return;
    }

    if (!window.confirm("Do you really want to delete this video?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (res.status === 401) {
        setToken("");
        localStorage.removeItem("access_token");
        throw new Error("Not authorized. Please log in again.");
      }

      if (!res.ok && res.status !== 204) {
        throw new Error("Could not delete video.");
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setErrorMsg(err.message || "Could not delete video.");
    }
  }

  function getYoutubeUrl(video) {
    if (video.youtube_id) {
      return `https://www.youtube.com/watch?v=${video.youtube_id}`;
    }
    return video.url || "#";
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    setAuthInfo("");
    setErrorMsg("");
    setInfoMsg("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError("Please enter e-mail and password.");
      return;
    }

    try {
      const body = new URLSearchParams();
      body.append("username", loginEmail);
      body.append("password", loginPassword);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Login failed.");
      }

      const data = await res.json();
      const accessToken = data.access_token;

      if (!accessToken) {
        throw new Error("No access_token in login response.");
      }

      localStorage.setItem("access_token", accessToken);
      setToken(accessToken);
      setAuthInfo("Login successful.");
      setAuthError("");
    } catch (err) {
      setToken("");
      localStorage.removeItem("access_token");
      setAuthError(err.message || "Login failed.");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError("");
    setAuthInfo("");

    if (!registerEmail.trim() || !registerPassword.trim()) {
      setAuthError("Please enter e-mail and password.");
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Registration failed.");
      }

      await res.json();

      setAuthInfo("Registration successful. You can now log in.");
      setAuthError("");
      setAuthMode("login");
      setLoginEmail(registerEmail);
      setRegisterPassword("");
      setRegisterPasswordConfirm("");
    } catch (err) {
      setAuthError(err.message || "Registration failed.");
    }
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem("access_token");
    setVideos([]);
    setInfoMsg("Logged out.");
    setErrorMsg("");
    setAuthInfo("");
    setAuthError("");
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
              Save your favorite videos in a clean overview.
            </p>
          </div>
          <span className="techPill">FastAPI · React</span>
        </header>

        <section className="surface formCard authCard">
          <div className="authCardHeader">
            <h2 className="sectionTitle">Your Account</h2>
            {token && <span className="smallBadge">Logged in</span>}
          </div>

          {!token && (
            <>
              <div className="authTabs">
                <button
                  type="button"
                  className={
                    "authTab" + (authMode === "login" ? " authTabActive" : "")
                  }
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthInfo("");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={
                    "authTab" + (authMode === "register" ? " authTabActive" : "")
                  }
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthInfo("");
                  }}
                >
                  Register
                </button>
              </div>

              {authMode === "login" && (
                <form className="form" onSubmit={handleLogin}>
                  <input
                    className="input"
                    type="email"
                    placeholder="E-mail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button className="button" type="submit">
                    Login
                  </button>
                </form>
              )}

              {authMode === "register" && (
                <form className="form" onSubmit={handleRegister}>
                  <input
                    className="input"
                    type="email"
                    placeholder="E-mail"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="Confirm password"
                    value={registerPasswordConfirm}
                    onChange={(e) =>
                      setRegisterPasswordConfirm(e.target.value)
                    }
                  />
                  <button className="button" type="submit">
                    Create account
                  </button>
                </form>
              )}
            </>
          )}

          {token && (
            <div className="authLoggedInRow">
              <div className="authLoggedInText">
                You are logged in. Your links are tied to your account.
              </div>
              <div className="authLoggedInActions">
                <button
                  type="button"
                  className="ghostButton"
                  onClick={fetchVideos}
                >
                  Reload videos
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {authError && <div className="alert alertError">{authError}</div>}
          {authInfo && <div className="alert alertInfo">{authInfo}</div>}
        </section>

        <main className="main">
          <section className="surface formCard">
            <h2 className="sectionTitle">Add New Video</h2>
            <form className="form" onSubmit={handleAdd}>
              <input
                className="input"
                type="url"
                placeholder={
                  token
                    ? "Paste YouTube URL…"
                    : "Please log in first, then paste a URL…"
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={!token}
              />
              <button className="button" disabled={loading || !token}>
                {loading ? "Saving…" : "Save Video"}
              </button>
            </form>

            {errorMsg && <div className="alert alertError">{errorMsg}</div>}
            {infoMsg && <div className="alert alertInfo">{infoMsg}</div>}
          </section>

          <section className="surface listWrapper">
            <div className="listHeader">
              <div>
                <h2 className="sectionTitle">Saved Videos</h2>
                <p className="listSubtitle">
                  {videos.length > 0
                    ? "Click on a thumbnail to open the video."
                    : token
                    ? "No videos saved yet."
                    : "Please log in to see your videos."}
                </p>
              </div>
              <span className="counterBadge">{videos.length} saved</span>
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
                      <span className="thumbOverlay">Watch</span>
                    </a>
                  )}

                  <div className="cardBody">
                    <h3 className="cardTitle" title={video.title}>
                      {video.title}
                    </h3>

                    <div className="metaRow">
                      {video.channel_title && (
                        <span className="chip">
                          Channel: {video.channel_title}
                        </span>
                      )}

                      {video.duration && (
                        <span className="chip chipMuted">
                          Duration: {video.duration}
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
                        Open on YouTube
                      </a>
                      <button
                        className="ghostButton"
                        onClick={() => handleDelete(video.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {videos.length === 0 && token && (
                <div className="emptyState">
                  <div className="emptyIcon">📺</div>
                  <h3>No videos saved</h3>
                  <p>Paste a YouTube URL above to get started.</p>
                </div>
              )}

              {videos.length === 0 && !token && (
                <div className="emptyState">
                  <div className="emptyIcon">🔒</div>
                  <h3>Not logged in</h3>
                  <p>Please log in above to see and save videos.</p>
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
