import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const API_URL = import.meta.env.VITE_API_URL || "/mock-reservations.json";

  // Fetch reservations from API
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

  // Refresh data every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update live clock every second
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
      <header className="flex items-start justify-between mb-8">
        {/* Logo on the left */}
        <div className="flex items-start">
          <img
            src="/logo.png"
            alt="Greenlane Logo"
            className="h-8 w-auto mt-1"
          />
        </div>

        {/* Clock and Last Updated */}
        <div className="text-right">
          <div className="text-sm text-gray-300">Current Time</div>
          <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-xs text-gray-300 mt-1">Last updated</div>
          <div className="text-sm">{lastUpdated ?? "—"}</div>
        </div>
      </header>

      {/* Reservations title */}
      <h2 className="text-3xl font-bold mb-6">Reservations</h2>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-auto text-center text-lg">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F3F3F5",
                  color: "#0D291A",
                  fontFamily: "sans-serif"
                }}
              >
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Start</th>
                <th className="px-6 py-3">End</th>
                <th className="px-6 py-3">Lane</th>
                <th className="px-6 py-3">Remark</th>
                <th className="px-6 py-3">SoC</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const bgColor = i % 2 === 0 ? "#0D291A" : "#02CC02";
                const textColor = "text-white";
                return (
                  <tr
                    key={i}
                    style={{ backgroundColor: bgColor }}
                    className={`${textColor} border-b border-gray-700`}
                  >
                    <td className="px-6 py-4">{r.licensePlate || "—"}</td>
                    <td className="px-6 py-4">
                      {r.startTime
                        ? new Date(r.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {r.endTime
                        ? new Date(r.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">{r.lane || "—"}</td>
                    <td className="px-6 py-4">{r.remark || "—"}</td>
                    <td className="px-6 py-4">{r.soc ?? "—"}%</td>
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
