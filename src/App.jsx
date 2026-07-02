import { useState } from "react";
import "./App.css";

const STEPS = ["Assegna utenti", "Soglia", "Peso", "Obiettivi"];

const INITIAL_OBJECTIVES = [
  {
    id: 1,
    name: "On Time Delivery",
    dataFine: "31/12/2025",
    target: "95,00",
    unita: "% Percentuale",
    tipologia: "Raggiungere",
    descrizione: "% di progetti consegnati in tempo",
    peso: "30,00",
    modalita: "Lineare",
    rows: [
      { id: 11, livello: "76,00", payout: "85%" },
      { id: 12, livello: "95,00", payout: "100%" },
      { id: 13, livello: "98,00", payout: "150%" },
    ],
  },
  {
    id: 2,
    name: "Gestione del cliente",
    dataFine: "31/12/2026",
    target: "5,00",
    unita: "",
    tipologia: "Raggiungere",
    descrizione: "",
    peso: "30,00",
    modalita: "Lineare",
    rows: [
      { id: 21, livello: "4,25", payout: "85%" },
      { id: 22, livello: "5,00", payout: "100%" },
      { id: 23, livello: "6,00", payout: "150%" },
    ],
  },
  {
    id: 3,
    name: "Soddisfazione del cliente",
    dataFine: "31/12/2026",
    target: "88,50",
    unita: "% Percentuale",
    tipologia: "Raggiungere",
    descrizione: "",
    peso: "40,00",
    modalita: "Lineare",
    rows: [
      { id: 31, livello: "70,00", payout: "85%" },
      { id: 32, livello: "88,50", payout: "100%" },
      { id: 33, livello: "97,00", payout: "150%" },
    ],
  },
];

let nextRowId = 1000;

function DetailRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function ObjectiveBlock({ obj, onChange, onAddRow, onRemoveRow }) {
  return (
    <div className="obj">
      <div className="obj-head">
        <h3 className="obj-name">{obj.name}</h3>
        <button className="btn-edit" type="button">
          <span aria-hidden>✎</span> MODIFICA OBIETTIVO
        </button>
      </div>

      <dl className="details">
        <DetailRow label="Data di fine" value={obj.dataFine} />
        <DetailRow label="Target" value={obj.target} />
        <DetailRow label="Unità di misura" value={obj.unita} />
        <DetailRow label="Tipologia obiettivo" value={obj.tipologia} />
        <DetailRow label="Descrizione" value={obj.descrizione} />
      </dl>

      <div className="field-row">
        <div className="field">
          <label>Peso obiettivo:</label>
          <input
            className="input"
            value={obj.peso}
            onChange={(e) => onChange({ ...obj, peso: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Modalità di calcolo:</label>
          <select
            className="select"
            value={obj.modalita}
            onChange={(e) => onChange({ ...obj, modalita: e.target.value })}
          >
            <option>Lineare</option>
            <option>A scaglioni</option>
            <option>A gradini</option>
          </select>
        </div>
      </div>

      {obj.rows.map((row) => (
        <div className="payout-row" key={row.id}>
          <div className="payout">
            <label>Livello di risultato (Target {obj.target})</label>
            <input
              className="input"
              value={row.livello}
              onChange={(e) =>
                onChange({
                  ...obj,
                  rows: obj.rows.map((r) =>
                    r.id === row.id ? { ...r, livello: e.target.value } : r
                  ),
                })
              }
            />
          </div>
          <div className="payout">
            <label>% Payout:</label>
            <input
              className="input"
              value={row.payout}
              onChange={(e) =>
                onChange({
                  ...obj,
                  rows: obj.rows.map((r) =>
                    r.id === row.id ? { ...r, payout: e.target.value } : r
                  ),
                })
              }
            />
          </div>
          <button
            className="btn-remove"
            type="button"
            onClick={() => onRemoveRow(obj.id, row.id)}
          >
            RIMUOVI
          </button>
        </div>
      ))}

      <button className="btn-add" type="button" onClick={() => onAddRow(obj.id)}>
        AGGIUNGI
      </button>
    </div>
  );
}

export default function App() {
  const [objectives, setObjectives] = useState(INITIAL_OBJECTIVES);
  const [activeStep] = useState(3);
  const [showReuse, setShowReuse] = useState(false);

  const updateObjective = (updated) =>
    setObjectives((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

  const addRow = (objId) =>
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === objId
          ? { ...o, rows: [...o.rows, { id: ++nextRowId, livello: "", payout: "" }] }
          : o
      )
    );

  const removeRow = (objId, rowId) =>
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === objId ? { ...o, rows: o.rows.filter((r) => r.id !== rowId) } : o
      )
    );

  const removeChip = (objId) =>
    setObjectives((prev) => prev.filter((o) => o.id !== objId));

  return (
    <div className="page">
      <div className="topbar">
        <h1 className="page-title">Bonus</h1>
        <button className="gear" type="button" aria-label="Impostazioni">
          ⚙
        </button>
      </div>

      <div className="stepper-row">
        <button className="back-btn" type="button" aria-label="Indietro">
          ←
        </button>
        <div className="stepper">
          {STEPS.map((label, i) => (
            <div key={label} className={`step${i <= activeStep ? " active" : ""}`}>
              <span className="dot" />
              <span className="lbl">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Seleziona obiettivi</h2>
        <p className="card-sub">
          Seleziona gli obiettivi e assegna peso per il calcolo del bonus
        </p>
        <p className="rule">
          LA SOMMA DEI PESI DEGLI OBIETTIVI ASSOCIATI AL BONUS DEVE ESSERE DEL 100%
        </p>

        <div className="obj-actions">
          <button className="btn-create" type="button">
            <span aria-hidden>＋</span> CREA OBIETTIVO
          </button>
          <button
            className={`btn-reuse${showReuse ? " active" : ""}`}
            type="button"
            onClick={() => setShowReuse((v) => !v)}
          >
            <span aria-hidden>⟳</span> RIUTILIZZA OBIETTIVO
          </button>
        </div>

        {showReuse && (
          <div className="chips">
            {objectives.map((o) => (
              <span className="chip" key={o.id}>
                {o.name}
                <button type="button" onClick={() => removeChip(o.id)} aria-label="Rimuovi">
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {objectives.map((obj) => (
          <ObjectiveBlock
            key={obj.id}
            obj={obj}
            onChange={updateObjective}
            onAddRow={addRow}
            onRemoveRow={removeRow}
          />
        ))}

        <div className="footer-actions">
          <button className="btn-back-ghost" type="button">
            INDIETRO
          </button>
          <button className="btn-primary" type="button">
            AGGIORNA BONUS
          </button>
        </div>
      </div>
    </div>
  );
}
