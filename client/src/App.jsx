import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Home from "./components/Home";
import TypingTest from "./components/TypingTest";
import MultiplayerRoom from "./components/MultiplayerRoom";
import AuthForm from "./components/AuthForm";
import { useParams } from "react-router-dom";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <AuthForm />
      </div>
    );
  }

  return children;
}

// Multiplayer Room Route Handler
function MultiplayerRoomPage() {
  const { roomId } = useParams();
  return <MultiplayerRoom roomId={roomId} />;
}

// Main App Layout
function AppLayout() {
  const { currentUser } = useAuth();

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? (
                <Home />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 80px)",
                    padding: "1rem",
                  }}
                >
                  <AuthForm />
                </div>
              )
            }
          />

          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <TypingTest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/multiplayer/:roomId"
            element={
              <ProtectedRoute>
                <MultiplayerRoomPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
