import React from "react";

export default function AppCard({ title, children, className = "" }) {
  return (
    <div className={`p-4 border rounded-3 bg-white shadow-sm ${className}`}>
      {title ? <h3 className="mb-4 text-center">{title}</h3> : null}
      {children}
    </div>
  );
}
