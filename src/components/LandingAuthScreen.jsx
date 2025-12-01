import { useState, useEffect } from 'react';
import {
    sendSignInLinkToEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
    FiMail, FiCheck, FiArrowRight, FiZap, FiUsers,
    FiTrendingUp, FiStar, FiActivity, FiShield,
    FiClock, FiAward, FiGlobe
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function LandingAuthScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [authSuccess, setAuthSuccess] = useState(false);
    const navigate = useNavigate();

    // Track mouse for parallax effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Listen for authentication success from other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'auth_success') {
                setAuthSuccess(true);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const actionCodeSettings = {
        url: window.location.origin + '/auth/callback',
        handleCodeInApp: true,
    };

    const handleSendMagicLink = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setEmailSent(true);
        } catch (err) {
            console.error('Error sending email link:', err);
            setError(err.message || 'Failed to send magic link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // AuthContext will handle the redirect
            navigate('/dashboard');
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError(err.message || 'Failed to sign in with Google. Please try again.');
        }
    };

    // Show success message if authenticated in another tab
    if (authSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-dark-900">
                <div className="glass-premium rounded-3xl p-10 max-w-md w-full text-center animate-scale-in border border-green-500/30">
                    <div className="success-circle mb-6">
                        <FiCheck className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient mb-3">Successfully Logged In!</h2>
                    <p className="text-dark-200 mb-6 text-lg">
                        You've been authenticated in another tab.
                    </p>
                    <div className="bg-dark-800/50 rounded-xl p-4 mb-6 border border-primary-500/30">
                        <p className="text-dark-300 text-sm">
                            ✓ You can safely close this tab<br />
                            ✓ Continue using FlowSync in your other tab
                        </p>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="btn-gradient-animated w-full"
                    >
                        Close This Tab
                    </button>
                </div>
            </div>
        );
    }

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-dark-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-radial from-primary-900/20 via-dark-900 to-dark-900"></div>
                <div className="absolute inset-0 animated-mesh-gradient opacity-30"></div>

                <div className="glass-premium rounded-3xl p-10 max-w-md w-full text-center animate-scale-in relative z-10 border border-primary-500/20">
                    <div className="success-checkmark-container mb-6">
                        <div className="success-circle">
                            <FiCheck className="w-10 h-10 text-white checkmark-icon" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gradient mb-3">Check Your Inbox!</h2>
                    <p className="text-dark-200 mb-2 text-lg">
                        We've sent a magic link to
                    </p>
                    <p className="text-primary-400 font-semibold text-xl mb-6 break-all">{email}</p>
                    <p className="text-sm text-dark-400 mb-8 leading-relaxed">
                        Click the link in your email to sign in instantly. <br />
                        <span className="text-primary-400">Link expires in 1 hour.</span>
                    </p>
                    <button
                        onClick={() => {
                            setEmailSent(false);
                            setEmail('');
                        }}
                        className="btn-outline w-full group"
                    >
                        <span className="relative z-10">Use Different Email</span>
                    </button>
                </div>

                {/* Floating particles */}
                <div className="particles-container">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 overflow-x-hidden relative">
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden relative">
                {/* Animated Mesh Background */}
                <div className="absolute inset-0 animated-mesh-gradient"></div>

                {/* Floating Orbs with 3D effect */}
                <div
                    className="floating-orb orb-1"
                    style={{
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
                    }}
                ></div>
                <div
                    className="floating-orb orb-2"
                    style={{
                        transform: `translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px)`
                    }}
                ></div>
                <div
                    className="floating-orb orb-3"
                    style={{
                        transform: `translate(${mousePosition.x * 1.5}px, ${-mousePosition.y}px)`
                    }}
                ></div>

                {/* Particles */}
                <div className="particles-container">
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 15}s`
                        }}></div>
                    ))}
                </div>

                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10 px-4">
                    {/* Left Side - Hero Content */}
                    <div className="space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 glass-badge px-4 py-2 rounded-full animate-slide-down">
                            <FiStar className="w-4 h-4 text-yellow-400 animate-spin-slow" />
                            <span className="text-sm font-medium">AI-Powered Workspace</span>
                        </div>

                        {/* Main Heading with Gradient */}
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none animate-fade-in-up">
                                <span className="text-white block">FlowSync</span>
                                <span className="text-gradient-animated block mt-2">
                                    Smart Kanban
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-dark-300 leading-relaxed animate-fade-in-up animation-delay-200 max-w-xl mx-auto lg:mx-0">
                                Transform your team's workflow with real-time collaboration and intelligent AI assistance.
                            </p>
                        </div>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start animate-fade-in-up animation-delay-400">
                            <div className="feature-pill">
                                <FiActivity className="w-4 h-4" />
                                <span>Real-Time Sync</span>
                            </div>
                            <div className="feature-pill">
                                <FiZap className="w-4 h-4" />
                                <span>AI Planning</span>
                            </div>
                            <div className="feature-pill">
                                <FiUsers className="w-4 h-4" />
                                <span>Team Collaboration</span>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid md:grid-cols-3 gap-4 animate-fade-in-up animation-delay-600">
                            <div className="feature-card group">
                                <div className="feature-icon bg-gradient-to-br from-primary-500 to-blue-600">
                                    <FiZap className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors">AI Planning</h3>
                                <p className="text-sm text-dark-400">Smart task estimation</p>
                            </div>

                            <div className="feature-card group">
                                <div className="feature-icon bg-gradient-to-br from-green-500 to-emerald-600">
                                    <FiUsers className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">Live Sync</h3>
                                <p className="text-sm text-dark-400">Instant updates</p>
                            </div>

                            <div className="feature-card group">
                                <div className="feature-icon bg-gradient-to-br from-purple-500 to-pink-600">
                                    <FiTrendingUp className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">Analytics</h3>
                                <p className="text-sm text-dark-400">Flow insights</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Auth Form */}
                    <div className="animate-slide-in-right">
                        <div className="glass-premium rounded-3xl p-8 md:p-10 space-y-6 border border-primary-500/20 backdrop-blur-xl">
                            <div className="text-center space-y-3">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                                    <FiMail className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">Get Started</h2>
                                <p className="text-dark-300 text-lg">No password needed • Just your email</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 animate-shake">
                                    <p className="text-red-400 text-sm flex items-center gap-2">
                                        <span>⚠️</span> {error}
                                    </p>
                                </div>
                            )}

                            {/* Google Sign-In Button */}
                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl border border-gray-200 group"
                            >
                                <FcGoogle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span>Continue with Google</span>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-2">
                                <div className="flex-1 h-px bg-dark-700"></div>
                                <span className="text-dark-500 text-sm font-medium">OR</span>
                                <div className="flex-1 h-px bg-dark-700"></div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleSendMagicLink} className="space-y-4">
                                <div className="form-group">
                                    <label htmlFor="email" className="block text-sm font-semibold text-dark-200 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        <div className="relative flex items-center">
                                            <FiMail className="absolute left-4 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors z-10" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="input-modern pl-12"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-gradient-animated w-full group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg font-bold">
                                        {loading ? (
                                            <>
                                                <div className="loading-spinner"></div>
                                                Sending Magic Link...
                                            </>
                                        ) : (
                                            <>
                                                Send Magic Link
                                                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>

                            <div className="pt-4 border-t border-dark-700">
                                <p className="text-center text-sm text-dark-500 flex items-center justify-center gap-2">
                                    <FiCheck className="w-4 h-4 text-green-400" />
                                    Secure • Passwordless • Instant Access
                                </p>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-6 text-center space-y-2 animate-fade-in animation-delay-800">
                            <p className="text-xs text-dark-500 uppercase tracking-wider font-semibold">Trusted by teams worldwide</p>
                            <div className="flex items-center justify-center gap-4 text-dark-600">
                                <span className="text-2xl">★★★★★</span>
                                <span className="text-sm">4.9/5 rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 relative z-10 bg-dark-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Everything you need to{' '}
                            <span className="text-gradient-animated">manage workflow</span>
                        </h2>
                        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
                            Powerful features designed to supercharge your team's productivity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: FiShield, title: 'Enterprise Security', desc: 'Bank-level encryption', color: 'from-blue-500 to-cyan-600' },
                            { icon: FiClock, title: 'Real-Time Updates', desc: 'Instant synchronization', color: 'from-green-500 to-emerald-600' },
                            { icon: FiGlobe, title: 'Global CDN', desc: 'Lightning fast anywhere', color: 'from-purple-500 to-pink-600' },
                            { icon: FiAward, title: 'AI-Powered', desc: 'Smart task management', color: 'from-yellow-500 to-orange-600' }
                        ].map((feature, i) => (
                            <div key={i} className="feature-card group">
                                <div className={`feature-icon bg-gradient-to-br ${feature.color}`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                                <p className="text-dark-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center glass-premium rounded-3xl p-12 border border-primary-500/20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to transform your workflow?
                    </h2>
                    <p className="text-xl text-dark-300 mb-8">
                        Join thousands of teams already using FlowSync
                    </p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="btn-gradient-animated px-12 py-5 text-xl"
                    >
                        Get Started Free
                        <FiArrowRight className="inline-block ml-2" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-dark-800 relative z-10">
                <div className="max-w-7xl mx-auto text-center text-dark-500 text-sm">
                    <p>© 2025 FlowSync. All rights reserved. Built with ❤️ for productive teams.</p>
                </div>
            </footer>
        </div>
    );
}
