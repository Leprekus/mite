import * as React from "react";

/**
 * A tiny, shadcn-style Select built with forwardRef and Tailwind classes.
 * Single file, no deps. Accessible-ish (roles/aria) and keyboard-friendly.
 */

// Context to share open/value state between subcomponents
type SelectCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  value: string | null;
  setValue: (v: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentId: string;
};
const SelectContext = React.createContext<SelectCtx | null>(null);
const useSelectCtx = () => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select.* must be used inside <Select>");
  return ctx;
};

// Root Select component (provides context)
interface SelectProps {
  defaultValue?: string | null;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}
function SelectRoot({ defaultValue = null, onValueChange, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValueState] = React.useState<string | null>(defaultValue);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentId = React.useId();

  const setValue = React.useCallback((v: string) => {
    setValueState(v);
    onValueChange?.(v);
  }, [onValueChange]);

  // Close on outside click
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const ctx: SelectCtx = { open, setOpen, value, setValue, triggerRef, contentId };

  return (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className={"relative inline-block " + (className ?? "")}>{children}</div>
    </SelectContext.Provider>
  );
}

// Trigger — forwardRef so parents can focus it (shadcn style)
interface TriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}
const SelectTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ placeholder = "Select...", className = "", ...props }, ref) => {
    const { open, setOpen, value, triggerRef, contentId } = useSelectCtx();
    const mergedRef = useMergedRefs(ref, triggerRef);

    return (
      <button
        ref={mergedRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        className={[
          "w-56 inline-flex items-center justify-between gap-2",
          "rounded-2xl border border-neutral-300 bg-white px-3 py-2",
          "text-sm text-neutral-900 shadow-sm hover:bg-neutral-50",
          "focus:outline-none focus:ring-2 focus:ring-neutral-400",
          open ? "ring-2 ring-neutral-400" : "",
          className,
        ].join(" ")}
        {...props}
      >
        <span className="truncate">{value ?? placeholder}</span>
        <span aria-hidden className="ml-auto select-none">▾</span>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// Content (dropdown panel)
const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = "", ...props }, ref) => {
  const { open, contentId } = useSelectCtx();
  if (!open) return null;
  return (
    <div
      ref={ref}
      id={contentId}
      role="listbox"
      tabIndex={-1}
      className={[
        "absolute left-0 mt-2 w-56 overflow-hidden",
        "rounded-2xl border border-neutral-200 bg-white shadow-lg",
        "focus:outline-none",
        className,
      ].join(" ")}
      {...props}
    />
  );
});
SelectContent.displayName = "SelectContent";

// Item — forwardRef like shadcn's <SelectItem>
interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
const SelectItem = React.forwardRef<HTMLButtonElement, ItemProps>(({ value, className = "", children, ...props }, ref) => {
  const { setValue, setOpen, value: selected } = useSelectCtx();
  const isSelected = selected === value;

  return (
    <button
      ref={ref}
      role="option"
      aria-selected={isSelected}
      type="button"
      onClick={() => { setValue(value); setOpen(false); }}
      className={[
        "block w-full text-left px-3 py-2 text-sm",
        "hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none",
        isSelected ? "bg-neutral-100" : "bg-white",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});
SelectItem.displayName = "SelectItem";

// Little util to merge multiple refs (forwardRef + internal)
function useMergedRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return React.useCallback((node: T) => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === "function") r(node);
      else (r as React.MutableRefObject<T | null>).current = node;
    }
  }, [refs]);
}

// Export a shadcn-like API object
export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
});


