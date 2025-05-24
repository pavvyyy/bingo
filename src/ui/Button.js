import React from "react";

export function Button({ children, onClick, disabled, className = "", variant = "solid" }) {
  const baseClass = "rounded px-4 py-2 font-semibold focus:outline-none transition";
  const variants = {
    solid: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed",
  };

  const combinedClass = `${baseClass} ${variants[variant]} ${className}`;

  return (
    <button onClick={onClick} disabled={disabled} className={combinedClass}>
      {children}
    </button>
  );
}