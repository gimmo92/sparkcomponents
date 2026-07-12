import { useEffect, useMemo, useRef, useState } from "react";

export default function PillsMultiSelect({
  label,
  placeholder = "Seleziona...",
  options,
  selected,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedItems = options.filter((o) => selectedSet.has(o.id));

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => {
      if (selectedSet.has(o.id)) return false;
      if (!q) return true;
      return o.label.toLowerCase().includes(q);
    });
  }, [options, selectedSet, query]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const add = (id) => {
    onChange([...selected, id]);
    setQuery("");
    inputRef.current?.focus();
  };

  const remove = (id) => {
    onChange(selected.filter((x) => x !== id));
  };

  const clearAll = () => {
    onChange([]);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="pms" ref={ref}>
      <div className="pms-head">
        <span className="pms-label">{label}</span>
        {selected.length > 0 && (
          <button
            type="button"
            className="pms-reset"
            aria-label="Deseleziona tutti"
            onClick={clearAll}
          >
            ↻
          </button>
        )}
      </div>

      <div
        className={`pms-box${open ? " pms-box--open" : ""}`}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="pms-chips">
          {selectedItems.map((item) => (
            <span className="chip" key={item.id}>
              {item.label}
              <button
                type="button"
                aria-label={`Rimuovi ${item.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(item.id);
                }}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="pms-input"
            placeholder={selected.length === 0 ? placeholder : ""}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </div>
      </div>

      {open && available.length > 0 && (
        <ul className="pms-dropdown" role="listbox">
          {available.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                className="pms-option"
                onClick={() => add(item.id)}
              >
                <span>{item.label}</span>
                {i === 0 && (
                  <span className="pms-option-hint">Premi per selezionare</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && available.length === 0 && query && (
        <div className="pms-dropdown pms-dropdown--empty">
          Nessun risultato
        </div>
      )}
    </div>
  );
}
