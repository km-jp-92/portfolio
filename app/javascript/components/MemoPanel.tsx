import React, { useState, useEffect } from "react";

const STORAGE_KEY = "memo_text";

const MemoPanel: React.FC = ({ token }) => {
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

    // CSRF トークンを取得
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");

    const res = await fetch(`/documents/viewer/${token}/format_memo`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken || "" 
      },
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
    <div className="h-full flex flex-col">

      <textarea
        className="mx-2 mt-2 mb-2 border rounded resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={text}
        onChange={handleChange}
        placeholder="個人用メモを入力"
        rows={10}
      />

      <div className="flex space-x-3 justify-center">
        <button
          className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={formatMemo}
          disabled={loading}
        >
          {loading ? "整形中..." : "AIで整える"}
        </button>

        <button
          className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={downloadMemo}
        >
          ダウンロード
        </button>
      </div>
    </div>
  );
};

export default MemoPanel;
