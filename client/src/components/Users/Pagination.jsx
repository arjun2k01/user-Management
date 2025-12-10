export default function Pagination({ meta, fetchUsers }) {
  return (
    <div className="pagination">
      <button
        disabled={meta.page <= 1}
        onClick={() => fetchUsers(meta.page - 1)}
      >
        Prev
      </button>

      <span>
        Page {meta.page} of {meta.totalPages}
      </span>

      <button
        disabled={meta.page >= meta.totalPages}
        onClick={() => fetchUsers(meta.page + 1)}
      >
        Next
      </button>
    </div>
  );
}
