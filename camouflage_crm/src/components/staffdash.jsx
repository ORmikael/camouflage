// src/pages/StaffDashboard.jsx
import React from "react";

export default function StaffDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Staff Dashboard</h1>

      <p className="text-gray-600">
        Hello <span className="font-semibold">{user?.name}</span>, ready to manage tasks?
      </p>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Assigned Duties</h2>
          <p>Check and update your current assignments.</p>
        </div>

        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Messages</h2>
          <p>View updates or alerts from the management.</p>
        </div>
      </section>
    </div>
  );
}
