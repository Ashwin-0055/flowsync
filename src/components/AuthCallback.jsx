import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function AuthCallback() {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const completeSignIn = async () => {
            // Add a small delay to prevent flash of error state
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                // Confirm the link is a sign-in with email link
                if (!isSignInWithEmailLink(auth, window.location.href)) {
                    setErrorMessage('Invalid authentication link. Please request a new magic link.');
                    setStatus('error');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                // Get the email from localStorage
                let email = window.localStorage.getItem('emailForSignIn');

                if (!email) {
                    // If missing, prompt user to provide their email
                    email = window.prompt('Please provide your email for confirmation');
                }

                if (!email) {
                    setErrorMessage('Email is required to complete sign-in.');
                    setStatus('error');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                // Sign in with email link
                await signInWithEmailLink(auth, email, window.location.href);

                // Clear email from storage
                window.localStorage.removeItem('emailForSignIn');

                // Notify other tabs about successful authentication
                window.localStorage.setItem('auth_success', Date.now().toString());

                // Set success state
                setStatus('success');

                // Redirect to dashboard after brief success message
                setTimeout(() => navigate('/dashboard'), 1500);
            } catch (err) {
                console.error('Auth callback error:', err);
                let message = 'Authentication failed. ';

                if (err.code === 'auth/invalid-action-code') {
                    message += 'This link has expired or already been used. Please request a new magic link.';
                } else if (err.code === 'auth/invalid-email') {
                    message += 'Invalid email address.';
                } else if (err.code === 'auth/argument-error') {
                    message += 'Invalid authentication link.';
                } else {
                    message += err.message || 'Please try again.';
                }

                setErrorMessage(message);
                setStatus('error');

                // Redirect to landing page after showing error
                setTimeout(() => navigate('/'), 4000);
            }
        };

        completeSignIn();
    }, [navigate]);

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-dark-900">
                <div className="glass-premium rounded-3xl p-10 max-w-md w-full text-center border border-primary-500/20">
                    <FiLoader className="w-16 h-16 text-primary-500 mx-auto mb-6 animate-spin" />
                    <h2 className="text-3xl font-bold text-white mb-3">Signing you in...</h2>
                    <p className="text-dark-400">Please wait while we verify your magic link</p>
                    <div className="mt-6 flex justify-center gap-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-dark-900">
                <div className="glass-premium rounded-3xl p-10 max-w-md w-full text-center animate-scale-in border border-green-500/30">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <FiCheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient mb-3">Welcome Back!</h2>
                    <p className="text-dark-200 text-lg">Successfully authenticated</p>
                    <p className="text-dark-400 text-sm mt-2">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-dark-900">
                <div className="glass-premium rounded-3xl p-10 max-w-md w-full text-center animate-fade-in border border-red-500/30">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiAlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-400 mb-3">Authentication Failed</h2>
                    <p className="text-dark-300 mb-6 leading-relaxed">{errorMessage}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/')}
                            className="btn-gradient-animated w-full"
                        >
                            Request New Magic Link
                        </button>
                        <p className="text-sm text-dark-500">Auto-redirecting in a few seconds...</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
