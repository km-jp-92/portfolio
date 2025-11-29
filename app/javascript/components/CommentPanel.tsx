import React, { useEffect, useRef, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import useCommentSync from "../hooks/useCommentSync";

interface CommentPanelProps {
  documentGroupId: number;
}

interface FormData {
  content: string;
}

const CommentPanel: React.FC<CommentPanelProps> = ({ documentGroupId, initialComments }) => {
  const { comments, addComment, likeComment, setComments } = useCommentSync(documentGroupId);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const listRef = useRef<HTMLDivElement>(null);

  const onSubmit = (data: FormData) => {
    if (!data.content.trim()) return;
    addComment(data.content.trim());
    reset();
  };

   useEffect(() => {
    setComments(initialComments);
  }, [initialComments, setComments]);

  // コメント追加時にスクロールを最下部に
  useLayoutEffect(() => {
  if (listRef.current) {
    listRef.current.scrollTop =
      listRef.current.scrollHeight - listRef.current.clientHeight;
  }
}, [comments]);


  return (
    <div className="w-80 h-full bg-white shadow-lg z-50 flex flex-col pointer-events-auto">

      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2">
        {comments.map(c => (
          <div key={c.id} className="p-2 border rounded flex justify-between items-start">
            <div>
              <p>{c.content}</p>
              {/*<small className="text-gray-500">{c.created_at}</small>*/}
            </div>
            <button
              className="ml-2 text-sm px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
              onClick={() => likeComment(c.id)}
            >
              👍 {c.likes_count}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-2 border-t flex flex-shrink-0"
      >
        <input
          {...register("content")}
          type="text"
          placeholder="コメントを入力"
          className="flex-1 px-2 py-1 border rounded mr-2"
        />
        <button type="submit" className="px-3 py-1 text-black rounded">
          📤
        </button>
      </form>
    </div>
  );
};

export default CommentPanel;
