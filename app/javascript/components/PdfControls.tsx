import React from "react";

interface Props {
  pageNumber: number;
  numPages: number;
  scale: number;
  setPageNumber: (n: number) => void;
  setScale: (s: number) => void;
  toggleFullscreen?: () => void;
}

const PdfControls: React.FC<Props> = ({ pageNumber, numPages, scale, setPageNumber, setScale, toggleFullscreen }) => {
  return (
    <div className="flex items-center space-x-3 p-2">
      <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>◀︎</button>
      <span>ページ {pageNumber} / {numPages}</span>
      <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}>▶︎</button>
      <button onClick={() => setScale(scale * 1.1)}>＋</button>
      <button onClick={() => setScale(scale / 1.1)}>−</button>
      {toggleFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          全画面
        </button>
      )}
    </div>
  );
};

export default PdfControls;
