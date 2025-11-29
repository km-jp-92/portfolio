import React from "react";

interface Props {
  currentPage: number;
  numPages: number;
  scale: number;
  setCurrentPage: (n: number) => void;
  setScale: (s: number) => void;
  toggleFullscreen?: () => void;
}

const PdfControls: React.FC<Props> = ({ currentPage, numPages, scale, setCurrentPage, setScale, toggleFullscreen }) => {
  return (
    <div className="flex items-center space-x-3">
      <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>◀︎</button>
      <span>ページ {currentPage} / {numPages}</span>
      <button onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}>▶︎</button>
      <button onClick={() => setScale(scale * 1.1)} className="px-2">＋</button>
      <button onClick={() => setScale(scale / 1.1)} className="px-2">−</button>
      {toggleFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1 bg-gray-200 text-black rounded"
        >
          全画面
        </button>
      )}
    </div>
  );
};

export default PdfControls;
