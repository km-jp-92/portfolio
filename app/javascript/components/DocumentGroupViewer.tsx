import React, { useState, useEffect } from "react";
import PdfSelector from "./PdfSelector";
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
  // Hooks はすべて最上部で呼ぶ
  const [data, setData] = useState<ViewerData | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [role, setRole] = useState<"presenter" | "audience" | null>(null);

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

  const { message, broadcast } = usePdfSync({
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

  // データ未ロード中
  if (!data || !selectedPdf) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex w-full">
      <div className="flex-1 flex flex-col">
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
          setScale={setScale}
          role={role}
          setRole={setRole}
        />
      </div>

      <SidePanel />
    </div>
  );
};

export default DocumentGroupViewer;
