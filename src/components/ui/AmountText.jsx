import { useEffect, useState } from "react";
import { formatCurrency } from "../../lib/utils";

export default function AmountText({ amount, hide, prefix = "", className = "" }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [hide]);

  if (!hide) {
    return (
      <span className={className}>
        {prefix}
        {formatCurrency(amount)}
      </span>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed((v) => !v);
      }}
      className={`${className} cursor-pointer select-none`}
      title={revealed ? "Klik untuk sembunyikan" : "Klik untuk lihat"}
    >
      {revealed ? `${prefix}${formatCurrency(amount)}` : "Rp ••••••"}
    </span>
  );
}
