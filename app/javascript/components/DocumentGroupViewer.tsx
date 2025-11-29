import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import PdfSelector from "./PdfSelector";
import RoleSelector from "./RoleSelector";
import PdfControls from "./PdfControls";
import PdfViewer from "./PdfViewer";
import CommentPanel from "./CommentPanel";
import usePdfSync from "../hooks/usePdfSync";
import useCommentSync from "../hooks/useCommentSync";

interface Document {
  id: number;
  name: string;
  url: string;
}

interface Comment {
  id: number;
  content: string;
  likes_count: number;
}

interface ViewerData {
  documentGroupId: number;
  viewToken: string;
  currentDocumentId: number;
  documents: Document[];
  comments: Comment[];
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
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [initialComments, setInitialComments] = useState<Comment[]>([]);
  
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

        setInitialComments(json.initialComments || []);
      })
      .catch((err) => console.error("Failed to fetch initial data:", err));

    return () => {
      mounted = false;
    };
  }, [token]);

  const { message, broadcast, requestCurrentPage } = usePdfSync({
    documentGroupId: data?.documentGroupId || 0,
  });

  const { comments, addComment, likeComment, setComments } = useCommentSync(
  data?.documentGroupId || 0,
  []
);



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


  const commentWindowRef = useRef<Window | null>(null);

  const openCommentWindow = () => {
  if (commentWindowRef.current && !commentWindowRef.current.closed) {
    commentWindowRef.current.focus();
    return;
  }

  const win = window.open(
    "",
    "Comments",
    "width=400,height=600,resizable,scrollbars=yes"
  );
  if (!win) return;

  const parentLinks = document.querySelectorAll('link[rel="stylesheet"]');
    parentLinks.forEach((link) => {
      win.document.head.appendChild(link.cloneNode(true));
    });

  // head が揃うまで遅延して React をマウント（安全のため）
  win.document.body.style.margin = "0";
  win.document.title = "Comments";

  const div = win.document.createElement("div");
  win.document.body.appendChild(div);

  ReactDOM.createRoot(div).render(
    <CommentPanel
    documentGroupId={data?.documentGroupId || 0}
    initialComments={initialComments} />
  );

  commentWindowRef.current = win;
};





  // データ未ロード中
  if (!data || !selectedPdf) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="relative w-full">
    <div ref={topRef} className="flex items-center bg-gray-200 shadow space-x-3">
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
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        setCurrentPage={setCurrentPage}
        setScale={setScale}
        toggleFullscreen={toggleFullScreen}
      />

      <RoleSelector role={role} setRole={setRole} />
      <button className="ml-auto bg-blue-600 text-black px-2 py-1 rounded" onClick={openCommentWindow}>チャット</button>
      <a
        href={selectedPdf.url}
        target="_blank"
        className="text-blue-500 underline px-4"
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
          setNumPages={setNumPages}
          availableHeight={availableHeight}
          isFullscreen={isFullscreen}
        />
      
      </div>

      
      
        </div>
    
    
  );
};

export default DocumentGroupViewer;
