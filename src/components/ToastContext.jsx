import React, { createContext, useContext, useState } from 'react';
import { 
  CheckCircle as SuccessIcon,
  XCircle as ErrorIcon,
  AlertTriangle as WarningIcon,
  X as CloseIcon 
} from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after specified duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info: (message, duration) => addToast('info', message, duration)
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === 'success' && <SuccessIcon size={20} />}
              {toast.type === 'error' && <ErrorIcon size={20} />}
              {toast.type === 'warning' && <WarningIcon size={20} />}
              {toast.type === 'info' && <WarningIcon size={20} />}
            </div>
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close"
              onClick={() => onRemove(toast.id)}
              aria-label="Close notification"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};