import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ActivityPage from "./pages/ActivityPage";
import ChatPage from "./pages/ChatPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "10px",
                background: "var(--surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-lg)",
                fontSize: "14px",
              },
            }}
          />
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index             element={<DashboardPage />} />
              <Route path="projects"   element={<ProjectsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="chat"       element={<ChatPage />} />
              <Route path="calendar"   element={<CalendarPage />} />
              <Route path="reports"    element={<ReportsPage />} />
              <Route path="profile"    element={<ProfilePage />} />
              <Route path="users"      element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
              <Route path="activity"   element={<ProtectedRoute adminOnly><ActivityPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
