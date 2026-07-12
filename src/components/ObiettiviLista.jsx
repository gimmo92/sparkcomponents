import { useEffect, useMemo, useRef, useState } from "react";
import PillsMultiSelect from "./PillsMultiSelect";

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

function userLabel(u) {
  return `${u.name} (${u.email}) - ${u.role}`;
}

const USERS = [
  {
    id: "bianchi-chiara",
    name: "Bianchi Chiara",
    email: "chiarabianchi@tryspark.co",
    role: "Country Manager - Spain",
  },
  {
    id: "basso-gianmarco",
    name: "Basso Gianmarco",
    email: "adminbeta@tryspark.co",
    role: "COO",
  },
  {
    id: "bianchi-giulio",
    name: "Bianchi Giulio",
    email: "giuliobianchi@tryspark.co",
    role: "CTO",
  },
  {
    id: "verdi-martina",
    name: "Verdi Martina",
    email: "martinaverdi@tryspark.co",
    role: "HR Manager",
  },
  {
    id: "rossi-marco",
    name: "Rossi Marco",
    email: "marcorossi@tryspark.co",
    role: "Sales Director",
  },
  {
    id: "bianchi-giulia",
    name: "Bianchi Giulia",
    email: "giuliabianchi@tryspark.co",
    role: "Marketing Lead",
  },
].map((u) => ({ ...u, label: userLabel(u) }));

const SOCIETA = [
  { id: "spark-holding", label: "Spark Holding" },
  { id: "spark-italia", label: "Spark Italia" },
  { id: "spark-labs", label: "Spark Labs" },
  { id: "spark-digital", label: "Spark Digital" },
];

const TEAMS = [
  { id: "finance", label: "Finance" },
  { id: "sales", label: "Sales" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
  { id: "hr", label: "HR" },
];

const ASSIGNMENT_CONFIG = {
  Utenti: {
    label: "Cerca per utenti",
    placeholder: "Seleziona utenti",
    options: USERS,
  },
  Società: {
    label: "Cerca per società",
    placeholder: "Seleziona società",
    options: SOCIETA,
  },
  "Di team": {
    label: "Cerca per team",
    placeholder: "Seleziona team",
    options: TEAMS,
  },
};

const CARDS = [
  {
    id: 1,
    title: "Group EBITDA Adjusted",
    entro: "31/12/2025",
    valore: "2.000.000 / 1.000.000 €",
    progress: 100,
    stato: "Completato",
    assegnazione: "Aziendale",
    tipo: "Quantitativo",
    anno: "2025",
  },
  {
    id: 2,
    title: "Free Cash Flow",
    entro: "31/12/2025",
    valore: "100.000.000 / 10.000.000 €",
    progress: 100,
    stato: "Completato",
    assegnazione: "Aziendale",
    tipo: "Quantitativo",
    anno: "2025",
  },
  {
    id: 3,
    title: "Free Cash Flow",
    entro: "31/12/2027",
    valore: "0 / 10.000.000 €",
    progress: 2,
    stato: "In corso",
    assegnazione: "Di team",
    team: "finance",
    tipo: "Quantitativo",
    anno: "2027",
  },
  {
    id: 4,
    title: "Soddisfazione del cliente",
    entro: "31/12/2026",
    valore: "88,5 / 88,5 %",
    progress: 100,
    stato: "In corso",
    assegnazione: "Società",
    societa: "spark-italia",
    tipo: "Qualitativo",
    anno: "2026",
  },
  {
    id: 5,
    title: "Riduzione churn clienti",
    entro: "30/06/2026",
    valore: "4,2 / 5,0 %",
    progress: 84,
    stato: "In corso",
    assegnazione: "Utenti",
    utenti: ["verdi-martina", "rossi-marco"],
    tipo: "Quantitativo",
    anno: "2026",
  },
  {
    id: 6,
    title: "Net Promoter Score",
    entro: "31/12/2026",
    valore: "72 / 80",
    progress: 90,
    stato: "In corso",
    assegnazione: "Utenti",
    utenti: ["bianchi-giulia"],
    tipo: "Qualitativo",
    anno: "2026",
  },
];

const FILTERS = [
  {
    id: "sortBy",
    label: "Ordina per",
    icon: "↕",
    options: ["Titolo", "Data", "Stato"],
    default: "Titolo",
  },
  {
    id: "sortDir",
    label: "Tipo ordinamento",
    icon: "⇅",
    options: ["Crescente", "Decrescente"],
    default: "Crescente",
  },
  {
    id: "stato",
    label: "Stato obiettivo",
    icon: "●",
    options: ["In corso", "Completato", "Tutti"],
    default: "In corso",
  },
  {
    id: "assegnazione",
    label: "Assegnazione",
    icon: "👤",
    options: ["Aziendale", "Società", "Di team", "Utenti", "Tutti"],
    default: "Aziendale",
  },
  {
    id: "tipo",
    label: "Tipo di obiettivo",
    icon: "◈",
    options: ["Tutti", "Quantitativo", "Qualitativo"],
    default: "Tutti",
  },
  {
    id: "anno",
    label: "Anno",
    icon: "📅",
    options: ["Tutti gli anni", "2025", "2026", "2027"],
    default: "Tutti gli anni",
  },
];

const DEFAULT_FILTER_VALUES = Object.fromEntries(
  FILTERS.map((f) => [f.id, f.default])
);

function parseDate(str) {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function FilterPill({ filter, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = value !== filter.default;

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="ob-filter-pill-wrap" ref={ref}>
      <button
        type="button"
        className={`ob-filter-pill${open ? " ob-filter-pill--open" : ""}${isActive ? " ob-filter-pill--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ob-filter-pill-icon" aria-hidden>
          {filter.icon}
        </span>
        <span className="ob-filter-pill-label">
          {isActive ? (
            <>
              <span className="ob-filter-pill-name">{filter.label}:</span>{" "}
              {value}
            </>
          ) : (
            filter.label
          )}
        </span>
        <span className="ob-filter-pill-chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="ob-filter-popover" role="listbox">
          {filter.options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              className={`ob-filter-option${value === option ? " ob-filter-option--selected" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
              {value === option && (
                <span className="ob-filter-option-check" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function cardMatchesAssignmentTarget(card, assegnazione, targets) {
  if (targets.length === 0) return true;
  if (assegnazione === "Utenti") {
    return card.utenti?.some((u) => targets.includes(u));
  }
  if (assegnazione === "Società") {
    return targets.includes(card.societa);
  }
  if (assegnazione === "Di team") {
    return targets.includes(card.team);
  }
  return true;
}

export default function ObiettiviLista() {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState(DEFAULT_FILTER_VALUES);
  const [assignmentTargets, setAssignmentTargets] = useState([]);

  const assegnazione = filterValues.assegnazione;
  const assignmentConfig = ASSIGNMENT_CONFIG[assegnazione];

  const visibleCards = useMemo(() => {
    let list = [...CARDS];

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((c) => c.title.toLowerCase().includes(query));
    }

    const { stato, tipo, anno, sortBy, sortDir } = filterValues;

    if (stato !== "Tutti") {
      list = list.filter((c) => c.stato === stato);
    }
    if (assegnazione !== "Tutti") {
      list = list.filter((c) => c.assegnazione === assegnazione);
      if (assignmentConfig) {
        list = list.filter((c) =>
          cardMatchesAssignmentTarget(c, assegnazione, assignmentTargets)
        );
      }
    }
    if (tipo !== "Tutti") {
      list = list.filter((c) => c.tipo === tipo);
    }
    if (anno !== "Tutti gli anni") {
      list = list.filter((c) => c.anno === anno);
    }

    const dir = sortDir === "Decrescente" ? -1 : 1;
    list.sort((a, b) => {
      if (sortBy === "Titolo") return a.title.localeCompare(b.title) * dir;
      if (sortBy === "Data") {
        return (parseDate(a.entro) - parseDate(b.entro)) * dir;
      }
      return a.stato.localeCompare(b.stato) * dir;
    });

    return list;
  }, [search, filterValues, assegnazione, assignmentConfig, assignmentTargets]);

  const visibleIds = visibleCards.map((c) => c.id);
  const allSelected =
    visibleCards.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected(allSelected ? [] : visibleIds);

  const setFilter = (id, value) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
    if (id === "assegnazione") setAssignmentTargets([]);
  };

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

          <div className="ob-topbar-right">
            <div className="ob-search-wrap">
              <span className="ob-search-icon" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                className="ob-search"
                placeholder="Cerca per nome obiettivo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="ob-search-clear"
                  aria-label="Cancella ricerca"
                  onClick={() => setSearch("")}
                >
                  ✕
                </button>
              )}
            </div>
            <button className="gear" type="button" aria-label="Impostazioni">
              ⚙
            </button>
          </div>
        </div>

        <div className="ob-toolbar">
          <div className="ob-filter-row">
            {FILTERS.map((f) => (
              <FilterPill
                key={f.id}
                filter={f}
                value={filterValues[f.id]}
                onChange={(v) => setFilter(f.id, v)}
              />
            ))}
          </div>

          {assignmentConfig && (
            <PillsMultiSelect
              label={assignmentConfig.label}
              placeholder={assignmentConfig.placeholder}
              options={assignmentConfig.options}
              selected={assignmentTargets}
              onChange={setAssignmentTargets}
            />
          )}
        </div>

        <label className="ob-select-all">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          <span className="cb" />
          Seleziona tutti
          {visibleCards.length !== CARDS.length && (
            <span className="ob-result-count">
              ({visibleCards.length} di {CARDS.length})
            </span>
          )}
        </label>

        {visibleCards.length === 0 ? (
          <div className="ob-empty">
            <p>Nessun obiettivo corrisponde ai filtri selezionati.</p>
          </div>
        ) : (
          <div className="ob-grid">
            {visibleCards.map((c) => (
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
                    <button type="button" aria-label="Duplica">
                      ⧉
                    </button>
                    <button type="button" aria-label="Elimina">
                      ✕
                    </button>
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
                  <button className="btn-edit" type="button">
                    MODIFICA INFORMAZIONI
                  </button>
                  <button className="btn-measure" type="button">
                    AGGIORNA MISURAZIONI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
