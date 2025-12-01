// src/components/MemoPanel.tsx
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "memo_text";

const MemoPanel: React.FC = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // localStorage からロード
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);
  }, []);

  // 書くたびに保存
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  };

  // 整形（OpenAI API）
  const formatMemo = async () => {
    setLoading(true);

    const res = await fetch("/documents/format_memo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });

    const json = await res.json();
    setText(json.formatted);
    localStorage.setItem(STORAGE_KEY, json.formatted);

    setLoading(false);
  };

  // ダウンロード
  const downloadMemo = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "memo.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-white h-full flex flex-col">

      <textarea
        className="flex-1 border rounded p-3 w-full mb-3"
        value={text}
        onChange={handleChange}
        placeholder="ここに個人用メモを書いてください"
      />

      <div className="flex space-x-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={formatMemo}
          disabled={loading}
        >
          {loading ? "整形中..." : "AIで整形"}
        </button>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={downloadMemo}
        >
          ダウンロード
        </button>
      </div>
    </div>
  );
};

export default MemoPanel;
