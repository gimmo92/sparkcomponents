import { useMemo, useState } from "react";
import BonusSchedaForm, {
  SchedaReadonly,
  cloneObjectives,
  userLabel,
} from "./BonusSchedaForm";

const ROLES = [
  { id: "hr", label: "HR", hint: "Crea, approva e monitora" },
  { id: "manager", label: "Manager", hint: "Compila le schede" },
  { id: "compliance", label: "Compliance", hint: "Approva o rifiuta" },
];

const STATUS = {
  MANAGER_FILL: "manager_fill",
  HR_APPROVE: "hr_approve",
  COMPLIANCE: "compliance",
  PUBLISHED: "published",
};

const PIPELINE = [
  { id: STATUS.MANAGER_FILL, label: "Manager", short: "Compilazione" },
  { id: STATUS.HR_APPROVE, label: "HR", short: "Approvazione HR" },
  { id: STATUS.COMPLIANCE, label: "Compliance", short: "Compliance" },
  { id: STATUS.PUBLISHED, label: "Pubblicato", short: "Lista bonus" },
];

const STATUS_META = {
  [STATUS.MANAGER_FILL]: { label: "Da compilare", tone: "warn" },
  [STATUS.HR_APPROVE]: { label: "In approvazione HR", tone: "info" },
  [STATUS.COMPLIANCE]: { label: "In approvazione Compliance", tone: "info" },
  [STATUS.PUBLISHED]: { label: "Pubblicato", tone: "ok" },
};

let nextBonusId = 10;

const emptyDraft = () => ({
  title: "",
  users: [],
  cycle: "2026",
  thresholdObjective: "",
  weight: "100",
  objectives: cloneObjectives(),
});

function nowStamp() {
  return new Date().toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function event(actor, action, note = "") {
  return { at: nowStamp(), actor, action, note };
}

function seedBonuses() {
  return [
    {
      id: 1,
      title: "Bonus Alan Mattioli 2026",
      users: ["basso-gianmarco"],
      cycle: "2026",
      thresholdObjective: "",
      weight: "100",
      objectives: cloneObjectives(),
      status: STATUS.MANAGER_FILL,
      rejection: null,
      history: [event("HR", "Creata scheda e inviata al manager")],
    },
    {
      id: 2,
      title: "Bonus Chiara Bianchi 2026",
      users: ["bianchi-chiara"],
      cycle: "2026",
      thresholdObjective: "",
      weight: "100",
      objectives: cloneObjectives(),
      status: STATUS.HR_APPROVE,
      rejection: null,
      history: [
        event("HR", "Creata scheda e inviata al manager"),
        event("Manager", "Scheda compilata e inviata ad HR"),
      ],
    },
    {
      id: 3,
      title: "Bonus Giulio Bianchi 2026",
      users: ["bianchi-giulio"],
      cycle: "2026",
      thresholdObjective: "",
      weight: "100",
      objectives: cloneObjectives(),
      status: STATUS.COMPLIANCE,
      rejection: null,
      history: [
        event("HR", "Creata scheda e inviata al manager"),
        event("Manager", "Scheda compilata e inviata ad HR"),
        event("HR", "Approvata"),
      ],
    },
    {
      id: 4,
      title: "Bonus Martina Verdi 2025",
      users: ["verdi-martina"],
      cycle: "2025",
      thresholdObjective: "",
      weight: "100",
      objectives: cloneObjectives(),
      status: STATUS.PUBLISHED,
      rejection: null,
      history: [
        event("HR", "Creata scheda e inviata al manager"),
        event("Manager", "Scheda compilata e inviata ad HR"),
        event("HR", "Approvata"),
        event("Compliance", "Approvata — bonus creato in lista"),
      ],
    },
  ];
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  return <span className={`ab-badge ab-badge--${meta.tone}`}>{meta.label}</span>;
}

function PipelineDots({ status }) {
  const current = PIPELINE.findIndex((s) => s.id === status);
  return (
    <ol className="ab-mini-pipe" aria-label="Avanzamento">
      {PIPELINE.map((step, i) => (
        <li
          key={step.id}
          className={`ab-mini-pipe-item${i < current ? " done" : ""}${i === current ? " current" : ""}`}
        >
          <span className="ab-mini-dot" />
          <span className="ab-mini-lbl">{step.short}</span>
        </li>
      ))}
    </ol>
  );
}

function RejectModal({ onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal modal--reject"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title" id="reject-title">
          Rifiuta scheda
        </h3>
        <p className="modal-sub">
          Indica il motivo del rifiuto. La scheda tornerà al manager per la ricompilazione.
        </p>
        <label className="modal-label" htmlFor="reject-reason">
          Motivazione
        </label>
        <textarea
          id="reject-reason"
          className="textarea"
          rows={5}
          placeholder="Scrivi il motivo del rifiuto..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button className="btn-back-ghost" type="button" onClick={onCancel}>
            ANNULLA
          </button>
          <button
            className="btn-remove"
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            CONFERMA RIFIUTO
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewWidget({ bonus, actorLabel, onApprove, onReject }) {
  return (
    <article className="ab-review">
      <header className="ab-review-head">
        <div>
          <span className="eyebrow">{actorLabel}</span>
          <h3 className="ab-review-title">{bonus.title}</h3>
          <p className="ab-review-meta">
            Ciclo {bonus.cycle} · {bonus.users.map(userLabel).join(", ") || "Nessun utente"}
          </p>
        </div>
        <StatusBadge status={bonus.status} />
      </header>

      {bonus.rejection && (
        <div className="ab-reject-banner">
          <strong>Ultimo rifiuto ({bonus.rejection.by}):</strong> {bonus.rejection.reason}
        </div>
      )}

      <SchedaReadonly bonus={bonus} />

      <div className="ab-review-actions">
        <button className="btn-remove" type="button" onClick={onReject}>
          RIFIUTA
        </button>
        <button className="btn-primary" type="button" onClick={onApprove}>
          APPROVA
        </button>
      </div>
    </article>
  );
}

function InboxCard({ bonus, actionLabel, onAction }) {
  return (
    <article className="ab-inbox-card">
      <div className="ab-inbox-top">
        <h3>{bonus.title}</h3>
        <StatusBadge status={bonus.status} />
      </div>
      <p className="ob-line">
        <strong>Utenti:</strong> {bonus.users.map(userLabel).join(", ") || "—"}
      </p>
      <p className="ob-line">
        <strong>Ciclo:</strong> {bonus.cycle}
      </p>
      <p className="ob-line">
        <strong>Obiettivi:</strong> {bonus.objectives.length}
      </p>
      {bonus.rejection && (
        <div className="ab-reject-banner ab-reject-banner--compact">
          <strong>Rifiutata da {bonus.rejection.by}:</strong> {bonus.rejection.reason}
        </div>
      )}
      <PipelineDots status={bonus.status} />
      {actionLabel && (
        <button className="btn-cta ab-inbox-cta" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </article>
  );
}

function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="wf-empty">
      <div className="wf-empty-icon" aria-hidden>
        ◍
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel && (
        <button className="btn-cta" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function ApprovazioneBonus() {
  const [role, setRole] = useState("hr");
  const [hrView, setHrView] = useState("crea");
  const [bonuses, setBonuses] = useState(seedBonuses);
  const [draft, setDraft] = useState(null);
  const [fillDraft, setFillDraft] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const counts = useMemo(
    () => ({
      manager: bonuses.filter((b) => b.status === STATUS.MANAGER_FILL).length,
      hr: bonuses.filter((b) => b.status === STATUS.HR_APPROVE).length,
      compliance: bonuses.filter((b) => b.status === STATUS.COMPLIANCE).length,
      published: bonuses.filter((b) => b.status === STATUS.PUBLISHED).length,
    }),
    [bonuses]
  );

  const patchBonus = (id, updater) =>
    setBonuses((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));

  const startCreate = () => {
    setDraft(emptyDraft());
    setHrView("crea");
  };

  const submitCreate = () => {
    const created = {
      ...draft,
      id: ++nextBonusId,
      status: STATUS.MANAGER_FILL,
      rejection: null,
      history: [event("HR", "Creata scheda e inviata al manager")],
    };
    setBonuses((prev) => [created, ...prev]);
    setDraft(null);
    setHrView("avanzamento");
  };

  const submitFill = () => {
    patchBonus(fillDraft.id, (b) => ({
      ...fillDraft,
      status: STATUS.HR_APPROVE,
      rejection: null,
      history: [...b.history, event("Manager", "Scheda compilata e inviata ad HR")],
    }));
    setFillDraft(null);
  };

  const approve = (id, actor) => {
    patchBonus(id, (b) => {
      if (actor === "HR") {
        return {
          ...b,
          status: STATUS.COMPLIANCE,
          history: [...b.history, event("HR", "Approvata")],
        };
      }
      return {
        ...b,
        status: STATUS.PUBLISHED,
        history: [...b.history, event("Compliance", "Approvata — bonus creato in lista")],
      };
    });
  };

  const confirmReject = (reason) => {
    const { id, by } = rejecting;
    patchBonus(id, (b) => ({
      ...b,
      status: STATUS.MANAGER_FILL,
      rejection: { by, reason, at: nowStamp() },
      history: [...b.history, event(by, "Rifiutata — torna al manager", reason)],
    }));
    setRejecting(null);
  };

  const hrNav = [
    { id: "crea", label: "Crea scheda" },
    { id: "approva", label: "Da approvare", count: counts.hr },
    { id: "avanzamento", label: "Avanzamento" },
    { id: "lista", label: "Lista bonus", count: counts.published },
  ];

  const managerQueue = bonuses.filter((b) => b.status === STATUS.MANAGER_FILL);
  const hrQueue = bonuses.filter((b) => b.status === STATUS.HR_APPROVE);
  const complianceQueue = bonuses.filter((b) => b.status === STATUS.COMPLIANCE);
  const published = bonuses.filter((b) => b.status === STATUS.PUBLISHED);

  if (draft) {
    return (
      <BonusSchedaForm
        value={draft}
        onChange={setDraft}
        onSubmit={submitCreate}
        onCancel={() => setDraft(null)}
        submitLabel="INVIA AI MANAGER"
        title="Crea scheda bonus"
        subtitle="HR: compila la scheda come in Bonus. Verrà inviata ai manager per la compilazione."
      />
    );
  }

  if (fillDraft) {
    return (
      <BonusSchedaForm
        value={fillDraft}
        onChange={setFillDraft}
        onSubmit={submitFill}
        onCancel={() => setFillDraft(null)}
        submitLabel="INVIA PER APPROVAZIONE"
        title="Compila scheda bonus"
        subtitle="Manager: completa la scheda e inviala ad HR per l'approvazione."
        startStep={1}
      />
    );
  }

  return (
    <div className="page page--wf page--ab">
      <div className="ab-head">
        <div>
          <span className="eyebrow">SCHEDE BONUS</span>
          <h1 className="wf-page-title">Creazione e approvazione</h1>
          <p className="wf-page-sub">
            HR crea la scheda, i manager la compilano, poi HR e Compliance approvano. Un
            rifiuto riporta la scheda al manager.
          </p>
        </div>
      </div>

      <div className="ab-rolebar" role="tablist" aria-label="Simula ruolo">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={role === r.id}
            className={`ab-role${role === r.id ? " active" : ""}`}
            onClick={() => setRole(r.id)}
          >
            <strong>{r.label}</strong>
            <span>{r.hint}</span>
          </button>
        ))}
      </div>

      {role === "hr" && (
        <>
          <nav className="ab-subnav" aria-label="Viste HR">
            {hrNav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ab-sub${hrView === item.id ? " active" : ""}`}
                onClick={() => setHrView(item.id)}
              >
                {item.label}
                {typeof item.count === "number" && (
                  <span className="ab-count">{item.count}</span>
                )}
              </button>
            ))}
          </nav>

          {hrView === "crea" && (
            <div className="wf-empty">
              <div className="wf-empty-icon" aria-hidden>
                ＋
              </div>
              <h2>Crea una nuova scheda bonus</h2>
              <p>
                Compila titolo, utenti, ciclo e obiettivi come nella scheda Bonus. La scheda
                comparirà nella lista da compilare dei manager.
              </p>
              <button className="btn-cta" type="button" onClick={startCreate}>
                <span aria-hidden>＋</span> Crea scheda bonus
              </button>
            </div>
          )}

          {hrView === "approva" &&
            (hrQueue.length === 0 ? (
              <EmptyState
                title="Nessuna scheda da approvare"
                text="Quando i manager avranno compilato le schede, le troverai qui."
              />
            ) : (
              <div className="ab-stack">
                {hrQueue.map((bonus) => (
                  <ReviewWidget
                    key={bonus.id}
                    bonus={bonus}
                    actorLabel="Approvazione HR"
                    onApprove={() => approve(bonus.id, "HR")}
                    onReject={() => setRejecting({ id: bonus.id, by: "HR" })}
                  />
                ))}
              </div>
            ))}

          {hrView === "avanzamento" && (
            <ProgressBoard
              bonuses={bonuses}
              counts={counts}
              expandedId={expandedId}
              onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            />
          )}

          {hrView === "lista" &&
            (published.length === 0 ? (
              <EmptyState
                title="Nessun bonus in lista"
                text="I bonus approvati da HR e Compliance compariranno qui."
              />
            ) : (
              <div className="ab-list-grid">
                {published.map((b) => (
                  <article className="ob-card" key={b.id}>
                    <div className="ob-card-head">
                      <span className="ob-card-title">{b.title}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="ob-line">
                      Ciclo: <strong>{b.cycle}</strong>
                    </p>
                    <p className="ob-line">
                      Utenti: <strong>{b.users.map(userLabel).join(", ")}</strong>
                    </p>
                    <p className="ob-line">
                      Obiettivi: <strong>{b.objectives.length}</strong>
                    </p>
                    <div className="ob-progress">
                      <span style={{ width: "100%" }} />
                    </div>
                  </article>
                ))}
              </div>
            ))}
        </>
      )}

      {role === "manager" &&
        (managerQueue.length === 0 ? (
          <EmptyState
            title="Nessuna scheda da compilare"
            text="Quando HR creerà una scheda bonus, la troverai in questa lista. Se HR o Compliance rifiutano, la scheda torna qui."
          />
        ) : (
          <div className="ab-inbox-grid">
            {managerQueue.map((bonus) => (
              <InboxCard
                key={bonus.id}
                bonus={bonus}
                actionLabel={bonus.rejection ? "Ricompila scheda" : "Compila scheda"}
                onAction={() => setFillDraft(JSON.parse(JSON.stringify(bonus)))}
              />
            ))}
          </div>
        ))}

      {role === "compliance" &&
        (complianceQueue.length === 0 ? (
          <EmptyState
            title="Nessuna scheda in compliance"
            text="Dopo l'approvazione HR le schede arriveranno qui per il controllo finale."
          />
        ) : (
          <div className="ab-stack">
            {complianceQueue.map((bonus) => (
              <ReviewWidget
                key={bonus.id}
                bonus={bonus}
                actorLabel="Approvazione Compliance"
                onApprove={() => approve(bonus.id, "Compliance")}
                onReject={() => setRejecting({ id: bonus.id, by: "Compliance" })}
              />
            ))}
          </div>
        ))}

      {rejecting && (
        <RejectModal onCancel={() => setRejecting(null)} onConfirm={confirmReject} />
      )}
    </div>
  );
}

function ProgressBoard({ bonuses, counts, expandedId, onToggle }) {
  const columns = [
    { id: STATUS.MANAGER_FILL, title: "Da compilare", count: counts.manager },
    { id: STATUS.HR_APPROVE, title: "Approvazione HR", count: counts.hr },
    { id: STATUS.COMPLIANCE, title: "Compliance", count: counts.compliance },
    { id: STATUS.PUBLISHED, title: "Lista bonus", count: counts.published },
  ];

  return (
    <div className="ab-progress">
      <div className="ab-stats">
        {columns.map((col) => (
          <div className="ab-stat" key={col.id}>
            <span className="ab-stat-n">{col.count}</span>
            <span className="ab-stat-l">{col.title}</span>
          </div>
        ))}
      </div>

      <div className="ab-kanban">
        {columns.map((col) => {
          const items = bonuses.filter((b) => b.status === col.id);
          return (
            <section className="ab-col" key={col.id}>
              <header className="ab-col-head">
                <h3>{col.title}</h3>
                <span className="ab-count">{col.count}</span>
              </header>
              {items.length === 0 ? (
                <p className="ab-col-empty">Nessuna scheda</p>
              ) : (
                items.map((b) => (
                  <button
                    type="button"
                    className="ab-kanban-card"
                    key={b.id}
                    onClick={() => onToggle(b.id)}
                  >
                    <strong>{b.title}</strong>
                    <span>
                      {b.users.map(userLabel).join(", ")} · {b.cycle}
                    </span>
                    {b.rejection && <em>Rifiutata — in ricompilazione</em>}
                  </button>
                ))
              )}
            </section>
          );
        })}
      </div>

      <div className="ab-table-wrap">
        <h3 className="ab-table-title">Dettaglio processo</h3>
        <table className="ab-table">
          <thead>
            <tr>
              <th>Scheda</th>
              <th>Stato</th>
              <th>Pipeline</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {bonuses.map((b) => (
              <tr key={b.id} className={expandedId === b.id ? "open" : ""}>
                <td>
                  <button type="button" className="ab-link" onClick={() => onToggle(b.id)}>
                    {b.title}
                  </button>
                  <div className="ab-muted">{b.users.map(userLabel).join(", ")}</div>
                </td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
                <td>
                  <PipelineDots status={b.status} />
                </td>
                <td>
                  <button type="button" className="ab-link" onClick={() => onToggle(b.id)}>
                    {expandedId === b.id ? "Chiudi" : "Cronologia"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expandedId && (
          <HistoryPanel bonus={bonuses.find((b) => b.id === expandedId)} />
        )}
      </div>
    </div>
  );
}

function HistoryPanel({ bonus }) {
  if (!bonus) return null;
  return (
    <ol className="ab-history">
      {bonus.history.map((h, i) => (
        <li key={`${h.at}-${i}`}>
          <span className="ab-history-actor">{h.actor}</span>
          <span className="ab-history-action">{h.action}</span>
          {h.note && <span className="ab-history-note">{h.note}</span>}
          <span className="ab-history-at">{h.at}</span>
        </li>
      ))}
    </ol>
  );
}
