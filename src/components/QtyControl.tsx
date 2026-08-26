"use client";

type QtyControlProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
};

export const QtyControl = ({ value, min = 0, max, onChange, label }: QtyControlProps) => {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="text-[13px] leading-none text-ivory disabled:text-stone"
        aria-label={`Fewer ${label}`}
        data-cursor="VIEW"
      >
        −
      </button>
      <span className="min-w-6 text-center text-[11px] tracking-[0.18em] text-ivory tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="text-[13px] leading-none text-ivory disabled:text-stone"
        aria-label={`More ${label}`}
        data-cursor="VIEW"
      >
        +
      </button>
    </div>
  );
};
