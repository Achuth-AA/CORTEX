import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

// Create a document (optionally from a template) and jump into the editor.
export function useCreateDoc() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const create = async (template) => {
    setCreating(true);
    setError("");
    try {
      const doc = await api.create(template?.title, template?.delta);
      navigate(`/documents/${doc.id}`);
    } catch (e) {
      setError(e.message);
      setCreating(false);
    }
  };

  return { create, creating, error };
}
