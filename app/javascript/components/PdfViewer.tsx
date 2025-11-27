import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import RoleSelector from "./RoleSelector";
import PdfControls from "./PdfControls";
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
  setScale: (s: number) => void;
  role: "presenter" | "audience" | null;
  setRole: (r: "presenter" | "audience" | null) => void;
}

const PdfViewer: React.FC<Props> = ({
  pdf,
  currentPage,
  setCurrentPage,
  scale,
  setScale,
  role,
  setRole
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth - 250);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth - 250);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow-md relative">
      <PdfControls
        pageNumber={currentPage}
        numPages={numPages}
        scale={scale}
        setPageNumber={setCurrentPage}
        setScale={setScale}
      />

      <RoleSelector role={role} setRole={setRole} />

      <div className="overflow-auto w-full h-full">
        <Document
          file={pdf.url}
          options={options}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page pageNumber={currentPage} width={windowWidth} />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
