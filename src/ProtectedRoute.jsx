import { Navigate } from "react-router-dom";
import { UserAuth } from "./UserAuth";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = UserAuth();

  if (loading) return <h2>Loading...</h2>;

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};