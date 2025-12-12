import { useMemo } from "react";

const scorePassword = (pw = "") => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1; // bonus
  return score; // 0-5
};

const label = (s) => {
  if (s <= 1) return "Weak";
  if (s === 2) return "Fair";
  if (s === 3) return "Good";
  if (s === 4) return "Strong";
  return "Very strong";
};

export default function PasswordStrength({ value }) {
  const s = useMemo(() => scorePassword(value), [value]);
  const pct = Math.min(100, (s / 5) * 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs opacity-80">
        <span>Password strength</span>
        <span>{label(s)}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] opacity-70">
        Use 8+ chars, uppercase, lowercase, and a number.
      </p>
    </div>
  );
}
