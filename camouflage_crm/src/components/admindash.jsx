// src/pages/AdminDashboard.jsx
import React from "react";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>

      <p className="text-gray-600">
        Welcome back, <span className="font-semibold">{user?.name}</span> 👋
      </p>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p>View, promote, or remove platform users.</p>
        </div>

        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p>Access system-wide statistics and reports.</p>
        </div>
      </section>
    </div>
  );
}
