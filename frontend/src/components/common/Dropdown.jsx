import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

/**
 * Menu déroulant générique.
 * items = [{ label, icon, to?, onClick?, danger?, separator?, disabled? }]
 */
export default function Dropdown({
  trigger,
  items = [],
  align = "right",
  width = "w-56",
  triggerClassName = "",
  menuClassName = "",
  label = "Ouvrir le menu",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const itemClass = (item) =>
    `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
      item.danger
        ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    } ${item.disabled ? "pointer-events-none opacity-50" : ""}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 ${
            align === "right" ? "right-0" : "left-0"
          } ${width} ${menuClassName}`}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={`sep-${index}`} className="my-1 h-px bg-slate-200 dark:bg-slate-800" />;
            }

            const content = (
              <>
                {item.icon && <Icon name={item.icon} className="h-4 w-4 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </>
            );

            if (item.to) {
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={itemClass(item)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={itemClass(item)}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
