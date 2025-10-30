import React from 'react';

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-50 w-[95%] max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <div className="p-4 text-zinc-300">{children}</div>
        {footer && <div className="p-4 border-t border-zinc-800">{footer}</div>}
      </div>
    </div>
  );
}
