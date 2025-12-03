import { useEffect, useRef, useState } from "react";
import consumer from "../channels/consumer";

interface UsePdfSyncProps {
  documentGroupId: number;
  roleRef: React.RefObject<"presenter" | "audience" | null>;
  currentPageRef: React.RefObject<number>;
  currentPdfIdRef: React.RefObject<number | undefined>;
}

export default function usePdfSync({
  documentGroupId,
  roleRef,
  currentPageRef,
  currentPdfIdRef,
}: UsePdfSyncProps) {
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

        if (data.request_page_for && roleRef.current === "presenter") {
          subscriptionRef.current?.perform("page_changed", {
          pdf_id: currentPdfIdRef.current,
          page: currentPageRef.current
        });
        }
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

  const requestCurrentPage = () => {
    subscriptionRef.current?.perform("request_current_page");
  };

  return { message, broadcast, requestCurrentPage };
}
