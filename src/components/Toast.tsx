import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <i className="bi bi-check-circle-fill"></i>;
      case 'error': return <i className="bi bi-x-circle-fill"></i>;
      case 'warning': return <i className="bi bi-exclamation-triangle-fill"></i>;
      case 'info': return <i className="bi bi-info-circle-fill"></i>;
      default: return <i className="bi bi-bell-fill"></i>;
    }
  };

  return (
    <div 
      className={`toast show align-items-center text-white border-0 ${getBgColor()}`}
      role="alert"
      style={{
        minWidth: '300px',
        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="d-flex">
        <div className="toast-body d-flex align-items-center gap-2">
          <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
          <span style={{ fontWeight: 500 }}>{message}</span>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div className="d-flex flex-column gap-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
