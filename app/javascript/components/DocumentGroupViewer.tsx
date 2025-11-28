import React, { useState, useEffect, useRef } from "react";
import PdfSelector from "./PdfSelector";
import RoleSelector from "./RoleSelector";
import PdfControls from "./PdfControls";
import PdfViewer from "./PdfViewer";
import SidePanel from "./SidePanel";
import usePdfSync from "../hooks/usePdfSync";

interface Document {
  id: number;
  name: string;
  url: string;
}

interface ViewerData {
  documentGroupId: number;
  viewToken: string;
  currentDocumentId: number;
  documents: Document[];
}

interface DocumentGroupViewerProps {
  token: string;
}

const DocumentGroupViewer: React.FC<DocumentGroupViewerProps> = ({ token }) => {
  const [data, setData] = useState<ViewerData | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [role, setRole] = useState<"presenter" | "audience" | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const roleRef = useRef(role);
  const currentPageRef = useRef(currentPage);
  const currentPdfIdRef = useRef(selectedPdf?.id);
  
  // 初期データを fetch
  useEffect(() => {
    let mounted = true;

    fetch(`/documents/viewer/${token}/json`)
      .then((res) => res.json())
      .then((json: ViewerData) => {
        if (!mounted) return;
        setData(json);

        // 初期PDFをセット
        const initialPdf =
          json.documents.find((d) => d.id === json.currentDocumentId) ||
          json.documents[0] ||
          null;
        setSelectedPdf(initialPdf);
      })
      .catch((err) => console.error("Failed to fetch initial data:", err));

    return () => {
      mounted = false;
    };
  }, [token]);

  const { message, broadcast, requestCurrentPage } = usePdfSync({
    documentGroupId: data?.documentGroupId || 0,
  });

  useEffect(() => {
    if (!message) return;
    if (role !== "audience") return;

    if (message.pdf_id && message.page) {
      const newPdf = data?.documents.find((d) => d.id === message.pdf_id);
      if (newPdf) setSelectedPdf(newPdf);
      setCurrentPage(message.page);
    }
  }, [message, role, data]);

  useEffect(() => {
    if (role === "audience") {
      requestCurrentPage();
    }
  }, [role]);

  useEffect(() => { roleRef.current = role; }, [role]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { currentPdfIdRef.current = selectedPdf?.id; }, [selectedPdf]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
      const handleChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };
      document.addEventListener("fullscreenchange", handleChange);
      return () => document.removeEventListener("fullscreenchange", handleChange);
    }, []);

  useEffect(() => {
  const updateHeight = () => {
    if (topRef.current) {
      setHeaderHeight(topRef.current.offsetHeight);
    }
  };

  updateHeight();
  window.addEventListener("resize", updateHeight);
  return () => window.removeEventListener("resize", updateHeight);
}, []);

  const availableHeight = isFullscreen
  ? window.innerHeight
  : window.innerHeight - headerHeight;


  // データ未ロード中
  if (!data || !selectedPdf) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      
        <div ref={topRef} className="flex items-center space-x-3">
        <PdfSelector
          documents={data.documents}
          selectedPdf={selectedPdf}
          onSelect={(pdf) => {
          setSelectedPdf(pdf);
          setCurrentPage(1);

          if (role === "presenter") {
            broadcast(pdf.id, 1);
          }
        }}
        />

      <PdfControls
        pageNumber={currentPage}
        numPages={numPages}
        scale={scale}
        setPageNumber={setCurrentPage}
        setScale={setScale}
        toggleFullscreen={toggleFullScreen}
      />

      <RoleSelector role={role} setRole={setRole} />
      <a
        href={selectedPdf.url}
        target="_blank"
        className="text-blue-500 underline"
      >
        ブラウザで開く
      </a>
      </div>

      <div ref={containerRef} className="flex justify-center w-full">
        <PdfViewer
          pdf={selectedPdf}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            if (role === "presenter") {
              broadcast(selectedPdf.id, page);
            }
          }}
          scale={scale}
          onPageCount={(n) => setNumPages(n)}
          availableHeight={availableHeight}
        />
      </div>
      

      {/*<SidePanel />*/}
    </div>
  );
};

export default DocumentGroupViewer;
