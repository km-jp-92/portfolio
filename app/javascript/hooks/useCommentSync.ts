import { useEffect, useRef, useState } from "react";
import consumer from "../channels/consumer";

export interface Comment {
  id: number;
  content: string;
  likes_count: number;
  created_at: string;
}

export default function useCommentSync(documentGroupId: number) {
  const subscriptionRef = useRef<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!documentGroupId) return;
    if (subscriptionRef.current) return;

    const subscription = consumer.subscriptions.create(
      { channel: "CommentChannel", document_group_id: documentGroupId },
      {
        received: (data: any) => {
          if (data.comment) {
            setComments(prev => [...prev, data.comment]);
          }
          if (data.action === "update_like") {
            setComments(prev =>
              prev.map(c => (c.id === data.comment_id ? { ...c, likes_count: data.likes_count } : c))
            );
          }
        }
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        consumer.subscriptions.remove(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [documentGroupId]);

  const addComment = (content: string) => {
    subscriptionRef.current?.perform("create", { content });
  };

  const likeComment = (id: number) => {
    subscriptionRef.current?.perform("like", { id });
  };

  return { comments, addComment, likeComment, setComments };
}
