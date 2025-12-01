import { useEffect } from 'react';
import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function Toast({ message, type = 'info', onClose, duration = 10000 }) {
    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        info: <FiInfo className="w-5 h-5" />,
        success: <FiCheckCircle className="w-5 h-5" />,
        warning: <FiAlertTriangle className="w-5 h-5" />,
        error: <FiAlertTriangle className="w-5 h-5" />
    };

    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500'
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-up max-w-md">
            <div className="glass rounded-lg shadow-2xl overflow-hidden">
                <div className={`${colors[type]} h-1`}></div>
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className={`${colors[type]} text-white p-2 rounded-lg flex-shrink-0`}>
                            {icons[type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-dark-100 whitespace-pre-wrap break-words">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-dark-400 hover:text-dark-100 transition-colors flex-shrink-0"
                            aria-label="Close notification"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
