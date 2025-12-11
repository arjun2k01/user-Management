// client/src/pages/DashboardPage.jsx

import UsersPage from "../components/Users/UsersPage";

const DashboardPage = ({ user, onUnauthorized }) => {
  return <UsersPage user={user} onUnauthorized={onUnauthorized} />;
};

export default DashboardPage;
