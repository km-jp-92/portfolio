import React, { useState } from "react";
import CommentList from "./CommentList";
import MemoPanel from "./MemoPanel";

const SidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div
      className={`
        flex flex-col h-full bg-white border-l border-gray-300 shadow-lg 
        transition-all duration-300 
        ${isOpen ? "w-80" : "w-8"}
      `}
    >
      {/* 折りたたみボタン */}
      <button
        className="bg-gray-200 text-black w-full py-1 text-sm hover:bg-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "→" : "←"}
      </button>

      {/* パネル内容 */}
      {isOpen && (
        <div className="flex-1 overflow-auto p-2">
          <CommentList />
          <MemoPanel />
        </div>
      )}
    </div>
  );
};

export default SidePanel;
