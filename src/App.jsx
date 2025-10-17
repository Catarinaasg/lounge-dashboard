import React, { useEffect, useState } from "react";

export default function LoungeDashboard() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const API_URL = import.meta.env.VITE_API_URL || "/mock-reservations.json";

  async function fetchData() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setReservations([]);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const sorted = [...reservations].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  return (
    <div className="min-h-screen text-white flex flex-col p-8" style={{ backgroundColor: "#0D291A" }}>
      {/* Header with logo and clock */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img src="/logo.png" alt="Company Logo" className="h-8 w-auto mr-4" />
          {/* Optional: small text or slogan */}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300">Current Time</div>
          <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-sm text-gray-300 mt-1">Last updated</div>
          <div className="text-lg">{lastUpdated ?? "—"}</div>
        </div>
      </header>

      {/* Reservations title */}
      <h2 className="text-3xl font-bold mb-4">Reservations</h2>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-auto text-center text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3">License plate</th>
                <th className="px-6 py-3">Start time</th>
                <th className="px-6 py-3">End time</th>
                <th className="px-6 py-3">Lane</th>
                <th className="px-6 py-3">Remarks</th>
                <th className="px-6 py-3">SOC</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                // Alternating row colors
                const bgColor = i % 2 === 0 ? "#0D291A" : "#02CC02";
                const textColor = i % 2 === 0 ? "text-white" : "text-white"; // ensures good contrast
                return (
                  <tr key={i} style={{ backgroundColor: bgColor }} className={`${textColor} border-b border-gray-700`}>
                    <td className="px-6 py-4 font-bold text-xl">{r.licensePlate || "—"}</td>
                    <td className="px-6 py-4">{r.startTime ? new Date(r.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-6 py-4">{r.endTime ? new Date(r.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-6 py-4 font-medium">{r.lane || "—"}</td>
                    <td className="px-6 py-4">{r.remark || "—"}</td>
                    <td className="px-6 py-4 font-bold">{r.soc ?? "—"}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 mt-20 text-lg text-center">No reservations to display</p>
      )}
    </div>
  );
}
