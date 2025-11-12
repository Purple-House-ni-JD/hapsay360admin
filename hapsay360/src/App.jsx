import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPortal from "./components/AuthPortal";
import ForgotPassword from "./components/ForgotPassword";
import CreateNewPassword from "./components/CreateNewPassword";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPortal />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/CreateNewPassword" element={<CreateNewPassword />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
