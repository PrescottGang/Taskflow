import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./auth/login/page";
import Register from "./auth/register/page";
import Dashboard from "./components/dashboard/Dashboard";
import Tasks from "./components/task/Tasks";
import Calendar from "./components/calender/Calendar";
import Team from "./components/Equipe/Team";
import Settings from "./components/Paramètre/Settings";
import Password from "./auth/forgot_password/page";

function Layout() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navbar />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<Password />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
      <Layout />
  );
}

