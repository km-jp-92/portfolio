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
import { FaComments, FaStickyNote, FaFilePdf, FaDownload } from "react-icons/fa";

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
  const commentWindowRef = useRef<Window | null>(null);
  const memoWindowRef = useRef<Window | null>(null);
  
  // --- 初期データを fetch ---
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

  // --- カスタムフックusePdfSyncを呼び出し ---
  const { message, broadcast, requestCurrentPage } = usePdfSync({
    documentGroupId: data?.documentGroupId || 0,
  });

  // --- 聴講者が発表者のページを受け取る ---
  useEffect(() => {
    if (!message) return;
    if (role !== "audience") return;

    if (message.pdf_id && message.page) {
      const newPdf = data?.documents.find((d) => d.id === message.pdf_id);
      if (newPdf) setSelectedPdf(newPdf);
      setCurrentPage(message.page);
    }
  }, [message, role, data]);

  // --- 聴講者が後から参加した場合に発表者のページを受け取る ---
  useEffect(() => {
    if (role === "audience") {
      requestCurrentPage();
    }
  }, [role]);

  // --- 発表者が後から参加した場合に聴講者にページを送る ---
  useEffect(() => {
    if (role === "presenter") {
      broadcast(selectedPdf?.id, currentPage);
    }
  }, [role]);

  // --- 状態role（発表者 or 聴講者）をrefにコピーして保持 ---
  useEffect(() => { roleRef.current = role; }, [role]);

  // --- 現在のページ番号 currentPageをrefにコピーして保持 ---
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  
  // --- 現在表示中のPDFのIDをrefにコピーして保持 ---
  useEffect(() => { currentPdfIdRef.current = selectedPdf?.id; }, [selectedPdf]);

  // --- フルスクリーンの ON/OFF を切り替える関数 ---
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // --- ユーザーがF11やESCでフルスクリーンを切り替えた場合もstateが同期される ---
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // --- ヘッダー高さの計算とウィンドウリサイズ対応 ---
  useEffect(() => {
    const updateHeight = () => {
      if (topRef.current) {
        setHeaderHeight(topRef.current.offsetHeight);
      }
    };

    updateHeight(); // 初期値の設定
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // --- PDFの表示領域をフルスクリーン・通常画面に応じて最適化する変数（PdfViewerで利用） ---
  const availableHeight = isFullscreen
    ? window.innerHeight
    : window.innerHeight - headerHeight;

  // --- コメント用の別ウィンドウを開き、そこにCommentPanelをレンダリングする関数 ---
  const openCommentWindow = () => {
    // 既存のウィンドウがあれば再利用
    if (commentWindowRef.current && !commentWindowRef.current.closed) {
      commentWindowRef.current.focus();
      return;
    }

    // 新しいポップアップウィンドウを開く
    const win = window.open(
      "",
      "Comments",
      "width=400,height=600,resizable,scrollbars=yes"
    );
    if (!win) return;

    // 親ウィンドウのCSSをコピー（Firefoxのみ不可）
    const parentLinks = document.querySelectorAll('link[rel="stylesheet"]');
      parentLinks.forEach((link) => {
        win.document.head.appendChild(link.cloneNode(true));
      });

    // ウィンドウ内のHTMLをリセット
    win.document.body.style.margin = "0";
    win.document.body.innerHTML = ""; // 初期レイアウトを完全削除

    // Reactを描画するためのroot要素を作成
    const root = win.document.createElement("div");
    root.id = "react-root";
    root.style.position = "relative";
    //root.style.inset = "0";
    win.document.body.appendChild(root);

    // Reactコンポーネントをマウント（0ms遅延でDOM構築完了後にReactをレンダリング）
    setTimeout(() => {
      ReactDOM.createRoot(root).render(
        <CommentPanel
          documentGroupId={data?.documentGroupId || 0}
          token={token}
        />
     );
    }, 0);

    // ウィンドウの参照を保存
    commentWindowRef.current = win;
  };

  // --- メモ用の別ウィンドウを開き、そこにMemoPanelをレンダリングする関数 ---
  const openMemoWindow = () => {
    // 既存のウィンドウがあれば再利用
    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      memoWindowRef.current.focus();
      return;
    }

    // 新しいウィンドウを開く
    const win = window.open(
      "",
      "Memo",
      "width=450,height=600,resizable,scrollbars=yes"
    );
    if (!win) return;

    // 親ウィンドウのCSSをコピー
    const parentLinks = document.querySelectorAll('link[rel="stylesheet"]');
      parentLinks.forEach((link) => {
      win.document.head.appendChild(link.cloneNode(true));
    });

    // body を空にする
    win.document.body.innerHTML = "";

    // Reactを描画するためのroot要素を作成
    const root = win.document.createElement("div");
    root.id = "react-root";
    win.document.body.appendChild(root);

    // Reactコンポーネントをマウント（0ms遅延でDOM構築完了後にReactをレンダリング）
    setTimeout(() => {
      ReactDOM.createRoot(root).render(
      <MemoPanel token={token} />);
    }, 0);

    // ウィンドウの参照を保存
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

  // --- スワイプ操作（Hammer.js） ---
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;

    // フルスクリーンでない場合は Hammer を作らない
    if (!isFullscreen) return;

    // 横スワイプのみ許可（縦スクロールはブラウザに任せる）
    el.style.touchAction = "pan-y";

    // Hammer.js の初期化
    const hammer = new Hammer(el);
    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammer.add(pan);

    // スワイプ終了時にページを動かす
    hammer.on("panend", (e) => {
      // 50px以上の移動でページ送り
      if (e.deltaX > 50) setCurrentPage((p) => Math.max(p - 1, 1));
      if (e.deltaX < -50) setCurrentPage((p) => Math.min(p + 1, numPages));
    });

    // クリーンアップ
    return () => {
      hammer.destroy();
      el.style.touchAction = "";
    };
  }, [numPages, isFullscreen]);

  // --- データ未ロード中 ---
  if (!data || !selectedPdf) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="relative w-full">
      {/* ヘッダー */}
      <div ref={topRef} className="flex items-center bg-gray-100 shadow space-x-3">
        {/* PDF 選択セレクタ */}
        <PdfSelector
          documents={data.documents}
          selectedPdf={selectedPdf}
          onSelect={(pdf) => {
            setSelectedPdf(pdf);
            setCurrentPage(1);

            // 発表者ならPDF情報を聴講者に送信
            if (role === "presenter") {
              broadcast(pdf.id, 1);
            }
          }}
        />

        {/* ページ送り・拡大縮小・フルスクリーン */}
        <PdfControls
          currentPage={currentPage}
          numPages={numPages}
          scale={scale}
          setCurrentPage={setCurrentPage}
          setScale={setScale}
          toggleFullscreen={toggleFullScreen}
        />

        {/* ユーザーロール切替 */}
        <RoleSelector role={role} setRole={setRole} />
      
        {/* コメントウィンドウを開くボタン */}
        <button
          className="px-3 rounded"
          onClick={openCommentWindow}>
          <FaComments size={20} color="#4B5563" />
        </button>
      
        {/* メモウィンドウを開くボタン */}
        <button
          className="px-3 rounded"
          onClick={openMemoWindow}>
          <FaStickyNote size={20} color="#4B5563" />
        </button>

        {/* 選択中PDFをダウンロード */}
        <a
          href={selectedPdf.url}
          download={selectedPdf.name}
          className="px-3 rounded"
        >
          <FaDownload size={20} color="#4B5563"  />
        </a>

        {/* PDFを新しいタブで開く */}
        <a
          href={selectedPdf.url}
          target="_blank"
          className="px-3"
        >
          <FaFilePdf size={20} color="#4B5563" />
        </a>
      </div>

      {/* PDFビューア本体 */}
      <div ref={containerRef} className="flex justify-center w-full">
        <PdfViewer
          pdf={selectedPdf}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            // 発表者ならページ情報を送信
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
