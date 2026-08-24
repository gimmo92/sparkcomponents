import { useState } from "react";
import PillsMultiSelect from "./PillsMultiSelect";

export const BONUS_USERS = [
  { id: "bianchi-chiara", label: "Bianchi Chiara (chiarabianchi@tryspark.co) - Country Manager – Spain" },
  { id: "basso-gianmarco", label: "Basso Gianmarco (adminbeta@tryspark.co) - COO" },
  { id: "bianchi-giulio", label: "Bianchi Giulio (giuliobianchi@tryspark.co) - CTO" },
  { id: "verdi-martina", label: "Verdi Martina (martinaverdi@tryspark.co) - HR Manager" },
  { id: "rossi-marco", label: "Rossi Marco (marcorossi@tryspark.co) - Sales Director" },
  { id: "bianchi-giulia", label: "Bianchi Giulia (giuliabianchi@tryspark.co) - Marketing Lead" },
];

export const DEFAULT_OBJECTIVES = [
  {
    id: 1,
    name: "On Time Delivery",
    dataFine: "31/12/2026",
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

const REUSABLE_OBJECTIVES = [
  "On Time Delivery",
  "Gestione del cliente",
  "Soddisfazione del cliente",
  "Fatturato annuo",
  "Riduzione costi operativi",
  "Net Promoter Score",
];

const STEPS = ["Assegna utenti", "Obiettivi"];

let nextLocalId = 5000;

export function cloneObjectives(source = DEFAULT_OBJECTIVES) {
  return JSON.parse(JSON.stringify(source)).map((obj) => ({
    ...obj,
    id: ++nextLocalId,
    rows: obj.rows.map((row) => ({ ...row, id: ++nextLocalId })),
  }));
}

export function userLabel(id) {
  return BONUS_USERS.find((u) => u.id === id)?.label.split(" (")[0] ?? id;
}

function DetailRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </>
  );
}

function ObjectiveBlock({ obj, onChange, onAddRow, onRemoveRow, readOnly }) {
  return (
    <div className="obj">
      <div className="obj-head">
        <h3 className="obj-name">{obj.name}</h3>
        {!readOnly && (
          <div className="obj-head-actions">
            <button className="btn-edit" type="button">
              <span aria-hidden>✎</span> MODIFICA OBIETTIVO
            </button>
            <button className="btn-measure" type="button">
              <span aria-hidden>＋</span> AGGIUNGI MISURAZIONE
            </button>
          </div>
        )}
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
            readOnly={readOnly}
            onChange={(e) => onChange({ ...obj, peso: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Modalità di calcolo:</label>
          <select
            className="select"
            value={obj.modalita}
            disabled={readOnly}
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
              readOnly={readOnly}
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
              readOnly={readOnly}
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
          {!readOnly && (
            <button
              className="btn-remove"
              type="button"
              onClick={() => onRemoveRow(obj.id, row.id)}
            >
              RIMUOVI
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button className="btn-add" type="button" onClick={() => onAddRow(obj.id)}>
          AGGIUNGI
        </button>
      )}
    </div>
  );
}

export function SchedaReadonly({ bonus }) {
  return (
    <div className="ab-readonly">
      <dl className="details">
        <DetailRow label="Titolo" value={bonus.title} />
        <DetailRow label="Ciclo" value={bonus.cycle} />
        <DetailRow
          label="Utenti"
          value={bonus.users.map(userLabel).join(", ") || "—"}
        />
        {bonus.weight && <DetailRow label="Peso bonus" value={`${bonus.weight}%`} />}
      </dl>
      {bonus.objectives.map((obj) => (
        <ObjectiveBlock key={obj.id} obj={obj} onChange={() => {}} onAddRow={() => {}} onRemoveRow={() => {}} readOnly />
      ))}
    </div>
  );
}

export default function BonusSchedaForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "ANNULLA",
  title = "Scheda bonus",
  subtitle,
  startStep = 0,
}) {
  const [activeStep, setActiveStep] = useState(startStep);
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [reuseChoice, setReuseChoice] = useState(REUSABLE_OBJECTIVES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (patch) => onChange({ ...value, ...patch });

  const updateObjective = (updated) =>
    update({
      objectives: value.objectives.map((o) => (o.id === updated.id ? updated : o)),
    });

  const addRow = (objId) =>
    update({
      objectives: value.objectives.map((o) =>
        o.id === objId
          ? { ...o, rows: [...o.rows, { id: ++nextLocalId, livello: "", payout: "" }] }
          : o
      ),
    });

  const removeRow = (objId, rowId) =>
    update({
      objectives: value.objectives.map((o) =>
        o.id === objId ? { ...o, rows: o.rows.filter((r) => r.id !== rowId) } : o
      ),
    });

  const confirmReuse = () => {
    if (value.objectives.some((o) => o.name === reuseChoice)) {
      setShowReuseModal(false);
      return;
    }
    update({
      objectives: [
        ...value.objectives,
        {
          id: ++nextLocalId,
          name: reuseChoice,
          dataFine: "31/12/2026",
          target: "0,00",
          unita: "",
          tipologia: "Raggiungere",
          descrizione: "",
          peso: "0,00",
          modalita: "Lineare",
          rows: [{ id: ++nextLocalId, livello: "0,00", payout: "100%" }],
        },
      ],
    });
    setShowReuseModal(false);
  };

  return (
    <div className="page">
      <div className="stepper-row">
        <button
          className="back-btn"
          type="button"
          aria-label="Indietro"
          onClick={() => (activeStep === 0 ? onCancel() : setActiveStep(0))}
        >
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
          <h2 className="card-title">{title}</h2>
          {subtitle && <p className="card-sub">{subtitle}</p>}

          <div className="field-block">
            <label className="fl" htmlFor="bonus-title">
              Titolo Bonus
            </label>
            <input
              id="bonus-title"
              className="input input--pill"
              value={value.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="es. Bonus Martina Verdi 2026"
            />
          </div>

          <div className="field-block">
            <PillsMultiSelect
              label="Lista utenti"
              placeholder="Seleziona utenti"
              options={BONUS_USERS}
              selected={value.users}
              onChange={(users) => update({ users })}
            />
          </div>

          <p className="hint">
            È possibile impostare l&apos;importo bonus variabile dalle impostazioni utente
          </p>

          <div className="field-block">
            <label className="fl" htmlFor="bonus-cycle">
              Ciclo di riferimento
            </label>
            <input
              id="bonus-cycle"
              className="input input--pill"
              value={value.cycle}
              onChange={(e) => update({ cycle: e.target.value })}
            />
          </div>

          <button
            className={`advanced-toggle${showAdvanced ? " open" : ""}`}
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
          >
            <span className="advanced-gear" aria-hidden>
              ⚙
            </span>
            Avanzate
            <span className="advanced-caret" aria-hidden>
              ▾
            </span>
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <div className="adv-section">
                <h3 className="adv-title">Soglia di accesso ai bonus</h3>
                <p className="adv-sub">Gestisci le soglie di accesso ai bonus (opzionale)</p>
                <select
                  className="select input--pill"
                  value={value.thresholdObjective}
                  onChange={(e) => update({ thresholdObjective: e.target.value })}
                >
                  <option value="">Seleziona un obiettivo per la soglia...</option>
                  {value.objectives.map((o) => (
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
                <input
                  className="input input--pill"
                  value={value.weight}
                  onChange={(e) => update({ weight: e.target.value })}
                />
                <p className="adv-hint">
                  Il peso determina l&apos;importanza relativa di questo bonus
                </p>
              </div>
            </div>
          )}

          <div className="footer-actions">
            <button className="btn-back-ghost" type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button className="btn-primary" type="button" onClick={() => setActiveStep(1)}>
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
            <button className="btn-reuse" type="button" onClick={() => setShowReuseModal(true)}>
              <span aria-hidden>⟳</span> RIUTILIZZA OBIETTIVO
            </button>
          </div>

          {value.objectives.map((obj) => (
            <ObjectiveBlock
              key={obj.id}
              obj={obj}
              onChange={updateObjective}
              onAddRow={addRow}
              onRemoveRow={removeRow}
            />
          ))}

          <div className="footer-actions">
            <button className="btn-back-ghost" type="button" onClick={() => setActiveStep(0)}>
              INDIETRO
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={!value.title.trim()}
              onClick={onSubmit}
            >
              {submitLabel}
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
