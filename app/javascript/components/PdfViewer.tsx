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
  setNumPages: (n: number) => void;
  availableHeight: number;
  isFullscreen: boolean;
}

const PdfViewer: React.FC<Props> = ({
  pdf,
  currentPage,
  setCurrentPage,
  scale,
  setNumPages,
  availableHeight,
  isFullscreen
}) => {
  const [pdfPageSize, setPdfPageSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  // PDF全体が読み込まれたときにページ数を親に通知
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages); // ← ここで親の setNumPages を呼ぶ
  };

  // ページ単位で実寸の幅・高さを取得して pdfPageSize に保存
  const onPageLoadSuccess = (page: any) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPdfPageSize({ width, height });
  };

  // スケーリング計算
  const baseScale = Math.min(
    window.innerWidth / pdfPageSize.width,
    availableHeight / pdfPageSize.height
  );

  // ボタンでの拡大縮小を反映
  const computedScale = isFullscreen ? baseScale : baseScale * scale;

  return (
    <div className="overflow-auto w-full h-full bg-white rounded-lg shadow-md relative">

      <div className="inline-block">
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
