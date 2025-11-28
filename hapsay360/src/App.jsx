import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPortal from "./Auth/AuthPortal";
import ForgotPassword from "./Auth/ForgotPassword";
import CreateNewPassword from "./Auth/CreateNewPassword";
import AdminDashboard from "./Pages/AdminDashboard";
import UserDatabasePage from "./Pages/UserDatabasePage";
import ClearancePage from "./Pages/ClearancePage";
import BlotterPage from "./Pages/BlotterPage";
import SOSRequestsPage from "./Pages/SOSRequestsPage";
import StationsAndPersonnel from './Pages/StationsAndPersonnel'
import AnnouncementPage from "./Pages/AnnouncementPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPortal />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/CreateNewPassword" element={<CreateNewPassword />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/ClearancePage" element={<ClearancePage />} />
        <Route path="/BlotterPage" element={<BlotterPage />} />
        <Route path="/StationsAndPersonnel" element={<StationsAndPersonnel />} />
        <Route path="/AnnouncementPage" element={<AnnouncementPage />} />
        <Route path="/UserDatabase" element={<UserDatabasePage />} />
        <Route path="/SOSRequestsPage" element={<SOSRequestsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
