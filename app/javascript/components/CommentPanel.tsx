import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import useCommentSync from "../hooks/useCommentSync";
import type { Comment } from "../hooks/useCommentSync";

interface CommentPanelProps {
  documentGroupId: number;
  token: string;
  initialComments?: Comment[];
}

interface FormData {
  content: string;
}

interface ViewerData {
  initialComments: Comment[];
}

const CommentPanel: React.FC<CommentPanelProps> = ({ documentGroupId, token }) => {
  const { comments, addComment, likeComment, setComments } = useCommentSync(documentGroupId);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const listRef = useRef<HTMLDivElement>(null);

  // 初期コメントの取得
  useEffect(() => {
    let mounted = true;

    fetch(`/documents/viewer/${token}/json`)
      .then((res) => res.json())
      .then((json: ViewerData) => {
        if (!mounted) return;

        // 初期PDFをセット
        setComments(json.initialComments || []);
      })
      .catch((err) => console.error("Failed to fetch initial data:", err));

      return () => {
        mounted = false;
      };
  }, [documentGroupId, token, setComments]);

  // コメント送信処理
  const onSubmit = (data: FormData) => {
    if (!data.content.trim()) return;
    addComment(data.content.trim());
    reset();
  };

  // コメント自動スクロール
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    // 一番下にスクロール
    el.scrollTop = el.scrollHeight;
  }, [comments]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 border rounded">

      <div ref={listRef} className="flex-1 overflow-y-auto p-3">
        {comments.map(c => (
          <div key={c.id} className="flex justify-start mb-2">
            <div className="max-w-xs p-3 rounded-2xl shadow bg-white text-gray-800">
              <div>{c.content}</div>
              {/*<small className="text-gray-500">{c.created_at}</small>*/}
            </div>
            <div className="p-2">
              <button
                className="ml-2 hover:text-blue-700"
                onClick={() => likeComment(c.id)}
              >
                👍 {c.likes_count}
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-3 bg-white border-t flex flex-shrink-0">
        <textarea
          {...register("content")}
          type="text"
          placeholder="全員にメッセージを送信"
          className="flex-1 px-3 py-2 h-24 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          送信
        </button>
      </form>
    </div>
  );
};

export default CommentPanel;
