import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils/config";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const payload = { email, password };

    try {
      const res = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user.role;

        if (role === "management") navigate("/admin");
        else if (role === "staff") navigate("/staff");
        else navigate("/profile");  // normal user

      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("[LOGIN ERROR]", err);
      alert("Failed to connect to server.");
    }
  }

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
