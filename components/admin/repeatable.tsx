"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AdminButton } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Editor for a list of things — projects, jobs, testimonials, skills.
 *
 * Rows are collapsed to a one-line summary by default. With nine skill groups
 * or seven projects on screen, an always-expanded list is unusable; the summary
 * gives you the shape of the list and you open only what you're changing.
 */
export function Repeatable<T>({
  items,
  onChange,
  renderRow,
  summary,
  createItem,
  addLabel = "Add",
  emptyLabel = "Nothing here yet.",
  /** Some lists (e.g. the 8 AI disciplines) shouldn't grow or shrink. */
  fixed = false,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  summary: (item: T, index: number) => ReactNode;
  createItem?: () => T;
  addLabel?: string;
  emptyLabel?: string;
  fixed?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function update(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(null);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpenIndex(target);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-faint">
          {emptyLabel}
        </p>
      ) : null}

      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className={cn(
              "overflow-hidden rounded-lg border transition-colors duration-200",
              isOpen ? "border-line-strong bg-[var(--surface-inset)]/40" : "border-line",
            )}
          >
            <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
              >
                <span className="font-mono text-[0.6875rem] text-faint tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-content">
                  {summary(item, index)}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-faint transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Move up"
                  className="grid size-8 place-items-center rounded text-faint transition-colors hover:text-content disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                  <span className="sr-only">Move up</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  title="Move down"
                  className="grid size-8 place-items-center rounded text-faint transition-colors hover:text-content disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                  <span className="sr-only">Move down</span>
                </button>
                {!fixed ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    title="Delete"
                    className="grid size-8 place-items-center rounded text-faint transition-colors hover:text-[#f87171]"
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete</span>
                  </button>
                ) : null}
              </div>
            </div>

            {isOpen ? (
              <div className="border-t border-line px-4 py-5">
                {renderRow(item, (patch) => update(index, patch), index)}
              </div>
            ) : null}
          </div>
        );
      })}

      {!fixed && createItem ? (
        <AdminButton
          onClick={() => {
            onChange([...items, createItem()]);
            setOpenIndex(items.length);
          }}
          className="self-start"
        >
          <Plus className="size-4" />
          {addLabel}
        </AdminButton>
      ) : null}
    </div>
  );
}

/**
 * Editor for a plain list of strings — bullet points, tags, tech names.
 *
 * Backed by a textarea with one entry per line. A row of inputs with add/remove
 * buttons is more clicks for the same result; pasting six bullets from a CV
 * should just work.
 */
export function StringList({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value.join("\n")}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(
          event.target.value
            .split("\n")
            // Trim only the end, so a line being typed keeps its leading space.
            .map((line) => line.replace(/\s+$/, ""))
            .filter((line, index, all) => line !== "" || index < all.length - 1),
        )
      }
      className={cn(
        "w-full resize-y rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5",
        "font-mono text-[0.8125rem] leading-relaxed text-content placeholder:text-faint",
        "focus:border-[color-mix(in_oklab,var(--brand-primary)_60%,transparent)] focus:outline-none",
      )}
    />
  );
}
