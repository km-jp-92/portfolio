import React from "react";

interface Props {
  pageNumber: number;
  numPages: number;
  scale: number;
  setPageNumber: (n: number) => void;
  setScale: (s: number) => void;
}

const PdfControls: React.FC<Props> = ({ pageNumber, numPages, scale, setPageNumber, setScale }) => {
  return (
    <div className="flex items-center space-x-3 p-2">
      <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>◀︎</button>
      <span>ページ {pageNumber} / {numPages}</span>
      <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}>▶︎</button>
      <button onClick={() => setScale(scale * 1.1)}>＋</button>
      <button onClick={() => setScale(scale / 1.1)}>−</button>
    </div>
  );
};

export default PdfControls;
