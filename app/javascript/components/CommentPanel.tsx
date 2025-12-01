import React, { useEffect, useRef, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import useCommentSync from "../hooks/useCommentSync";

interface CommentPanelProps {
  documentGroupId: number;
  initialComments: any[];
}

interface FormData {
  content: string;
}

const CommentPanel: React.FC<CommentPanelProps> = ({ documentGroupId, token }) => {
  const { comments, addComment, likeComment, setComments } = useCommentSync(documentGroupId);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  

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



  const onSubmit = (data: FormData) => {
    if (!data.content.trim()) return;
    addComment(data.content.trim());
    reset();
  };

   

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    // 一番下にスクロール
    el.scrollTop = el.scrollHeight;
  }, [comments]);


  return (
    <div className="w-full h-full flex flex-col bg-white">

      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {comments.map(c => (
          <div key={c.id} className="p-3 bg-white rounded shadow border flex justify-between">
            <div>
              <div className="text-gray-800">{c.content}</div>
              {/*<small className="text-gray-500">{c.created_at}</small>*/}
            </div>
            <button
              className="ml-3 text-sm px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
              onClick={() => likeComment(c.id)}
            >
              👍 {c.likes_count}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-3 bg-white border-t flex flex-shrink-0"
      >
        <input
          {...register("content")}
          type="text"
          placeholder="コメントを入力"
          className="flex-1 px-3 py-2 border rounded mr-3"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          送信
        </button>
      </form>
    </div>
  );
};

export default CommentPanel;
