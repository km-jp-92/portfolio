import React from "react";

interface Document {
  id: number;
  name: string;
  url: string;
}

interface Props {
  documents: Document[];
  selectedPdf: Document;
  onSelect: (doc: Document) => void;
}

const PdfSelector: React.FC<Props> = ({ documents, selectedPdf, onSelect }) => {
  return (
    <div className="flex items-center p-2">
      <label htmlFor="pdf-select">資料を選択：</label>

      <select
        id="pdf-select"
        value={selectedPdf.id}
        onChange={(e) => {
          const next = documents.find((d) => d.id === Number(e.target.value));
          if (next) onSelect(next);
        }}
        className="border border-gray-300 rounded-md"
      >
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name}
          </option>
        ))}
      </select>

    </div>
  );
};

export default PdfSelector;

