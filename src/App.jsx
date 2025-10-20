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
      style={{
        backgroundColor: "#0D291A",
        fontFamily: "Geist, sans-serif",
        color: "white",
      }}
    >
      {/* Header */}
      <header
        className="flex items-start justify-between"
        style={{ marginTop: "64px" }}
      >
        <img src="/logo.png" alt="Greenlane Logo" className="h-8 w-auto mt-1" />

        <div className="text-right leading-tight">
          <div className="flex justify-end items-baseline gap-3">
            <span
              className="font-bold"
              style={{ fontSize: "36px", fontFamily: "Geist, sans-serif" }}
            >
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div
            className="text-gray-300 mt-1"
            style={{
              fontSize: "14px",
              fontFamily: "Geist, sans-serif",
            }}
          >
            Last updated:{" "}
            <span className="font-bold">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </header>

      {/* Title */}
      <h2
        className="font-bold text-3xl"
        style={{
          marginTop: "122px",
          marginBottom: "32px",
          fontFamily: "Geist, sans-serif",
        }}
      >
        Reservations
      </h2>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-center">
            <thead>
              <tr
                style={{
                  backgroundColor: "#02CC02",
                  color: "#0D291A",
                  height: "54px",
                  fontSize: "20px",
                  fontWeight: "700",
                  fontFamily: "Geist, sans-serif",
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
                      fontSize: "20px",
                      fontWeight: "400",
                      fontFamily: "Geist, sans-serif",
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

                    {/* Lane ellipse */}
                    <td className="px-6 py-4">
                      {r.lane ? (
                        <span
                          className="inline-flex items-center justify-center font-semibold"
                          style={{
                            border: "2px solid #02CC02",
                            color: "#0D291A",
                            backgroundColor: "#02CC02",
                            width: "47px",
                            height: "24px",
                            borderRadius: "10px",
                          }}
                        >
                          {r.lane}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-6 py-4">{r.remark || "—"}</td>

                    {/* Battery progress bar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-[#02CC02] h-2 rounded-full"
                            style={{
                              width: `${r.battery ?? 0}%`,
                            }}
                          ></div>
                        </div>
                        <span>{r.battery ?? 0}%</span>
                      </div>
                    </td>
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
