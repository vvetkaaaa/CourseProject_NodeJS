import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppRouter = ({ userRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token || (userRole && userRole !== "ADMIN")) {
      console.log("Redirecting to 404 page...");
      navigate("/404");
    }
  }, [userRole, navigate]);

  return null;
};

export default AppRouter;
