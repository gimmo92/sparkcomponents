import { useState } from "react";
import PillsMultiSelect from "./PillsMultiSelect";

const WIZARD_STEPS = ["Assegnazione", "Step del workflow", "Avvio e chiusura"];

const YEARS = Array.from({ length: 8 }, (_, i) => String(2024 + i));

const USERS = [
  { id: "bianchi-chiara", label: "Bianchi Chiara (chiarabianchi@tryspark.co)" },
  { id: "basso-gianmarco", label: "Basso Gianmarco (adminbeta@tryspark.co)" },
  { id: "bianchi-giulio", label: "Bianchi Giulio (giuliobianchi@tryspark.co)" },
  { id: "verdi-martina", label: "Verdi Martina (martinaverdi@tryspark.co)" },
  { id: "rossi-marco", label: "Rossi Marco (marcorossi@tryspark.co)" },
  { id: "bianchi-giulia", label: "Bianchi Giulia (giuliabianchi@tryspark.co)" },
];

const TEAMS = [
  { id: "finance", label: "Finance" },
  { id: "sales", label: "Sales" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
  { id: "hr", label: "HR" },
];

const SOCIETA = [
  { id: "spark-holding", label: "Spark Holding" },
  { id: "spark-italia", label: "Spark Italia" },
  { id: "spark-labs", label: "Spark Labs" },
  { id: "spark-digital", label: "Spark Digital" },
];

const ASSIGNMENT_TYPES = [
  { id: "utenti", icon: "👤", label: "Utenti" },
  { id: "team", icon: "👥", label: "Team" },
  { id: "aziendale", icon: "🏢", label: "Aziendale" },
  { id: "societa", icon: "🏛️", label: "Società" },
];

const STEP_META = {
  creazione: {
    title: "Creazione scheda",
    hint: "Chi può creare la scheda MBO.",
  },
  approva: {
    title: "Approvazione",
    hint: "Chi deve approvare la scheda in questo passaggio.",
  },
  "definisci-obiettivi": {
    title: "Definisci obiettivi",
    hint: "Chi definisce gli obiettivi della scheda in questo passaggio.",
  },
  conferma: {
    title: "Conferma scheda",
    hint: "Chi conferma e chiude la scheda.",
  },
};

const ADDABLE_KINDS = [
  { id: "approva", label: "Aggiungi approvazione", className: "btn-add-level" },
  { id: "definisci-obiettivi", label: "Aggiungi definisci obiettivi", className: "btn-reuse" },
];

const ASSIGNMENT_MULTI = {
  utenti: {
    label: "Utenti assegnati",
    placeholder: "Seleziona utenti",
    options: USERS,
  },
  team: {
    label: "Team assegnati",
    placeholder: "Seleziona team",
    options: TEAMS,
  },
  societa: {
    label: "Società assegnate",
    placeholder: "Seleziona società",
    options: SOCIETA,
  },
};

const emptyForm = () => ({
  title: "",
  cycle: "2026",
  assignment: "utenti",
  selected: { utenti: [], team: [], societa: [] },
  flowSteps: [
    { id: "create", kind: "creazione", locked: true, assignee: "manager", users: [] },
    { id: "confirm", kind: "conferma", locked: true, assignee: "manager", users: [] },
  ],
  startDate: "",
  endDate: "",
});

let nextId = 1;
let nextStepId = 10;

function assigneeLabel(step) {
  if (step.assignee === "manager") return "Manager";
  if (!step.users.length) return "Utenti";
  const names = step.users
    .map((id) => USERS.find((u) => u.id === id)?.label.split(" (")[0] ?? id)
    .join(", ");
  return names;
}

function assignmentSummary(form) {
  const type = ASSIGNMENT_TYPES.find((t) => t.id === form.assignment);
  if (form.assignment === "aziendale") return "Aziendale";
  const cfg = ASSIGNMENT_MULTI[form.assignment];
  const ids = form.selected[form.assignment] ?? [];
  const labels = ids
    .map((id) => cfg.options.find((o) => o.id === id)?.label)
    .filter(Boolean);
  if (!labels.length) return type?.label ?? "";
  return `${type.label}: ${labels.join(", ")}`;
}

function AssigneePicker({ step, onChange }) {
  return (
    <div className="wf-assignee">
      <div className="segmented segmented--2">
        <button
          type="button"
          className={`seg${step.assignee === "manager" ? " active" : ""}`}
          onClick={() => onChange({ ...step, assignee: "manager" })}
        >
          Manager
        </button>
        <button
          type="button"
          className={`seg${step.assignee === "utenti" ? " active" : ""}`}
          onClick={() => onChange({ ...step, assignee: "utenti" })}
        >
          Utenti
        </button>
      </div>
      {step.assignee === "utenti" && (
        <PillsMultiSelect
          label="Utenti dello step"
          placeholder="Seleziona utenti"
          options={USERS}
          selected={step.users}
          onChange={(users) => onChange({ ...step, users })}
        />
      )}
    </div>
  );
}

function WorkflowList({ workflows, onCreate }) {
  return (
    <div className="page page--wf">
      <div className="wf-list-head">
        <div>
          <span className="eyebrow">WORKFLOW MBO</span>
          <h1 className="wf-page-title">Workflow MBO</h1>
          <p className="wf-page-sub">
            Definisci i flussi di creazione, approvazione, obiettivi e conferma delle schede.
          </p>
        </div>
        <button className="btn-cta" type="button" onClick={onCreate}>
          <span aria-hidden>＋</span> Crea workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="wf-empty">
          <div className="wf-empty-icon" aria-hidden>
            ⟳
          </div>
          <h2>Nessun workflow ancora</h2>
          <p>Crea il primo workflow MBO per assegnare il ciclo e definire gli step.</p>
          <button className="btn-cta" type="button" onClick={onCreate}>
            <span aria-hidden>＋</span> Crea workflow
          </button>
        </div>
      ) : (
        <div className="wf-grid">
          {workflows.map((wf) => (
            <article className="wf-card" key={wf.id}>
              <div className="wf-card-head">
                <h3>{wf.title || "Workflow senza titolo"}</h3>
                <span className="weight-badge">{wf.cycle}</span>
              </div>
              <p className="ob-line">
                <strong>Assegnazione:</strong> {assignmentSummary(wf)}
              </p>
              <p className="ob-line">
                <strong>Step:</strong>{" "}
                {wf.flowSteps
                  .map((s) => `${STEP_META[s.kind]?.title ?? s.kind} (${assigneeLabel(s)})`)
                  .join(" → ")}
              </p>
              <p className="ob-line">
                <strong>Periodo:</strong>{" "}
                {wf.startDate || "—"} → {wf.endDate || "—"}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkflowMbo() {
  const [workflows, setWorkflows] = useState([]);
  const [creating, setCreating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(emptyForm);

  const startCreate = () => {
    setForm(emptyForm());
    setActiveStep(0);
    setCreating(true);
  };

  const cancel = () => {
    setCreating(false);
    setActiveStep(0);
  };

  const updateStep = (updated) =>
    setForm((prev) => ({
      ...prev,
      flowSteps: prev.flowSteps.map((s) => (s.id === updated.id ? updated : s)),
    }));

  const addFlowStep = (kind) =>
    setForm((prev) => {
      const confirm = prev.flowSteps[prev.flowSteps.length - 1];
      const middle = prev.flowSteps.slice(0, -1);
      return {
        ...prev,
        flowSteps: [
          ...middle,
          {
            id: `step-${++nextStepId}`,
            kind,
            locked: false,
            assignee: "manager",
            users: [],
          },
          confirm,
        ],
      };
    });

  const removeFlowStep = (id) =>
    setForm((prev) => ({
      ...prev,
      flowSteps: prev.flowSteps.filter((s) => s.id !== id || s.locked),
    }));

  const save = () => {
    setWorkflows((prev) => [...prev, { ...form, id: ++nextId }]);
    setCreating(false);
    setActiveStep(0);
  };

  if (!creating) {
    return <WorkflowList workflows={workflows} onCreate={startCreate} />;
  }

  const multi = ASSIGNMENT_MULTI[form.assignment];

  return (
    <div className="page">
      <div className="stepper-row">
        <button
          className="back-btn"
          type="button"
          aria-label="Indietro"
          onClick={() => (activeStep === 0 ? cancel() : setActiveStep((s) => s - 1))}
        >
          ←
        </button>
        <div className="stepper">
          {WIZARD_STEPS.map((label, i) => (
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

      {activeStep === 0 && (
        <div className="card card--wf">
          <h2 className="card-title">Assegnazione</h2>
          <p className="card-sub">Definisci titolo, ciclo e destinatari del workflow.</p>

          <div className="field-block">
            <label className="fl" htmlFor="wf-title">
              Titolo
            </label>
            <input
              id="wf-title"
              className="input input--pill"
              placeholder="es. Workflow MBO 2026"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="field-block">
            <label className="fl" htmlFor="wf-cycle">
              Ciclo di riferimento
            </label>
            <select
              id="wf-cycle"
              className="select input--pill"
              value={form.cycle}
              onChange={(e) => setForm((prev) => ({ ...prev, cycle: e.target.value }))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="field-block">
            <label className="fl">Assegnazione</label>
            <div className="segmented">
              {ASSIGNMENT_TYPES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`seg${form.assignment === a.id ? " active" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, assignment: a.id }))}
                >
                  <span aria-hidden>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>

          {form.assignment === "aziendale" ? (
            <p className="hint">Il workflow sarà assegnato a tutta l&apos;azienda.</p>
          ) : (
            <div className="field-block">
              <PillsMultiSelect
                label={multi.label}
                placeholder={multi.placeholder}
                options={multi.options}
                selected={form.selected[form.assignment]}
                onChange={(ids) =>
                  setForm((prev) => ({
                    ...prev,
                    selected: { ...prev.selected, [form.assignment]: ids },
                  }))
                }
              />
            </div>
          )}

          <div className="footer-actions">
            <button className="btn-back-ghost" type="button" onClick={cancel}>
              ANNULLA
            </button>
            <button className="btn-primary" type="button" onClick={() => setActiveStep(1)}>
              CONTINUA
            </button>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="card card--wf">
          <h2 className="card-title">Step del workflow</h2>
          <p className="card-sub">
            La creazione e la conferma scheda sono fisse. Aggiungi nel mezzo gli step di
            approvazione o definizione obiettivi.
          </p>

          <ol className="wf-flow">
            {form.flowSteps.map((step, index) => {
              const meta = STEP_META[step.kind];

              return (
                <li className="wf-flow-item" key={step.id}>
                  <div className="wf-flow-index">{index + 1}</div>
                  <div className="wf-flow-body">
                    <div className="wf-flow-head">
                      <div>
                        <h3 className="wf-flow-title">{meta.title}</h3>
                        {step.locked && <span className="wf-lock">Obbligatorio</span>}
                      </div>
                      {!step.locked && (
                        <div className="wf-flow-tools">
                          <select
                            className="select input--pill wf-kind-select"
                            value={step.kind}
                            onChange={(e) => updateStep({ ...step, kind: e.target.value })}
                          >
                            <option value="approva">Approvazione</option>
                            <option value="definisci-obiettivi">Definisci obiettivi</option>
                          </select>
                          <button
                            className="btn-x"
                            type="button"
                            aria-label="Rimuovi step"
                            onClick={() => removeFlowStep(step.id)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="wf-flow-hint">{meta.hint}</p>
                    <AssigneePicker step={step} onChange={updateStep} />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="wf-add-row">
            {ADDABLE_KINDS.map((kind) => (
              <button
                key={kind.id}
                className={kind.className}
                type="button"
                onClick={() => addFlowStep(kind.id)}
              >
                <span aria-hidden>＋</span> {kind.label}
              </button>
            ))}
          </div>

          <div className="footer-actions">
            <button className="btn-back-ghost" type="button" onClick={() => setActiveStep(0)}>
              INDIETRO
            </button>
            <button className="btn-primary" type="button" onClick={() => setActiveStep(2)}>
              CONTINUA
            </button>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="card card--wf">
          <h2 className="card-title">Avvio e chiusura</h2>
          <p className="card-sub">Imposta le date di inizio e fine del workflow.</p>

          <div className="field-row">
            <div className="field-block">
              <label className="fl" htmlFor="wf-start">
                Data di avvio workflow
              </label>
              <input
                id="wf-start"
                type="date"
                className="input input--pill"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="field-block">
              <label className="fl" htmlFor="wf-end">
                Data di chiusura
              </label>
              <input
                id="wf-end"
                type="date"
                className="input input--pill"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="footer-actions">
            <button className="btn-back-ghost" type="button" onClick={() => setActiveStep(1)}>
              INDIETRO
            </button>
            <button className="btn-primary" type="button" onClick={save}>
              CREA WORKFLOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
