import React from "react";

interface Props {
  role: "presenter" | "audience" | null;
  setRole: (r: "presenter" | "audience" | null) => void;
}

const RoleSelector: React.FC<Props> = ({ role, setRole }) => {
  return (
    <div className="flex space-x-3 p-2">
      <button
        onClick={() => setRole(role === "presenter" ? null : "presenter")}
        className={`px-3 py-1 rounded ${
          role === "presenter" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        発表
      </button>
      <button
        onClick={() => setRole(role === "audience" ? null : "audience")}
        className={`px-3 py-1 rounded ${
          role === "audience" ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        聴講
      </button>
    </div>
  );
};

export default RoleSelector;
