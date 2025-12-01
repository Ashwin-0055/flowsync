import { FiX, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function AnalysisModal({ analysis, onClose }) {
    // Helper to format the analysis text into sections if possible
    // Assuming the LLM returns markdown-like or structured text, but we'll handle plain text gracefully

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-up border border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary-900/50 to-dark-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                            <FiZap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Board Analysis</h2>
                            <p className="text-sm text-dark-300">AI-powered insights & recommendations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-dark-400 hover:text-white transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-dark-900/95">
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-dark-800/50 rounded-xl p-6 border border-white/5 mb-6">
                            <h3 className="text-lg font-semibold text-primary-300 mb-4 flex items-center gap-2">
                                <FiTrendingUp className="w-5 h-5" />
                                Executive Summary
                            </h3>
                            <div className="text-dark-100 leading-relaxed whitespace-pre-wrap">
                                {analysis}
                            </div>
                        </div>

                        {/* We could parse the analysis to show specific sections if we structured the prompt better, 
                            but for now, we wrap the whole text in a nice container. 
                            Future improvement: Ask LLM for JSON response. */}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-dark-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="btn btn-primary px-8"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    );
}
