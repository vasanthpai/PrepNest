import { useState } from "react";

export default function HelloIsland() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      onClick={() => setCount((c) => c + 1)}
      className="mt-6 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 active:scale-95"
    >
      React island clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );
}