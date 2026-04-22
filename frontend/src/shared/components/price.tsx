/**
 * Reusable VND Price Component
 * Usage: <Price value={150000} /> → 150.000đ
 *        <Price value={150000} old={200000} /> → shows old price crossed out
 */
type PriceProps = {
  value: number;
  old?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
};

const sizeMap = {
  sm: { main: 13, old: 11 },
  md: { main: 16, old: 12 },
  lg: { main: 22, old: 14 },
  xl: { main: 32, old: 15 },
};

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.floor(n)) + "đ";

export const Price = ({ value, old, size = "md", className, style }: PriceProps) => {
  const s = sizeMap[size];

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "baseline", gap: 6, ...style }}>
      <span style={{ fontSize: s.main, fontWeight: 700, color: "var(--price)" }}>
        {formatVND(value)}
      </span>
      {old != null && old > value && (
        <span style={{ fontSize: s.old, color: "var(--text-muted)", textDecoration: "line-through" }}>
          {formatVND(old)}
        </span>
      )}
    </span>
  );
};

/** Standalone formatter — use when JSX isn't needed */
export { formatVND };
