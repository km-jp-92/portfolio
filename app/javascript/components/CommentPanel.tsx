import React from "react";
import { useForm } from "react-hook-form";
import { Comment } from "../hooks/useCommentSync";

interface CommentPanelProps {
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onSend: (content: string) => void;
  onLike: (id: number) => void;
}

interface FormData {
  content: string;
}

const CommentPanel: React.FC<CommentPanelProps> = ({ comments, isOpen, onClose, onSend, onLike }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    if (!data.content.trim()) return;
    onSend(data.content.trim());
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg z-50 flex flex-col pointer-events-auto">
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="font-bold">コメント</h2>
        <button onClick={onClose} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {comments.map(c => (
          <div key={c.id} className="p-2 border rounded flex justify-between items-start">
            <div>
              <p>{c.content}</p>
              <small className="text-gray-500">{c.created_at}</small>
            </div>
            <button
              className="ml-2 text-sm px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
              onClick={() => onLike(c.id)}
            >
              👍 {c.likes_count}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-2 border-t flex">
        <input
          {...register("content")}
          type="text"
          placeholder="コメントを入力"
          className="flex-1 px-2 py-1 border rounded mr-2"
        />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          送信
        </button>
      </form>
    </div>
  );
};

export default CommentPanel;
