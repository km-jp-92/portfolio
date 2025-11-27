import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const options = {
  cMapUrl: "/cmaps/",
  cMapPacked: true
};

interface PdfDocument {
  id: number;
  name: string;
  url: string;
}

interface Props {
  pdf: PdfDocument;
  currentPage: number;
  setCurrentPage: (n: number) => void;
  scale: number;
  onPageCount: (n: number) => void;
}

const PdfViewer: React.FC<Props> = ({
  pdf,
  currentPage,
  setCurrentPage,
  scale,
  onPageCount,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowSize, setWindowSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight,
});
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdfPageSize, setPdfPageSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onPageCount(numPages); // ← ここで親の setNumPages を呼ぶ
  };

useEffect(() => {
  const handleResize = () => {
    if (!isFullscreen) {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  };

  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, [isFullscreen]);




  

  const onPageLoadSuccess = (page: any) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPdfPageSize({ width, height });
  };

  const baseScale = Math.min(
  window.innerWidth / pdfPageSize.width,
  window.innerHeight / pdfPageSize.height
);

// ボタンでの拡大縮小を反映
const computedScale = isFullscreen ? baseScale : baseScale * scale;




  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow-md relative">
      

      

      <div ref={containerRef} className="overflow-auto w-full h-full">
        <Document
          file={pdf.url}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={currentPage} scale={computedScale} onLoadSuccess={onPageLoadSuccess}
            onRenderSuccess={() => {
            // PdfViewer 内部のページ更新 → 親へ伝達
            setCurrentPage(currentPage);
          }}/>
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
