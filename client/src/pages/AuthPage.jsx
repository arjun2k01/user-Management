// client/src/pages/AuthPage.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from "../components/Auth/AuthForm";
import { useAuth } from "../AuthContext";

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthSuccess = ({ user }) => {
    login(user);

    // If admin -> /admin, else /app
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }
  };

  const handleForgotPassword = () => {
    alert("In a real app this would open a forgot-password flow.");
  };

  return (
    <AuthForm
      onAuthSuccess={handleAuthSuccess}
      onForgotPassword={handleForgotPassword}
    />
  );
};

export default AuthPage;
