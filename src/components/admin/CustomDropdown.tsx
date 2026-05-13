'use client';

import { useMemo, useState } from 'react';

export type DropdownOption = { value: string; label: string };
export type DropdownGroup = { label: string; options: DropdownOption[] };

const hiddenScrollbar =
  '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0';

type CustomDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options?: DropdownOption[];
  groups?: DropdownGroup[];
  disabled?: boolean;
  /** Extra classes on the root wrapper (e.g. min width) */
  className?: string;
};

export function CustomDropdown({
  value,
  onChange,
  placeholder,
  options,
  groups,
  disabled = false,
  className = '',
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => {
    if (!value) return placeholder;
    const flat = [...(options ?? []), ...(groups?.flatMap((group) => group.options) ?? [])];
    return flat.find((option) => option.value === value)?.label ?? placeholder;
  }, [groups, options, placeholder, value]);

  return (
    <div
      className={`relative ${className}`.trim()}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && event.currentTarget.contains(next)) return;
        setOpen(false);
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7] disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#425f8f]" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          className={`absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#d4dced] bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.14)] ${hiddenScrollbar}`}
          onWheel={(event) => {
            const el = event.currentTarget;
            const atTop = el.scrollTop <= 0;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
              event.preventDefault();
            }
          }}
        >
          {(groups ?? []).map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black">{group.label}</p>
              {group.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${value === option.value ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-[#2a3d5f] hover:bg-[#f4f7ff]'}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
          {(options ?? []).map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${value === option.value ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-[#2a3d5f] hover:bg-[#f4f7ff]'}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
