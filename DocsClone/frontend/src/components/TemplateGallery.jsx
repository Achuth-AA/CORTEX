import React from "react";
import { TEMPLATES } from "../data/templates";

// A row of template cards. `onPick(template)` is called when one is chosen.
export default function TemplateGallery({ onPick, disabled }) {
  return (
    <div className="tpl-row">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          className="tpl-card"
          onClick={() => !disabled && onPick(t)}
          disabled={disabled}
          style={{ "--tpl": t.color }}
        >
          <span className="tpl-preview" aria-hidden>
            <span className="tpl-icon">{t.icon}</span>
            <span className="tpl-lines">
              <i /><i /><i /><i />
            </span>
          </span>
          <span className="tpl-meta">
            <strong>{t.name}</strong>
            <small>{t.desc}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
