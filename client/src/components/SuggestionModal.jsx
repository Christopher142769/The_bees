import { useState } from "react";
import { api } from "../api";

export default function SuggestionModal({ member, onClose }) {
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const needsEmail = member.gender === "femme";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.postSuggestion({
        memberId: member._id,
        content,
        email: needsEmail ? email : "",
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Erreur d’envoi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="suggest-title"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <>
            <h3 id="suggest-title">Merci</h3>
            <p className="sub">
              Votre message a bien été transmis au bureau. Les suggestions sont
              lues par l’équipe The BEES.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={onClose}>
                Fermer
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 id="suggest-title">Suggestion ou question</h3>
            <p className="sub">
              Pour <strong>{member.name}</strong>
              {needsEmail ? (
                <>
                  {" "}
                  — une adresse e-mail est requise pour que nous puissions
                  traiter votre demande de façon appropriée.
                </>
              ) : (
                <>
                  {" "}
                  — votre message est envoyé de façon anonyme. Seule l’équipe
                  The BEES le consulte.
                </>
              )}
            </p>
            {needsEmail && (
              <>
                <label htmlFor="sug-email">Votre e-mail</label>
                <input
                  id="sug-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                />
              </>
            )}
            <label htmlFor="sug-body">Votre message</label>
            <textarea
              id="sug-body"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Votre idée, question ou suggestion…"
            />
            {error && <p className="error-text">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-muted" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
