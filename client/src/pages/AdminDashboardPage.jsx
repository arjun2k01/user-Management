// client/src/pages/AdminDashboardPage.jsx
import React from "react";
import UsersPage from "../components/Users/UsersPage";
import { useAuth } from "../AuthContext";

const AdminDashboardPage = ({ onUnauthorized }) => {
  const { user } = useAuth();

  return <UsersPage user={user} onUnauthorized={onUnauthorized} />;
};

export default AdminDashboardPage;
