import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, assetUrl } from "../api";
import MemberOrbitPhoto from "../components/MemberOrbitPhoto.jsx";
import SuggestionModal from "../components/SuggestionModal.jsx";

const BLOCKS = [
  {
    key: "quiJeSuis",
    title: "Qui je suis vraiment en dehors du BDE",
    subtitle:
      "Mon parcours, ma personnalité et ce qui m’a construit.",
  },
  {
    key: "ceQuiMeMotive",
    title: "Ce qui me motive profondément aujourd’hui",
    subtitle: "Mes valeurs, mon moteur et ce qui me fait avancer.",
  },
  {
    key: "mesForces",
    title: "Ce que je fais concrètement mieux que la moyenne",
    subtitle: "Mes forces réelles et mes compétences utiles.",
  },
  {
    key: "quandMeVoir",
    title: "Les situations dans lesquelles les étudiants peuvent venir me voir",
    subtitle: "Mon aide concrète et mon accessibilité.",
  },
  {
    key: "vision",
    title: "Ce que je veux changer ou apporter cette année",
    subtitle: "Ma vision et mon engagement.",
  },
];

export default function Member() {
  const { slug } = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    setError("");
    api
      .getMember(slug)
      .then(setMember)
      .catch(() => {
        setMember(null);
        setError("Membre introuvable.");
      });
  }, [slug]);

  if (error || !member) {
    return (
      <div className="page member-page">
        <div className="bio-blocks">
          <p className="bio-empty">{error || "Chargement…"}</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 24, display: "inline-flex" }}>
            Retour à l’accueil
          </Link>
        </div>
      </div>
    );
  }

  const photoUrl = member.photoPath ? assetUrl(member.photoPath) : "";

  return (
    <div className="page member-page">
      <div className="member-hero">
        <div className="member-hero-visual">
          <MemberOrbitPhoto src={photoUrl} name={member.name} />
        </div>
        <div className="member-hero-text">
          <h1>{member.name}</h1>
          <span className="role">{member.role || "Membre du BDE"}</span>
          <div className="member-hero-actions">
            <button
              type="button"
              className="btn-card btn-card-secondary"
              onClick={() => setShowSuggest(true)}
            >
              Suggestions
            </button>
            <Link to="/#membres" className="btn-card btn-card-primary">
              Tous les membres
            </Link>
          </div>
        </div>
      </div>

      <div className="bio-blocks">
        {BLOCKS.map(({ key, title, subtitle }) => (
          <section key={key} className="bio-block">
            <h2>{title}</h2>
            <p className="bio-block-sub">{subtitle}</p>
            {member[key]?.trim() ? (
              <p>{member[key]}</p>
            ) : (
              <p className="bio-empty">Cette section sera bientôt complétée.</p>
            )}
          </section>
        ))}
      </div>

      {showSuggest && (
        <SuggestionModal member={member} onClose={() => setShowSuggest(false)} />
      )}
    </div>
  );
}
