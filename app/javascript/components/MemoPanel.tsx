import React, { useState } from "react";

const MemoPanel: React.FC = () => {
  const [memo, setMemo] = useState<string>("");

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">メモ</h3>
      <textarea
        className="w-full border border-gray-300 rounded p-1 text-sm"
        rows={4}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="ここにメモを書く"
      />
      <button
        className="mt-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        AI整形（未実装）
      </button>
    </div>
  );
};

export default MemoPanel;
