import { useState } from "react";
import "./App.css";
import ApprovazioneBonus from "./components/ApprovazioneBonus";
import BonusObiettivi from "./components/BonusObiettivi";
import NuovoObiettivo from "./components/NuovoObiettivo";
import ObiettiviLista from "./components/ObiettiviLista";
import WorkflowMbo from "./components/WorkflowMbo";

const TABS = [
  { id: "schede-bonus", label: "Schede Bonus", component: ApprovazioneBonus },
  { id: "workflow", label: "Workflow MBO", component: WorkflowMbo },
  { id: "bonus", label: "Bonus · Obiettivi", component: BonusObiettivi },
  { id: "mbo", label: "Nuovo Obiettivo MBO", component: NuovoObiettivo },
  { id: "lista", label: "Obiettivi (Lista)", component: ObiettiviLista },
];

export default function App() {
  const [active, setActive] = useState("schede-bonus");
  const Active = TABS.find((t) => t.id === active).component;

  return (
    <div className="app-shell">
      <header className="tabbar">
        <div className="tabbar-brand">
          <span className="brand-mark">⚡</span> Spark Components
        </div>
        <nav className="tabbar-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab${active === t.id ? " active" : ""}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="tab-content">
        <Active />
      </main>
    </div>
  );
}
