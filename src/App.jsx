import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const API_URL = import.meta.env.VITE_API_URL || "/mock-reservations.json";

  async function fetchData() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Network error");
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
    <div
      className="min-h-screen flex flex-col p-8"
      style={{ backgroundColor: "#0D291A", color: "white" }}
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-8">
        <img src="/logo.png" alt="Greenlane Logo" className="h-8 w-auto mt-1" />
        <div className="text-right leading-tight">
          <div className="flex justify-end items-baseline gap-3">
            <span className="text-lg font-mono">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1 font-bold">
            Last updated:{" "}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—"}
          </div>
        </div>
      </header>

      {/* Reservations Title */}
      <h2 className="text-3xl font-bold mb-8">Reservations</h2>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-center text-lg">
            <thead>
              <tr
                style={{
                  backgroundColor: "#02CC02",
                  color: "#0D291A",
                  height: "54px",
                }}
              >
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Start</th>
                <th className="px-6 py-3">End</th>
                <th className="px-6 py-3">Lane</th>
                <th className="px-6 py-3">Remark</th>
                <th className="px-6 py-3">Battery</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const bgColor = i % 2 === 0 ? "#0D291A" : "#24511D";
                return (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: bgColor,
                      height: "54px",
                    }}
                  >
                    <td className="px-6 py-4">{r.licensePlate || "—"}</td>
                    <td className="px-6 py-4">
                      {r.startTime
                        ? new Date(r.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {r.endTime
                        ? new Date(r.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    {/* Lane badge as horizontal ellipse */}
                    <td className="px-6 py-4">
                      {r.lane ? (
                        <span
                          className="inline-flex items-center justify-center font-semibold"
                          style={{
                            backgroundColor: "#02CC02",
                            color: "#0D291A",
                            height: "24px",
                            width: "47px",
                            borderRadius: "10px",
                            display: "inline-flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {r.lane}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-6 py-4">{r.remark || "—"}</td>
                    <td className="px-6 py-4">{r.battery ?? "—"}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 mt-20 text-lg text-center">
          No reservations to display
        </p>
      )}
    </div>
  );
}
