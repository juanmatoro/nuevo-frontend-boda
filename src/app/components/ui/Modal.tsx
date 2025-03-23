"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }: ModalProps) {
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-2xl shadow-lg w-full ${maxWidth} relative`}>
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        {/* Contenido */}
        <div className="p-6">
          {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
