// src/components/Users/Pagination.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex justify-between items-center mt-3 text-[11px] text-slate-300">
      <button
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/70 hover:text-emerald-200 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" />
        Prev
      </button>

      <span className="rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-slate-200">
        Page <span className="text-emerald-300">{page}</span> / {totalPages}
      </span>

      <button
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/70 hover:text-emerald-200 transition-colors"
      >
        Next
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export default Pagination;
