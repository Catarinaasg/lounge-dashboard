import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [screen, setScreen] = useState("upcoming"); // "upcoming" | "ongoing"

  const envUrl = (import.meta.env.VITE_API_URL || "").trim();
  const PUBLIC_JSON_URL = `${import.meta.env.BASE_URL}mock-reservations.json`;
  const API_URL = envUrl || PUBLIC_JSON_URL;

  function isLikelyValidUrl(u) {
    try {
      if (!u || typeof u !== "string") return false;
      if (u.startsWith("/")) return true;
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  const now = new Date();

  function toLocalISOString(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds())
    );
  }

  function shiftRecordToToday(r) {
    const startOrig = new Date(r.startTime);
    const endOrig = new Date(r.endTime);
    const durationMs = Math.max(0, endOrig - startOrig);

    const today = new Date();
    const startShifted = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startOrig.getHours(),
      startOrig.getMinutes(),
      startOrig.getSeconds(),
      startOrig.getMilliseconds()
    );
    const endShifted = new Date(startShifted.getTime() + durationMs);

    return {
      ...r,
      startTime: toLocalISOString(startShifted),
      endTime: toLocalISOString(endShifted),
    };
  }

  function anyVisible(list) {
    const n = new Date();
    const hasOngoing = list.some((r) => {
      const s = new Date(r.startTime);
      const e = new Date(r.endTime);
      return s <= n && n <= e;
    });
    const hasUpcoming = list.some((r) => new Date(r.startTime) > n);
    return hasOngoing || hasUpcoming;
  }

  async function fetchData() {
    try {
      if (!isLikelyValidUrl(API_URL)) throw new Error(`Bad API_URL: "${API_URL}"`);
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Network error: ${res.status}`);

      const text = await res.text();
      const raw = JSON.parse(text);
      const data = Array.isArray(raw) ? raw : [];
      const normalized = anyVisible(data) ? data : data.map(shiftRecordToToday);

      setReservations(normalized);
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
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setScreen((prev) => (prev === "upcoming" ? "ongoing" : "upcoming"));
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const allowedRemarks = new Set(["charging", "idling"]);
  const isAllowedRemark = (r) =>
    allowedRemarks.has((r.remark || "").toLowerCase());

  const ongoingWindow = reservations.filter((r) => {
    const s = new Date(r.startTime);
    const e = new Date(r.endTime);
    return s <= now && now <= e;
  });
  const ongoingAllowed = ongoingWindow.filter(isAllowedRemark);

  const upcoming = reservations.filter(
    (r) => new Date(r.startTime) > now && !isAllowedRemark(r)
  );

  const filtered = screen === "ongoing" ? ongoingAllowed : upcoming;
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  const showTimes = screen !== "ongoing";
  const showBattery = screen === "ongoing";

  // ---- Blink keyframes style -------------------------------------
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blinkRow {
        0%, 100% { background-color: #2A4C1F; }
        50% { background-color: #F59E0B; color: #0D291A; }
      }
      .blink-row {
        animation: blinkRow 1.5s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ---- UI ----------------------------------------------------------
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
      <header className="flex items-start justify-between mb-8" style={{ marginTop: "32px" }}>
        <img src="/logo.png" alt="Greenlane Logo" className="h-8 w-auto mt-1" />
        <div className="text-right leading-tight">
          <div className="flex justify-end items-baseline gap-3">
            <span style={{ fontWeight: "bold", fontSize: "36px" }}>
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div style={{ fontSize: "14px", color: "#CCCCCC", marginTop: "4px" }}>
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
      <h2 className="text-3xl font-bold mb-6 mt-6">
        {screen === "ongoing" ? "Ongoing Sessions" : "Upcoming Reservations"}
      </h2>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
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
                <th className="px-6 py-3 w-[160px]">Vehicle</th>
                {showTimes && <th className="px-6 py-3 w-[150px]">Start</th>}
                {showTimes && <th className="px-6 py-3 w-[150px]">End</th>}
                <th className="px-6 py-3 w-[100px]">Lane</th>
                <th className="px-6 py-3 w-[300px]">Remark</th>
                {showBattery && <th className="px-6 py-3 w-[200px]">Battery</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const baseColor = i % 2 === 0 ? "#0D291A" : "#24511D";
                const remarkLower = (r.remark || "").toLowerCase();
                const isBlink =
                  screen === "ongoing" && remarkLower === "idling";
                const remarkDisplay =
                  remarkLower === "idling"
                    ? "Idling - Please move your vehicle"
                    : r.remark || "—";

                return (
                  <tr
                    key={i}
                    className={isBlink ? "blink-row" : ""}
                    style={{
                      backgroundColor: baseColor,
                      height: "54px",
                      fontSize: "20px",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <td className="px-6 py-4">{r.licensePlate || "—"}</td>

                    {showTimes && (
                      <td className="px-6 py-4">
                        {r.startTime
                          ? new Date(r.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    )}

                    {showTimes && (
                      <td className="px-6 py-4">
                        {r.endTime
                          ? new Date(r.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    )}

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

                    <td className="px-6 py-4">{remarkDisplay}</td>

                    {showBattery && (
                      <td className="px-6 py-4">
                        {r.soc !== null && r.soc !== undefined ? (
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-500 h-2 rounded">
                              <div
                                className="h-2 rounded"
                                style={{
                                  width: `${r.soc}%`,
                                  backgroundColor: "#02CC02",
                                }}
                              />
                            </div>
                            <span>{r.soc}%</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
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
