import { useState } from "react";
import "./Paste.css";

export default function CreatePaste() {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  async function submit() {
    const res = await fetch(import.meta.env.VITE_API + "/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
const pasteUrl = `${window.location.origin}/p/${data.id}`;
setUrl(pasteUrl);
  }

  return (
    <>
      <textarea onChange={e => setContent(e.target.value)} />
      <button onClick={submit}>Create</button>
      {url && <a href={url}>{url}</a>}
    </>
  );
}
