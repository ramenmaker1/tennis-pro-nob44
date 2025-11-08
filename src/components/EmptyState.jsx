import React from "react";

export default function EmptyState({ icon = null, title, description, action = null, actions = null }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center gap-3">
        {icon && <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">{icon}</div>}
        {title && <h3 className="text-xl font-semibold text-slate-900">{title}</h3>}
        {description && <p className="text-slate-600 max-w-md">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
        {actions && <div className="mt-2 flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}

