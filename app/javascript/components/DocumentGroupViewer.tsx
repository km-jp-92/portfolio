import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import PdfSelector from "./PdfSelector";
import RoleSelector from "./RoleSelector";
import PdfControls from "./PdfControls";
import PdfViewer from "./PdfViewer";
import CommentPanel from "./CommentPanel";
import usePdfSync from "../hooks/usePdfSync";
import MemoPanel from "./MemoPanel";
import Hammer from "hammerjs";
import { FaComments, FaStickyNote, FaFilePdf } from "react-icons/fa";

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

   win.document.body.style.margin = "0";
  win.document.body.innerHTML = ""; // 初期レイアウトを完全削除





  const root = win.document.createElement("div");
  root.id = "react-root";
  root.style.position = "relative"; // ← 横線消えるポイント
  root.style.inset = "0";        // ← ウィンドウ全体を覆う
  win.document.body.appendChild(root);

  setTimeout(() => {
    ReactDOM.createRoot(root).render(
      <CommentPanel
        documentGroupId={data?.documentGroupId || 0}
        token={token}
      />
    );
  }, 0);

  commentWindowRef.current = win;
};


const memoWindowRef = useRef<Window | null>(null);

const openMemoWindow = () => {
  if (memoWindowRef.current && !memoWindowRef.current.closed) {
    memoWindowRef.current.focus();
    return;
  }

  const win = window.open(
    "",
    "Memo",
    "width=450,height=600,resizable,scrollbars=yes"
  );
  if (!win) return;

  const parentLinks = document.querySelectorAll('link[rel="stylesheet"]');
  parentLinks.forEach((link) => {
    win.document.head.appendChild(link.cloneNode(true));
  });

  win.document.body.innerHTML = "";

  const root = win.document.createElement("div");
  root.id = "react-root";
  win.document.body.appendChild(root);

  setTimeout(() => {
    ReactDOM.createRoot(root).render(
    <MemoPanel token={token} />);
  }, 0);

  memoWindowRef.current = win;
};


  // --- キーボード操作 ---
useEffect(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    switch(e.key){
      case "ArrowRight":
      case "ArrowDown":
      case "Enter":
        setCurrentPage((p) => Math.min(p + 1, numPages));
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "Backspace":
        setCurrentPage((p) => Math.max(p - 1, 1));
        break;
      case "f":
      case "F":
        toggleFullScreen?.();
        break;
      case "Escape":
        if (document.fullscreenElement) document.exitFullscreen();
        break;
    }
  };
  document.addEventListener("keydown", handleKeydown);
  return () => document.removeEventListener("keydown", handleKeydown);
}, [numPages, toggleFullScreen]);

// --- タッチスワイプ操作（Hammer.js） ---
useEffect(() => {
  if (!containerRef.current) return;

  const el = containerRef.current;

  // フルスクリーンでない場合は Hammer を作らない
  if (!isFullscreen) return;

  // 横スワイプのみ許可（縦スクロールはブラウザに任せる）
  el.style.touchAction = "pan-y";

  const hammer = new Hammer(el);
  const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL });
  hammer.add(pan);

  hammer.on("panend", (e) => {
    // 50px以上の移動でページ送り
    if (e.deltaX > 50) setCurrentPage((p) => Math.max(p - 1, 1));
    if (e.deltaX < -50) setCurrentPage((p) => Math.min(p + 1, numPages));
  });

  return () => {
    hammer.destroy();
    el.style.touchAction = "";
  };
}, [numPages, isFullscreen]);




  // データ未ロード中
  if (!data || !selectedPdf) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="relative w-full">
    <div ref={topRef} className="flex items-center bg-gray-100 shadow space-x-3">
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
      <button
        className="px-2 rounded"
        onClick={openCommentWindow}><FaComments size={20} color="#4B5563" /></button>
      
      <button
        className="px-4 rounded"
        onClick={openMemoWindow}
      >
        <FaStickyNote size={20} color="#4B5563" />
      </button>

      
      <a
        href={selectedPdf.url}
        target="_blank"
        className="px-2"
      >
        <FaFilePdf size={20} color="#4B5563" />
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
