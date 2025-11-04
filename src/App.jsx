import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [screen, setScreen] = useState("upcoming"); // toggle between "upcoming" and "ongoing"

  const API_URL = import.meta.env.VITE_API_URL || "./mock-reservations.json";

  // Fetch data from API or mock
  async function fetchData() {
    try {
      console.log("Fetching from:", API_URL);
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      const data = await res.json();
      console.log("Fetched data:", data);
      setReservations(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setReservations([]);
    }
  }

  // Fetch data every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Alternate screens every 10 seconds
  useEffect(() => {
    const screenInterval = setInterval(() => {
      setScreen((prev) => (prev === "upcoming" ? "ongoing" : "upcoming"));
    }, 10000);
    return () => clearInterval(screenInterval);
  }, []);

  // Filter logic
  const now = new Date();

  const ongoing = reservations.filter((r) => {
    const start = new Date(r.startTime);
    const end = new Date(r.endTime);
    return start <= now && now <= end;
  });

  const upcoming = reservations.filter((r) => {
    const start = new Date(r.startTime);
    return start > now;
  });

  const actionRequired = ongoing.filter(
    (r) => r.remark?.toLowerCase() === "idling"
  );

  const filtered =
    screen === "ongoing"
      ? [...actionRequired, ...ongoing]
      : upcoming;

  const sorted = [...filtered].sort(
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
        className="flex items-start justify-between mb-8"
        style={{ marginTop: "64px" }}
      >
        <img src="/logo.png" alt="Greenlane Logo" className="h-8 w-auto mt-1" />
        <div className="text-right leading-tight">
          <div className="flex justify-end items-baseline gap-3">
            <span
              style={{
                fontWeight: "bold",
                fontSize: "36px",
                fontFamily: "Geist, sans-serif",
              }}
            >
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#CCCCCC",
              marginTop: "4px",
            }}
          >
            Last updated:{" "}
            <span style={{ fontWeight: "bold", color: "white" }}>
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
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "32px",
          marginTop: "183px",
        }}
      >
        {screen === "ongoing" ? "Ongoing Sessions" : "Upcoming Reservations"}
      </h2>

      {/* Action Required Section */}
      {screen === "ongoing" && actionRequired.length > 0 && (
        <div className="mb-8">
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#02CC02",
              marginBottom: "12px",
            }}
          >
            Action Required
          </h3>
          <ul>
            {actionRequired.map((r, i) => (
              <li key={i} className="text-lg">
                Vehicle {r.licensePlate} at Lane {r.lane} — {r.remark}
              </li>
            ))}
          </ul>
        </div>
      )}

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
                  fontWeight: "bold",
                  fontSize: "20px",
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
                    <td className="px-6 py-4">
                      {r.lane ? (
                        <span
                          className="inline-flex items-center justify-center font-semibold"
                          style={{
                            backgroundColor: "#02CC02",
                            color: "#0D291A",
                            width: "47px",
                            height: "24px",
                            borderRadius: "10px",
                            textAlign: "center",
                            padding: "10px",
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
                      {r.soc !== null && r.soc !== undefined ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-32 bg-gray-500 h-2 rounded">
                            <div
                              className="h-2 rounded"
                              style={{
                                width: `${r.soc}%`,
                                backgroundColor: "#02CC02",
                              }}
                            ></div>
                          </div>
                          <span>{r.soc}%</span>
                        </div>
                      ) : (
                        "—"
                      )}
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
