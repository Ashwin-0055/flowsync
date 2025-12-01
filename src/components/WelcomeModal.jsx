import { useState } from 'react';
import { FiX, FiPlus, FiZap, FiMove, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const TUTORIAL_STEPS = [
    {
        icon: FiPlus,
        title: 'Create Your First Card',
        description: 'Click the "+ Add Card" button in any list to create your first task.',
        color: 'bg-blue-500'
    },
    {
        icon: FiZap,
        title: 'Use AI to Plan',
        description: 'Open any card and click "✨ AI: Refine Task" to get detailed action steps.',
        color: 'bg-purple-500'
    },
    {
        icon: FiMove,
        title: 'Drag & Drop',
        description: 'Drag cards between lists as work progresses through your workflow.',
        color: 'bg-green-500'
    },
    {
        icon: FiTrendingUp,
        title: 'Analyze Your Flow',
        description: 'Click "Analyze Flow" to get AI-powered insights on bottlenecks and priorities.',
        color: 'bg-yellow-500'
    }
];

export default function WelcomeModal({ onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-dark-50">Welcome to FlowSync! 🎉</h2>
                        <p className="text-dark-400 mt-1">Let's get you started in just 4 steps</p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-dark-500 hover:text-dark-300 transition-colors"
                        aria-label="Close tutorial"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Progress Indicators */}
                    <div className="flex justify-center gap-2 mb-8">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all ${index === currentStep
                                        ? 'w-8 bg-primary-500'
                                        : index < currentStep
                                            ? 'w-2 bg-primary-500'
                                            : 'w-2 bg-dark-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Current Step */}
                    <div className="text-center space-y-6">
                        <div className={`${TUTORIAL_STEPS[currentStep].color} w-20 h-20 rounded-full flex items-center justify-center mx-auto`}>
                            {(() => {
                                const Icon = TUTORIAL_STEPS[currentStep].icon;
                                return <Icon className="w-10 h-10 text-white" />;
                            })()}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-dark-50">
                                Step {currentStep + 1}: {TUTORIAL_STEPS[currentStep].title}
                            </h3>
                            <p className="text-lg text-dark-300 max-w-md mx-auto">
                                {TUTORIAL_STEPS[currentStep].description}
                            </p>
                        </div>

                        {/* Example Visual (optional) */}
                        <div className="bg-dark-800 rounded-lg p-6 max-w-md mx-auto border border-dark-700">
                            <div className="flex items-center justify-center gap-3 text-dark-500">
                                {(() => {
                                    const Icon = TUTORIAL_STEPS[currentStep].icon;
                                    return <Icon className="w-6 h-6" />;
                                })()}
                                <span className="text-sm">Hover over elements to see interactive hints</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-700 flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="text-dark-400 hover:text-dark-200 transition-colors"
                    >
                        Skip Tutorial
                    </button>

                    <div className="flex items-center gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {currentStep === TUTORIAL_STEPS.length - 1 ? (
                                <>
                                    Get Started
                                    <FiArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <FiArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
