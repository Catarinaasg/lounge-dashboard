import React, { useEffect, useState } from "react";

export default function LoungeDashboard() {
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
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const getStatusColor = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (now < startTime) return "bg-yellow-500/10 border-yellow-500";
    if (now > endTime) return "bg-red-500/10 border-red-500";
    return "bg-green-500/10 border-green-500";
  };

  const sorted = [...reservations].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  return (
    <div className="min-h-screen text-white flex flex-col p-8" style={{ backgroundColor: "#0D291A" }}>
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-wide">🔌 Charging Lounge</h1>
        <div className="text-right">
          <div className="text-sm text-gray-400">Current Time</div>
          <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-sm text-gray-400 mt-1">Last updated</div>
          <div className="text-lg">{lastUpdated ?? "—"}</div>
        </div>
      </header>

      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-auto text-center">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3">License Plate</th>
                <th className="px-6 py-3">Start Time</th>
                <th className="px-6 py-3">End Time</th>
                <th className="px-6 py-3">Lane / Remarks</th>
                <th className="px-6 py-3">SOC</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const statusColor = getStatusColor(r.startTime, r.endTime);
                return (
                  <tr key={i} className={`border-b border-gray-700 ${statusColor}`}>
                    <td className="px-6 py-4 font-bold text-xl">{r.licensePlate || "—"}</td>
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
