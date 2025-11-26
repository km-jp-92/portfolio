import React from "react";

interface Comment {
  id: number;
  text: string;
}

interface Props {
  comment: Comment;
}

const CommentItem: React.FC<Props> = ({ comment }) => {
  return (
    <li className="flex justify-between items-center border-b border-gray-200 pb-1">
      <span className="text-sm">{comment.text}</span>
      <button className="text-blue-500 text-xs hover:underline">👍</button>
    </li>
  );
};

export default CommentItem;
