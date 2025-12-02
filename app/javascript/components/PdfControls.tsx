import React from "react";
import { FaExpand, FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
    <div className="flex items-center space-x-6">
      <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}><FaArrowLeft color="#4B5563" /></button>
      <span> {currentPage} / {numPages}</span>
      <button onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}><FaArrowRight color="#4B5563" /></button>
      <button onClick={() => setScale(scale * 1.1)}>＋</button>
      <button onClick={() => setScale(scale / 1.1)}>−</button>
      {toggleFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="text-black rounded"
        >
          <FaExpand color="#4B5563" />
        </button>
      )}
    </div>
  );
};

export default PdfControls;
