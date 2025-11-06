import React, { useEffect, useState } from "react";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [screen, setScreen] = useState("upcoming"); // "upcoming" | "ongoing"

  // ---- Data URL handling ----
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

  // ---- Helpers ----
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const toLocalISOString = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  // tolerant remark checks
  const norm = (s) => (s ?? "").toString().trim().toLowerCase();
  const isIdling   = (r) => norm(r.remark).startsWith("idling");
  const isCharging = (r) => norm(r.remark) === "charging";
  const isAllowedRemark = (r) => isCharging(r) || isIdling(r);

  // shift a single past record to today (preserve hours/duration)
  function normalizeToTodayIfPast(r) {
    const end = new Date(r.endTime);
    const nowLocal = new Date();
    if (end >= nowLocal) return r;
    const s0 = new Date(r.startTime);
    const e0 = new Date(r.endTime);
    const dur = Math.max(0, e0 - s0);
    const t = new Date();
    const s = new Date(
      t.getFullYear(), t.getMonth(), t.getDate(),
      s0.getHours(), s0.getMinutes(), s0.getSeconds(), s0.getMilliseconds()
    );
    const e = new Date(s.getTime() + dur);
    return { ...r, startTime: toLocalISOString(s), endTime: toLocalISOString(e) };
  }

  // ---- Fetch ----
  async function fetchData() {
    try {
      if (!isLikelyValidUrl(API_URL)) throw new Error(`Bad API_URL: "${API_URL}"`);
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      const text = await res.text();
      const raw = JSON.parse(text);
      const data = Array.isArray(raw) ? raw : [];
      const normalized = data.map(normalizeToTodayIfPast);
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

  // ---- Filtering ----
  const ongoingWindow = reservations.filter((r) => {
    const s = new Date(r.startTime);
    const e = new Date(r.endTime);
    return s <= now && now <= e;
  });

  const ongoingChargingOnly = ongoingWindow.filter(isCharging); // Ongoing table shows ONLY charging
  const idlingNow           = ongoingWindow.filter(isIdling);   // Action required (both screens)

  // Reservations (upcoming): non Charging/Idling that haven't ended yet
  const upcoming = reservations.filter((r) => {
    const end = new Date(r.endTime);
    return !isAllowedRemark(r) && end > now;
  });

  const mainRows = screen === "ongoing" ? ongoingChargingOnly : upcoming;

  // Sort: future-first for Reservations; for Ongoing just by startTime
  const sorted = [...mainRows].sort((a, b) => {
    const aS = new Date(a.startTime), bS = new Date(b.startTime);
    if (screen === "upcoming") {
      const aFuture = aS > now, bFuture = bS > now;
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
    }
    return aS - bS;
  });

  // ---- Column visibility ----
  const showTimes   = screen !== "ongoing";  // Ongoing hides Start/End
  const showBattery = screen === "ongoing";  // Reservations hide Battery

  // ---- Blink CSS for Idling rows ----
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blinkRow {
        0%, 100% { background-color: #2A4C1F; }
        50% { background-color: #FFFFFF; color: #0D291A; }
      }
      .blink-row { animation: blinkRow 3s infinite ease-in-out; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ---- Reusable table renderers ----
  const renderHeader = (opts) => (
    <tr
      style={{
        backgroundColor: "#02CC02",
        color: "#0D291A",
        height: "54px",
        fontWeight: "bold",
        fontSize: "20px",
      }}
    >
      <th className="px-6 py-3 w-[160px] text-left">Vehicle</th>
      {opts.showTimes && <th className="px-6 py-3 w-[150px] text-left">Start</th>}
      {opts.showTimes && <th className="px-6 py-3 w-[150px] text-left">End</th>}
      <th className="px-6 py-3 w-[100px] text-left">Lane</th>
      <th className="px-6 py-3 w-[300px] text-left">Remark</th>
      {opts.showBattery && <th className="px-6 py-3 w-[200px] text-left">Battery</th>}
    </tr>
  );

  const renderRows = (rows, opts) =>
    rows.map((r, i) => {
      const baseColor = i % 2 === 0 ? "#0D291A" : "#24511D";
      const blink = isIdling(r); // idling rows blink (in Action required)
      const remarkDisplay = isIdling(r)
        ? "Idling - ⚠️ Please move your vehicle"
        : r.remark || "—";

      return (
        <tr
          key={`${r.licensePlate}-${r.startTime}-${i}`}
          className={blink ? "blink-row" : ""}
          style={{
            backgroundColor: baseColor,
            height: "54px",
            fontSize: "20px",
            transition: "background-color 0.3s ease",
          }}
        >
          <td className="px-6 py-4 text-left">{r.licensePlate || "—"}</td>

          {opts.showTimes && (
            <td className="px-6 py-4 text-left">
              {r.startTime
                ? new Date(r.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </td>
          )}

          {opts.showTimes && (
            <td className="px-6 py-4 text-left">
              {r.endTime
                ? new Date(r.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </td>
          )}

          <td className="px-6 py-4 text-left">
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

          <td className="px-6 py-4 text-left">{remarkDisplay}</td>

          {opts.showBattery && (
            <td className="px-6 py-4 text-left">
              {r.soc !== null && r.soc !== undefined ? (
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-500 h-2 rounded">
                    <div
                      className="h-2 rounded"
                      style={{ width: `${r.soc}%`, backgroundColor: "#02CC02" }}
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
    });

  // ---- UI ----
  return (
    <div
      className="min-h-screen flex flex-col p-8"
      style={{ backgroundColor: "#0D291A", fontFamily: "Geist, sans-serif", color: "white" }}
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-8" style={{ marginTop: "32px" }}>
        <img src="/logo.png" alt="Greenlane Logo" className="h-8 w-auto mt-1" />
        <div className="text-right leading-tight">
          <div className="flex justify-end items-baseline gap-3">
            <span style={{ fontWeight: "bold", fontSize: "36px" }}>
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div style={{ fontSize: "14px", color: "#CCCCCC", marginTop: "4px" }}>
            Last updated:{" "}
            <span style={{ fontWeight: "bold", color: "white" }}>
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-6 mt-6">
        {screen === "ongoing" ? "Ongoing Sessions" : "Reservations"}
      </h2>

      {/* Action required (ALWAYS on top, both screens) */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
          Action required
        </h3>
        {idlingNow.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>{renderHeader({ showTimes: false, showBattery: true })}</thead>
              <tbody>{renderRows(idlingNow, { showTimes: false, showBattery: true })}</tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No vehicles require immediate action.</p>
        )}
      </div>

      {/* Section title per screen, then main table */}
      <div className="mb-3">
        <h3 className="text-2xl font-bold">
          {screen === "ongoing" ? "Ongoing sessions" : "Reservations"}
        </h3>
      </div>

      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>{renderHeader({ showTimes, showBattery })}</thead>
            <tbody>{renderRows(sorted, { showTimes, showBattery })}</tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 mt-6 text-lg">No reservations to display</p>
      )}
    </div>
  );
}
