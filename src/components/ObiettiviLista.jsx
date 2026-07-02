import { useState } from "react";

const NAV = [
  { icon: "ⓘ", label: "Profilo" },
  { icon: "▚", label: "Dashboard" },
  { icon: "👤", label: "La mia azienda", caret: true },
  { icon: "◎", label: "Obiettivi", active: true },
  { icon: "▤", label: "Competenze" },
  { icon: "◑", label: "Valutazioni", caret: true },
  { icon: "▦", label: "OKR", caret: true },
  { icon: "◍", label: "Bonus", caret: true },
  { icon: "◔", label: "Analisi di Clima", caret: true },
  { icon: "▧", label: "Formazione", caret: true },
];

const CARDS = [
  {
    id: 1,
    title: "Group EBITDA Adjusted",
    entro: "31/12/2025",
    valore: "2.000.000 / 1.000.000 €",
    progress: 100,
  },
  {
    id: 2,
    title: "Free Cash Flow",
    entro: "31/12/2025",
    valore: "100.000.000 / 10.000.000 €",
    progress: 100,
  },
  {
    id: 3,
    title: "Free Cash Flow",
    entro: "31/12/2027",
    valore: "0 / 10.000.000 €",
    progress: 2,
  },
  {
    id: 4,
    title: "Soddisfazione del cliente",
    entro: "31/12/2026",
    valore: "88,5 / 88,5 %",
    progress: 100,
  },
];

const FILTERS = [
  { label: "Ordina per", options: ["Titolo", "Data", "Stato"] },
  { label: "Tipo ordinamento", options: ["Crescente", "Decrescente"] },
  { label: "Stato obiettivo", options: ["In corso", "Completato", "Tutti"] },
  { label: "Assegnazione obiettivo", options: ["Aziendale", "Società", "Di team", "Utenti"] },
  { label: "Tipo di obiettivo", options: ["Tutti", "Quantitativo", "Qualitativo"] },
  { label: "Anno", options: ["Tutti gli anni", "2025", "2026", "2027"] },
];

export default function ObiettiviLista() {
  const [selected, setSelected] = useState([]);
  const allSelected = selected.length === CARDS.length;

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected(allSelected ? [] : CARDS.map((c) => c.id));

  return (
    <div className="ob-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">⚡</span> Spark
        </div>
        <span className="sidebar-section">SEZIONI</span>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item${item.active ? " active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.caret && <span className="nav-caret">▾</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="ob-main">
        <div className="ob-topbar">
          <div className="ob-top-actions">
            <button className="btn-primary btn-lg" type="button">
              NUOVO OBIETTIVO
            </button>
            <button className="btn-cyan" type="button">
              <span aria-hidden>⬇</span> ESPORTA OBIETTIVI
            </button>
          </div>
          <button className="gear" type="button" aria-label="Impostazioni">
            ⚙
          </button>
        </div>

        <div className="card ob-filters">
          {FILTERS.map((f) => (
            <div className="field-block ob-filter" key={f.label}>
              <label className="fl fl--sm">{f.label}</label>
              <select className="select input--pill">
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <label className="ob-select-all">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          <span className="cb" />
          Seleziona tutti
        </label>

        <div className="ob-grid">
          {CARDS.map((c) => (
            <div className="ob-card" key={c.id}>
              <div className="ob-card-head">
                <label className="ob-check">
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                  <span className="cb" />
                  <span className="ob-card-title">{c.title}</span>
                </label>
                <div className="ob-card-icons">
                  <button type="button" aria-label="Duplica">⧉</button>
                  <button type="button" aria-label="Elimina">✕</button>
                </div>
              </div>

              <p className="ob-line">
                Entro il: <strong>{c.entro}</strong>
              </p>
              <p className="ob-line">
                Ultimo valore: <strong>{c.valore}</strong>
              </p>

              <div className="ob-progress">
                <span style={{ width: `${c.progress}%` }} />
              </div>

              <div className="ob-card-actions">
                <button className="btn-edit" type="button">MODIFICA INFORMAZIONI</button>
                <button className="btn-measure" type="button">AGGIORNA MISURAZIONI</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
