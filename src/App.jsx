import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUpcoming, setShowUpcoming] = useState(true);
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
    const refresh = setInterval(fetchData, 30000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // ⏱ auto-switch between screens every 10 seconds
  useEffect(() => {
    const switchInterval = setInterval(() => setShowUpcoming((prev) => !prev), 10000);
    return () => clearInterval(switchInterval);
  }, []);

  // Filter logic
  const now = new Date();
  const upcoming = reservations.filter((r) => new Date(r.startTime) > now);
  const ongoing = reservations.filter(
    (r) => new Date(r.startTime) <= now && new Date(r.endTime) >= now
  );
  const idling = ongoing.filter((r) => r.remark?.toLowerCase() === "idling");

  const dataToShow = showUpcoming ? upcoming : ongoing;
  const title = showUpcoming ? "Reservations" : "Ongoing sessions";

  return (
    <div
      className="min-h-screen flex flex-col p-8"
      style={{
        backgroundColor: "#0D291A",
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-8" style={{ marginTop: "64px" }}>
        <img src="/logo.png" alt="Greenlane Logo" className="h-8 w-auto mt-1" />
        <div className="text-right leading-tight">
          <div className="flex justify-end items-baseline gap-3">
            <span
              className="font-bold"
              style={{ fontSize: "36px", fontFamily: "Geist, sans-serif" }}
            >
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div
            className="text-gray-300 mt-1"
            style={{ fontSize: "14px", fontFamily: "Geist, sans-serif" }}
          >
            Last updated:{" "}
            <span className="font-bold">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </span>
          </div>
        </div>
      </header>

      {/* Table Section */}
      <h2
        className="font-bold"
        style={{
          marginTop: "183px",
          marginBottom: "24px",
          fontFamily: "Geist, sans-serif",
          fontSize: "20px",
        }}
      >
        {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center" style={{ fontSize: "20px" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#02CC02",
                color: "#0D291A",
                height: "54px",
                fontFamily: "Geist, sans-serif",
                fontWeight: "bold",
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
            {dataToShow.map((r, i) => {
              const bgColor = i % 2 === 0 ? "#0D291A" : "#24511D";
              return (
                <tr key={i} style={{ backgroundColor: bgColor, height: "54px" }}>
                  <td className="px-6 py-4">{r.licensePlate || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(r.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(r.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
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
                          lineHeight: "24px",
                          textAlign: "center",
                        }}
                      >
                        {r.lane}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">{r.remark || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-[#02CC02] h-2 rounded-full"
                          style={{
                            width: `${r.soc ?? 0}%`,
                          }}
                        ></div>
                      </div>
                      <span>{r.soc ?? "—"}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Required Section */}
      {!showUpcoming && idling.length > 0 && (
        <div className="mt-12">
          <h3
            className="font-bold mb-4"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "20px",
              color: "#02CC02",
            }}
          >
            ⚠️ Action Required
          </h3>
          <table className="min-w-full border-collapse text-center" style={{ fontSize: "20px" }}>
            <tbody>
              {idling.map((r, i) => (
                <tr key={i} style={{ backgroundColor: "#40210A", height: "54px" }}>
                  <td className="px-6 py-4">{r.licensePlate}</td>
                  <td className="px-6 py-4">Lane {r.lane}</td>
                  <td className="px-6 py-4 text-yellow-400">{r.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
