type ColorChipProps = {
  hex: string;
  label?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
};

export const ColorChip = ({
  hex,
  label,
  selected = false,
  onClick,
  size = "sm",
}: ColorChipProps) => {
  const dim = size === "md" ? "h-7 w-7" : "h-5 w-5";
  const fill = hex || "#111111";
  const className = `relative shrink-0 ${dim}`;
  const mark = (
    <>
      <span
        className="absolute inset-0 border border-ivory/25"
        style={{ backgroundColor: fill }}
      />
      {selected ? (
        <span className="pointer-events-none absolute -inset-[3px] border border-ivory" aria-hidden />
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={selected}
        onClick={onClick}
        className={className}
        data-cursor="VIEW"
      >
        {mark}
      </button>
    );
  }

  return (
    <span className={className} title={label}>
      {mark}
    </span>
  );
};
