import React from "react";
import CommentItem from "./CommentItem";

interface Comment {
  id: number;
  text: string;
}

const sampleComments: Comment[] = [
  { id: 1, text: "コメント例1" },
  { id: 2, text: "コメント例2" },
];

const CommentList: React.FC = () => {
  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">コメント</h3>
      <ul className="space-y-1">
        {sampleComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
