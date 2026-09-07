import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        Checking admin access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;