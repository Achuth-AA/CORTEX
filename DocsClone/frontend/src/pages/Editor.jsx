import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { createSocket } from "../socket";

const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

export default function Editor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [title, setTitle] = useState("Untitled document");
  const [status, setStatus] = useState("Connecting…");
  const titleRef = useRef(title);
  titleRef.current = title;

  // ---- connect the socket once ----
  useEffect(() => {
    const s = createSocket();
    setSocket(s);
    s.on("connect", () => setStatus("Connected"));
    s.on("disconnect", () => setStatus("Reconnecting…"));
    return () => s.disconnect();
  }, []);

  // ---- mount Quill ----
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: "Start writing…",
    });
    q.disable();
    q.setText("Loading…");
    setQuill(q);
  }, []);

  // ---- load the document for this room ----
  useEffect(() => {
    if (socket == null || quill == null) return;

    const onLoad = ({ title: t, data }) => {
      setTitle(t || "Untitled document");
      quill.setContents(data || { ops: [] });
      quill.enable();
      setStatus("Connected");
    };
    socket.once("load-document", onLoad);
    socket.emit("get-document", { documentId });

    return () => socket.off("load-document", onLoad);
  }, [socket, quill, documentId]);

  // ---- receive remote changes ----
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => quill.updateContents(delta);
    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [socket, quill]);

  // ---- broadcast local changes ----
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, _old, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", { documentId, delta });
    };
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [socket, quill, documentId]);

  // ---- autosave (content + title) ----
  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", {
        documentId,
        data: quill.getContents(),
        title: titleRef.current,
      });
      setStatus("Saved");
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, quill, documentId]);

  // keep the browser tab title in sync
  useEffect(() => {
    document.title = `${title} — SyncScribe`;
  }, [title]);

  return (
    <div className="editor-page">
      <header className="editor-bar">
        <Link to="/" className="back" title="SyncScribe home">
          <span className="brand-mark sm">D</span>
        </Link>
        <Link to="/documents" className="home-btn" title="Back to your documents">
          🏠 <span>Home</span>
        </Link>
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          spellCheck={false}
          aria-label="Document title"
        />
        <span className={`status ${status === "Saved" || status === "Connected" ? "ok" : ""}`}>
          {status}
        </span>
      </header>

      <div className="editor-scroll">
        <div className="editor-container" ref={wrapperRef} />
      </div>
    </div>
  );
}
