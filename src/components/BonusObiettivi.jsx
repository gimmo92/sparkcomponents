import { useState } from "react";

const STEPS = ["Assegna utenti", "Obiettivi"];

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

const REUSABLE_OBJECTIVES = [
  "On Time Delivery",
  "Gestione del cliente",
  "Soddisfazione del cliente",
  "Fatturato annuo",
  "Riduzione costi operativi",
  "Net Promoter Score",
];

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
        <div className="obj-head-actions">
          <button className="btn-edit" type="button">
            <span aria-hidden>✎</span> MODIFICA OBIETTIVO
          </button>
          <button className="btn-measure" type="button">
            <span aria-hidden>＋</span> AGGIUNGI MISURAZIONE
          </button>
        </div>
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

export default function BonusObiettivi() {
  const [objectives, setObjectives] = useState(INITIAL_OBJECTIVES);
  const [activeStep, setActiveStep] = useState(0);
  const [users, setUsers] = useState([
    "Verdi Martina (martinaverdi@tryspark.co) - Country Manager – Belgium",
  ]);
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [reuseChoice, setReuseChoice] = useState(REUSABLE_OBJECTIVES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const confirmReuse = () => {
    setObjectives((prev) => {
      if (prev.some((o) => o.name === reuseChoice)) return prev;
      return [
        ...prev,
        {
          id: ++nextRowId,
          name: reuseChoice,
          dataFine: "31/12/2026",
          target: "0,00",
          unita: "",
          tipologia: "Raggiungere",
          descrizione: "",
          peso: "0,00",
          modalita: "Lineare",
          rows: [{ id: ++nextRowId, livello: "0,00", payout: "100%" }],
        },
      ];
    });
    setShowReuseModal(false);
  };

  return (
    <div className="page">
      <div className="topbar">
        <span />
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
            <button
              key={label}
              type="button"
              className={`step${i <= activeStep ? " active" : ""}`}
              onClick={() => setActiveStep(i)}
            >
              <span className="dot" />
              <span className="lbl">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeStep === 0 ? (
        <div className="card">
          <h2 className="card-title">Assegna utenti al bonus</h2>
          <p className="card-sub">Definisci come assegnare il bonus ad ogni utente</p>

          <div className="field-block">
            <label className="fl">Titolo Bonus</label>
            <input className="input input--pill" defaultValue="Bonus  Martina Verdi 2025" />
          </div>

          <div className="field-block">
            <label className="fl">Assegnazione</label>
            <input className="input input--pill" defaultValue="Utenti" />
          </div>

          <div className="field-block">
            <label className="fl">Lista utenti</label>
            <div className="multiselect">
              <div className="ms-chips">
                {users.map((u) => (
                  <span className="chip" key={u}>
                    {u}
                    <button
                      type="button"
                      onClick={() => setUsers((prev) => prev.filter((x) => x !== u))}
                      aria-label="Rimuovi"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <span className="ms-placeholder">Seleziona utenti</span>
            </div>
          </div>

          <p className="hint">
            È possibile impostare l'importo bonus variabile dalle impostazioni utente
          </p>

          <div className="field-block">
            <label className="fl">Ciclo di riferimento</label>
            <input className="input input--pill" defaultValue="2025" />
          </div>

          <button
            className={`advanced-toggle${showAdvanced ? " open" : ""}`}
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
          >
            <span className="advanced-gear" aria-hidden>⚙</span>
            Avanzate
            <span className="advanced-caret" aria-hidden>▾</span>
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <div className="adv-section">
                <h3 className="adv-title">Soglia di accesso ai bonus</h3>
                <p className="adv-sub">Gestisci le soglie di accesso ai bonus (opzionale)</p>
                <select className="select input--pill" defaultValue="">
                  <option value="" disabled>
                    Seleziona un obiettivo per la soglia...
                  </option>
                  {objectives.map((o) => (
                    <option key={o.id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="adv-section">
                <h3 className="adv-title">Definisci Peso</h3>
                <p className="adv-sub">Imposta il peso del bonus (valore percentuale)</p>
                <label className="fl">Peso del bonus</label>
                <input className="input input--pill" defaultValue="100" />
                <p className="adv-hint">
                  Il peso determina l'importanza relativa di questo bonus
                </p>
              </div>
            </div>
          )}

          <div className="footer-actions">
            <button className="btn-back-ghost" type="button">
              ANNULLA
            </button>
            <button
              className="btn-primary"
              type="button"
              onClick={() => setActiveStep(1)}
            >
              CONTINUA
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="card-title">Scheda obiettivo</h2>

          <div className="obj-actions">
            <button className="btn-create" type="button">
              <span aria-hidden>＋</span> CREA OBIETTIVO
            </button>
            <button
              className="btn-reuse"
              type="button"
              onClick={() => setShowReuseModal(true)}
            >
              <span aria-hidden>⟳</span> RIUTILIZZA OBIETTIVO
            </button>
          </div>

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
      )}

      {showReuseModal && (
        <div className="modal-overlay" onClick={() => setShowReuseModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Riutilizza obiettivo</h3>
            <p className="modal-sub">
              Seleziona un obiettivo esistente da riutilizzare in questo bonus.
            </p>

            <label className="modal-label">Obiettivo</label>
            <select
              className="select"
              value={reuseChoice}
              onChange={(e) => setReuseChoice(e.target.value)}
            >
              {REUSABLE_OBJECTIVES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                className="btn-back-ghost"
                type="button"
                onClick={() => setShowReuseModal(false)}
              >
                ANNULLA
              </button>
              <button className="btn-primary" type="button" onClick={confirmReuse}>
                SELEZIONA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
