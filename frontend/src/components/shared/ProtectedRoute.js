import React from "react";
import { Navigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";

export default function ProtectedRoute(prop) {
  const { isUserDataLoading, isAuthenticated, element, userData, shouldCheckAdmin } = prop;

  if (isUserDataLoading) {
    return (
      <div className="bg-chassis py-24">
        <LinearProgress />
      </div>
    );
  }

  if (shouldCheckAdmin) {
    return isAuthenticated && userData.role === "Admin" ? element : <Navigate to="/login" />;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
}
