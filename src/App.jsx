import React, { useEffect, useState } from "react";

export default function LoungeDashboard() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const API_URL = import.meta.env.VITE_API_URL;

  async function fetchData() {
    if (!API_URL) return;
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setReservations([]);
    }
  }

  useEffect(() => {
    fetchData();
    const fetchInterval = setInterval(fetchData, 30000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(fetchInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const sorted = [...reservations].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  return (
    <div className="min-h-screen text-white p-8" style={{ backgroundColor: "#0D291A" }}>
      {/* Header */}
      <header className="flex items-start justify-between mb-12">
        <div className="flex items-start space-x-4">
          <img
            src="/greenlane-logo.png"
            alt="Greenlane logo"
            className="h-8 object-contain"
          />
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Last updated:{" "}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—"}
          </div>
        </div>
      </header>

      {/* Reservations title */}
      <h2 className="text-3xl font-semibold text-white mb-6">Reservations</h2>

      {/* Table */}
      <div className="w-full max-w-7xl mx-auto">
        <table className="w-full text-left border-collapse">
          <thead
            style={{
              backgroundColor: "#02CC02",
              color: "#0D291A",
              fontFamily: "sans-serif",
            }}
          >
            <tr style={{ height: "54px" }}>
              <th className="px-6 py-3 text-sm font-bold">Vehicle</th>
              <th className="px-6 py-3 text-sm font-bold">Start</th>
              <th className="px-6 py-3 text-sm font-bold">End</th>
              <th className="px-6 py-3 text-sm font-bold">Lane</th>
              <th className="px-6 py-3 text-sm font-bold">Remark</th>
              <th className="px-6 py-3 text-sm font-bold">SoC</th>
            </tr>
          </thead>
          <tbody className="text-white" style={{ fontFamily: "sans-serif" }}>
            {sorted.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? "#0D291A" : "#24511D",
                  height: "54px",
                }}
              >
                <td className="px-6 py-4 text-sm">{r.licensePlate || "—"}</td>
                <td className="px-6 py-4 text-sm">{r.startTime || "—"}</td>
                <td className="px-6 py-4 text-sm">{r.endTime || "—"}</td>
                <td className="px-6 py-4">
                  {r.lane ? (
                    <span
                      className="inline-flex items-center justify-center font-semibold"
                      style={{
                        border: "2px solid #02CC02",
                        color: "#0D291A",
                        backgroundColor: "white",
                        padding: "10px",
                        height: "36px",
                        minWidth: "60px",
                        borderRadius: "10px",
                        display: "inline-flex",
                      }}
                    >
                      {r.lane}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4 text-sm">{r.remark || "—"}</td>
                <td className="px-6 py-4 text-sm">{r.soc || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <p className="text-gray-400 mt-20 text-lg text-center">No reservations to display</p>
        )}
      </div>
    </div>
  );
}
