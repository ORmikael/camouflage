import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils/config";

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${baseURL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("Signup successful. You can now log in.");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("[SIGNUP ERROR]", err);
      alert("Signup failed. Try again.");
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Sign Up</button>
    </form>
  );
}
