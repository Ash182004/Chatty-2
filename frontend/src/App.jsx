
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Suspense, useEffect } from "react";
import { useThemeStore } from "./store/useThemeStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./Components/Navbar.jsx";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  const { 
    authUser, 
    checkAuth, 
    isCheckingAuth, 
    onlineUsers,
    isSocketConnected
  } = useAuthStore();
  const { theme } = useThemeStore();

  // Check authentication status on initial render
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking auth status
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      
      {/* Online Users Indicator */}
      {authUser && (
        <div className="fixed bottom-4 right-4 flex gap-2 items-center">
          <div className={`w-3 h-3 rounded-full ${
            isSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}></div>
          <span className="text-sm">
            {onlineUsers.length} online
          </span>
        </div>
      )}

      <Suspense fallback={<Loader className="size-10 animate-spin" />}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
      
      <Toaster position="bottom-center" />
    </div>
  );
};

export default App;