import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TeamProvider } from './contexts/TeamContext';
import { BoardProvider } from './contexts/BoardContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingAuthScreen from './components/LandingAuthScreen';
import AuthCallback from './components/AuthCallback';
import FlowSync from './components/FlowSync';
import './index.css';

function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-dark-400">Loading...</p>
                </div>
            </div>
        );
    }

    return currentUser ? children : <Navigate to="/" />;
}

function AppRoutes() {
    const { currentUser } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={currentUser ? <Navigate to="/dashboard" /> : <LandingAuthScreen />}
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <FlowSync />
                    </ProtectedRoute>
                }
            />
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <BoardProvider>
                        <TeamProvider>
                            <AppRoutes />
                        </TeamProvider>
                    </BoardProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
