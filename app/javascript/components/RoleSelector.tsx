import React from "react";
import { FaChalkboardTeacher, FaUserFriends } from "react-icons/fa";

interface Props {
  role: "presenter" | "audience" | null;
  setRole: (r: "presenter" | "audience" | null) => void;
}

const RoleSelector: React.FC<Props> = ({ role, setRole }) => {
  return (
    <div className="flex space-x-3 p-2">
      <button
        onClick={() => {
    if (role !== "presenter") {
      // 発表者になるときだけ確認する
      const ok = window.confirm("本当に発表しますか？\n\n発表者になると、ページ操作が全員に同期されます。");
      if (!ok) return;
      setRole("presenter");
    } else {
      // presenter → null に戻すだけなら確認不要
      setRole(null);
    }
  }}
  className={`px-3 py-1 rounded ${
    role === "presenter"
      ? "bg-blue-500 text-white"
      : "bg-gray-100 text-gray-600"
  }`}
      >
        <FaChalkboardTeacher size={20} />
      </button>
      <button
        onClick={() => setRole(role === "audience" ? null : "audience")}
        className={`px-3 py-1 rounded ${
          role === "audience" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        <FaUserFriends size={20} />
      </button>
    </div>
  );
};

export default RoleSelector;
