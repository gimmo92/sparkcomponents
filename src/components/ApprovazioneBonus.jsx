import { useMemo, useRef, useState } from "react";
import BonusSchedaForm, {
  BONUS_USERS,
  SchedaReadonly,
  cloneObjectives,
  userLabel,
} from "./BonusSchedaForm";

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
  { id: STATUS.PUBLISHED, label: "Pubblicato", short: "Pubblicato" },
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

function resolveUser(value) {
  const q = String(value).trim().toLowerCase();
  if (!q) return null;
  return (
    BONUS_USERS.find(
      (u) => u.id === q || u.label.toLowerCase().includes(q)
    )?.id ?? null
  );
}

function parseImportedSchede(text, filename) {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  const isJson =
    filename.toLowerCase().endsWith(".json") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith("{");

  let rows = [];
  if (isJson) {
    const data = JSON.parse(trimmed);
    rows = Array.isArray(data) ? data : (data.schede ?? data.bonus ?? []);
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Il JSON non contiene schede da importare.");
    }
  } else {
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      throw new Error("Il CSV deve avere intestazione e almeno una riga.");
    }
    const sep = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
    const col = (...names) => names.reduce((acc, n) => (acc >= 0 ? acc : headers.indexOf(n)), -1);
    const t = col("titolo", "title", "bonus");
    const u = col("utenti", "users", "utente");
    const c = col("ciclo", "cycle", "anno");
    rows = lines.slice(1).map((line) => {
      const cols = line.split(sep).map((x) => x.trim());
      return {
        title: cols[t >= 0 ? t : 0],
        users: cols[u >= 0 ? u : 1] ?? "",
        cycle: cols[c >= 0 ? c : 2] ?? "2026",
      };
    });
  }

  return rows.map((row, i) => {
    const title = String(row.title ?? row.titolo ?? "").trim();
    if (!title) throw new Error(`Riga ${i + 1}: manca il titolo.`);
    const rawUsers = row.users ?? row.utenti ?? [];
    const userIds = (Array.isArray(rawUsers) ? rawUsers : String(rawUsers).split(/[;,]/))
      .map(resolveUser)
      .filter(Boolean);
    return {
      title,
      users: userIds,
      cycle: String(row.cycle ?? row.ciclo ?? "2026"),
      objectives: row.objectives ? cloneObjectives(row.objectives) : cloneObjectives(),
    };
  });
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
  const [view, setView] = useState("compila");
  const [bonuses, setBonuses] = useState(seedBonuses);
  const [draft, setDraft] = useState(null);
  const [fillDraft, setFillDraft] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [importError, setImportError] = useState("");
  const fileRef = useRef(null);

  const counts = useMemo(
    () => ({
      manager: bonuses.filter((b) => b.status === STATUS.MANAGER_FILL).length,
      hr: bonuses.filter((b) => b.status === STATUS.HR_APPROVE).length,
      compliance: bonuses.filter((b) => b.status === STATUS.COMPLIANCE).length,
    }),
    [bonuses]
  );

  const patchBonus = (id, updater) =>
    setBonuses((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));

  const startCreate = () => {
    setDraft(emptyDraft());
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
    setView("compila");
  };

  const importFromFile = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseImportedSchede(text, file.name);
      const created = rows.map((row) => ({
        ...emptyDraft(),
        ...row,
        id: ++nextBonusId,
        status: STATUS.MANAGER_FILL,
        rejection: null,
        history: [event("HR", "Scheda importata e inviata al manager")],
      }));
      setBonuses((prev) => [...created, ...prev]);
      setView("compila");
      setImportError("");
    } catch (err) {
      setImportError(err.message || "Impossibile importare il file.");
    }
  };

  const submitFill = () => {
    patchBonus(fillDraft.id, (b) => ({
      ...fillDraft,
      status: STATUS.HR_APPROVE,
      rejection: null,
      history: [...b.history, event("Manager", "Scheda compilata e inviata ad HR")],
    }));
    setFillDraft(null);
    setView("approva");
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
    setView("compila");
  };

  const nav = [
    { id: "compila", label: "Da compilare", count: counts.manager },
    { id: "approva", label: "Da approvare", count: counts.hr + counts.compliance },
    { id: "avanzamento", label: "Avanzamento" },
  ];

  const managerQueue = bonuses.filter((b) => b.status === STATUS.MANAGER_FILL);
  const hrQueue = bonuses.filter((b) => b.status === STATUS.HR_APPROVE);
  const complianceQueue = bonuses.filter((b) => b.status === STATUS.COMPLIANCE);

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
        <div className="ab-head-actions">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              importFromFile(file);
            }}
          />
          <button
            className="btn-cyan"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            <span aria-hidden>⬆</span> IMPORTA
          </button>
          <button className="btn-cta" type="button" onClick={startCreate}>
            <span aria-hidden>＋</span> Crea scheda
          </button>
        </div>
      </div>

      <nav className="ab-subnav" aria-label="Viste processo">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ab-sub${view === item.id ? " active" : ""}`}
            onClick={() => setView(item.id)}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span className="ab-count">{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {view === "compila" &&
        (managerQueue.length === 0 ? (
          <EmptyState
            title="Nessuna scheda da compilare"
            text="Crea o importa una scheda bonus per avviare la compilazione da parte dei manager."
            actionLabel="Crea scheda bonus"
            onAction={startCreate}
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

      {view === "approva" &&
        (hrQueue.length === 0 && complianceQueue.length === 0 ? (
          <EmptyState
            title="Nessuna scheda da approvare"
            text="Le schede compilate dai manager compariranno qui per HR e poi per Compliance."
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

      {view === "avanzamento" && (
        <ProgressBoard
          bonuses={bonuses}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
        />
      )}

      {rejecting && (
        <RejectModal onCancel={() => setRejecting(null)} onConfirm={confirmReject} />
      )}

      {importError && (
        <div className="modal-overlay" onClick={() => setImportError("")}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Import non riuscito</h3>
            <p className="modal-sub">{importError}</p>
            <p className="hint">
              Usa un CSV con colonne Titolo, Utenti, Ciclo oppure un JSON con elenco di schede.
            </p>
            <div className="modal-actions">
              <button className="btn-primary" type="button" onClick={() => setImportError("")}>
                CHIUDI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressBoard({ bonuses, expandedId, onToggle }) {
  return (
    <div className="ab-progress">
      <div className="ab-table-wrap">
        <h3 className="ab-table-title">Avanzamento</h3>
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
