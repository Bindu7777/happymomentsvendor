import React from "react";
import { Navigate } from "react-router-dom";
import { User } from 'firebase/auth';


// Assume you get user info from context, Redux, or props
export function AdminRoute({ user , children }) {
    console.log("AdminRoute user",user.email);
  if (!user ||!(user).email.includes("admin")) {
    return <Navigate to="/not-authorized" replace />;
  }
  return children;
}
