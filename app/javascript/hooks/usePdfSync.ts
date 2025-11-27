import { useEffect, useRef, useState } from "react";
import consumer from "../channels/consumer";

export default function usePdfSync({ documentGroupId }) {
  const [message, setMessage] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!documentGroupId) return;

    // すでに購読済みなら新規作成しない（StrictMode対策）
    if (subscriptionRef.current) return;

    const subscription = consumer.subscriptions.create(
      {
        channel: "PdfSyncChannel",
        document_group_id: documentGroupId,
      },
      {
        received: (data) => {
          setMessage(data); // 受信データを親へ返すだけ
        },
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

  const broadcast = (pdfId, page) => {
    subscriptionRef.current?.perform("page_changed", { pdf_id: pdfId, page });
  };

  return { message, broadcast };
}
