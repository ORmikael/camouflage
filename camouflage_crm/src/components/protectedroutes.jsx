// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { baseURL } from "../utils/config";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [isValid, setIsValid] = useState(null); // null = checking, true = valid, false = invalid

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user || !allowedRoles.includes(user.role)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsValid(false);
        return;
      }

      try {
        // ==============================
        // ✅ VERIFY TOKEN USING FETCH
        // ==============================
        const res = await fetch(`${baseURL}/api/auth/verify-token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Token invalid or expired");
        }

        const data = await res.json();

        if (data.valid) {
          setIsValid(true);
        } else {
          throw new Error("Token marked invalid by server");
        }
      } catch (err) {
        console.error("[AUTH] Token check failed:", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsValid(false);
      }
    };

    validateToken();
  }, [allowedRoles]);

  if (isValid === null) return <div>Checking authentication...</div>;

  return isValid ? children : <Navigate to="/login" />;
}
