import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Paste.css";

export default function ViewPaste() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_API + `/api/pastes/${id}`)
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return <pre>{data.content}</pre>;
}
