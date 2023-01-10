import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./components/SignUp";
import VerifyEmail from "./components/VerifyEmail";
import VerifyOtp from "./components/VerifyOtp";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
export const url = "https://resetpassword-task.onrender.com";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/Dashboard" />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="accounts/login" element={<Login />} />
          <Route path="accounts/emailsignup" element={<SignUp />} />
          <Route
            path="accounts/password/reset/:id"
            element={<ForgotPassword />}
          />
          <Route
            path="accounts/password/reset/verification/email"
            element={<VerifyEmail />}
          />
          <Route
            path="accounts/password/reset/verification/otp"
            element={<VerifyOtp />}
          />
          <Route
            path="accounts/password/reset/:id"
            element={<ForgotPassword />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
