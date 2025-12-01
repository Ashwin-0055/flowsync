import { FiAlertTriangle } from 'react-icons/fi';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-xl shadow-2xl max-w-md w-full animate-slide-up">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-500 text-white p-3 rounded-lg">
                            <FiAlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-dark-50">{title}</h3>
                    </div>

                    <p className="text-dark-300 mb-6">{message}</p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="btn btn-danger"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
