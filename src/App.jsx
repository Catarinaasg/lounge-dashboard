import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [screen, setScreen] = useState("upcoming"); // alternate between "upcoming" and "ongoing"
  const API_URL = import.meta.env.VITE_API_URL || "./mock-reservations.json";

  async function fetchData() {
  try {
    console.log("Fetching from:", API_URL);
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.status}`);
    }

    const data = await res.json();
    console.log("Fetched data:", data);
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

  useEffect(() => {
    const screenInterval = setInterval(() => {
      setScreen((prev) => (prev === "upcoming" ? "ongoing" : "upcoming"));
    }, 10000); // switch every 10s
    return () => clearInterval(screenInterval);
  }, []);

  // ---- Sorting and filtering logic ----
  const now = new Date();

  const upcoming = reservations.filter((r) => new Date(r.startTime) > now);
  const ongoing = reservations.filter(
    (r) => new Date(r.startTime) <= now && new Date(r.endTime) >= now
  );
  const actionRequired = ongoing.filter(
    (r) => r.remark?.toLowerCase() === "idling"
  );

  const sortedUpcoming = [...upcoming].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );
  const sortedOngoing = [...ongoing].sort(
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
            className="mt-1"
            style={{
              fontSize: "14px",
              color: "#D1D5DB",
              fontFamily: "Geist, sans-serif",
            }}
          >
            Last updated:{" "}
            <span style={{ fontWeight: "bold" }}>
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

      {/* Screen title */}
      <h2
        className="font-bold mb-8"
        style={{
          fontSize: "32px",
          marginTop: "183px",
        }}
      >
        {screen === "upcoming"
          ? "Upcoming reservations"
          : "Ongoing sessions"}
      </h2>

      {/* Conditional content */}
      {screen === "upcoming" ? (
        <ReservationTable data={sortedUpcoming} />
      ) : (
        <>
          {actionRequired.length > 0 && (
            <>
              <h3 className="text-2xl font-bold mb-4">Action Required</h3>
              <ReservationTable data={actionRequired} />
            </>
          )}
          <h3 className="text-2xl font-bold mb-4 mt-8">Ongoing Sessions</h3>
          <ReservationTable data={sortedOngoing} />
        </>
      )}
    </div>
  );
}

/* ---- Table Component ---- */
function ReservationTable({ data }) {
  if (!data?.length) {
    return (
      <p className="text-gray-400 mt-20 text-lg text-center">
        No reservations to display
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-center">
        <thead>
          <tr
            style={{
              backgroundColor: "#02CC02",
              color: "#0D291A",
              height: "54px",
              fontSize: "20px",
              fontWeight: "bold",
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
          {data.map((r, i) => {
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
                <td className="px-6 py-4">
                  {r.lane ? (
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        borderRadius: "9999px",
                        backgroundColor: "#02CC02",
                        color: "#0D291A",
                        fontWeight: "600",
                        height: "24px",
                        width: "47px",
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
                    <div className="flex items-center gap-2 justify-center">
                      <div
                        style={{
                          backgroundColor: "#0D291A",
                          width: "100px",
                          height: "8px",
                          borderRadius: "9999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#02CC02",
                            width: `${r.soc}%`,
                            height: "100%",
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
  );
}
