import { useState } from "react";

const TYPES = [
  {
    id: "quantitativo",
    icon: "📊",
    title: "Quantitativo",
    desc: "Misurabile con un valore numerico",
  },
  {
    id: "qualitativo-prog",
    icon: "💡",
    title: "Qualitativo progettuale",
    desc: "Basato su milestone di progetto",
  },
  {
    id: "qualitativo-svil",
    icon: "🎯",
    title: "Qualitativo di sviluppo",
    desc: "Orientato alla crescita personale",
  },
];

const ACCESS_LEVELS = [
  { id: "aziendale", icon: "🏢", label: "Aziendale" },
  { id: "societa", icon: "🏛️", label: "Società" },
  { id: "team", icon: "👥", label: "Di team" },
  { id: "utenti", icon: "👤", label: "Utenti" },
];

const OTHER_OBJECTIVES = [
  { name: "Fare 80% dei debrief di lavori comprese le gare", weight: "35.00%" },
  { name: "Migliorare la gestione operativa del sistema di ticketing...", weight: "30.00%" },
  { name: "Migliorare la documentazione aziendale via Wrike", weight: "30.00%" },
  { name: "Redditività: EBITDA - Holding", weight: "5.00%" },
];

let nextId = 500;

export default function NuovoObiettivo() {
  const [type, setType] = useState("quantitativo");
  const [access, setAccess] = useState("aziendale");
  const [bonuses, setBonuses] = useState(["Bonus MBO Alan Mattioli 2026"]);
  const [levels, setLevels] = useState([
    { id: 1, livello: "0,00", payout: "100" },
    { id: 2, livello: "0,00", payout: "50" },
    { id: 3, livello: "0,00", payout: "120" },
  ]);

  const updateLevel = (id, field, value) =>
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const addLevel = () =>
    setLevels((prev) => [...prev, { id: ++nextId, livello: "0,00", payout: "0" }]);

  const removeLevel = (id) => setLevels((prev) => prev.filter((l) => l.id !== id));

  const removeBonus = (name) => setBonuses((prev) => prev.filter((b) => b !== name));

  return (
    <div className="page page--mbo">
      <div className="mbo-header">
        <span className="eyebrow">OBIETTIVI MBO</span>
        <div className="mbo-title-row">
          <button className="back-btn back-btn--plain" type="button" aria-label="Indietro">
            ←
          </button>
          <h1 className="mbo-title">Nuovo Obiettivo</h1>
        </div>
        <p className="mbo-sub">Definisci un nuovo obiettivo e assegna i privilegi di accesso.</p>
      </div>

      <div className="card card--mbo">
        <div className="field-block">
          <label className="fl">Titolo obiettivo</label>
          <input className="input input--pill" placeholder="es. Vendite mensili Q4" />
        </div>

        <div className="field-block">
          <label className="fl">
            Descrizione <span className="muted">(opzionale)</span>
          </label>
          <textarea
            className="textarea"
            rows={4}
            placeholder="es. Registra le vendite mensilmente e monitora la pipeline"
          />
        </div>

        <div className="field-block">
          <label className="fl">Tipologia obiettivo</label>
          <div className="type-grid">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`type-card${type === t.id ? " active" : ""}`}
                onClick={() => setType(t.id)}
              >
                <span className="type-icon">{t.icon}</span>
                <span className="type-title">{t.title}</span>
                <span className="type-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <div className="field-block">
            <label className="fl">Data di fine</label>
            <input className="input input--pill" defaultValue="31/12/2026" />
          </div>
          <div className="field-block">
            <label className="fl">Unità di misura</label>
            <input className="input input--pill" defaultValue="% Percentuale" />
          </div>
        </div>

        <div className="field-block">
          <label className="fl">Target</label>
          <input className="input input--pill" defaultValue="0,00" />
        </div>

        <div className="field-block">
          <label className="fl">Livello accesso obiettivo</label>
          <div className="segmented">
            {ACCESS_LEVELS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`seg${access === a.id ? " active" : ""}`}
                onClick={() => setAccess(a.id)}
              >
                <span aria-hidden>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card card--mbo">
        <div className="bonus-head">
          <span className="bonus-badge">📅</span>
          <div>
            <h3 className="bonus-title">Associa a un bonus</h3>
            <p className="bonus-sub">Bonus MBO Alan Mattioli 2026</p>
          </div>
        </div>

        <div className="bonus-grid">
          <div className="field-block">
            <label className="fl fl--sm">PESO OBIETTIVO</label>
            <input className="input input--pill" defaultValue="0,00" />
          </div>
          <div className="field-block">
            <label className="fl fl--sm">MODALITÀ DI CALCOLO</label>
            <select className="select input--pill">
              <option>Lineare</option>
              <option>A scaglioni</option>
              <option>A gradini</option>
            </select>
          </div>
          <div className="field-block">
            <label className="fl fl--sm">BONUS ASSEGNATI</label>
            <button className="input input--pill add-bonus" type="button">
              + Aggiungi bonus
            </button>
            <div className="bonus-chips">
              {bonuses.map((b) => (
                <span className="chip chip--soft" key={b}>
                  {b}
                  <button type="button" onClick={() => removeBonus(b)} aria-label="Rimuovi">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <label className="fl payout-heading">Livelli di payout</label>
        {levels.map((l) => (
          <div className="payout-row payout-row--mbo" key={l.id}>
            <div className="payout">
              <label className="fl fl--sm">Livello di risultato</label>
              <input
                className="input input--pill"
                value={l.livello}
                onChange={(e) => updateLevel(l.id, "livello", e.target.value)}
              />
            </div>
            <div className="payout">
              <label className="fl fl--sm">% Payout</label>
              <input
                className="input input--pill"
                value={l.payout}
                onChange={(e) => updateLevel(l.id, "payout", e.target.value)}
              />
            </div>
            <button
              className="btn-x"
              type="button"
              onClick={() => removeLevel(l.id)}
              aria-label="Rimuovi livello"
            >
              ✕
            </button>
          </div>
        ))}

        <button className="btn-add-level" type="button" onClick={addLevel}>
          <span aria-hidden>＋</span> Aggiungi livello
        </button>

        <div className="other-obj">
          <span className="fl fl--sm section-label">ALTRI OBIETTIVI ASSOCIATI A QUESTO BONUS</span>
          {OTHER_OBJECTIVES.map((o) => (
            <div className="other-row" key={o.name}>
              <span className="other-name">{o.name}</span>
              <span className="weight-badge">{o.weight}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mbo-footer">
        <button className="btn-cancel" type="button">
          Annulla
        </button>
        <button className="btn-cta" type="button">
          <span aria-hidden>＋</span> Crea obiettivo
        </button>
      </div>
    </div>
  );
}
