import React, { useEffect, useState } from "react";

export default function LoungeDashboard() {
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  async function fetchData() {
    if (!API_URL) return;
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setReservations([]);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
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
    <div className="min-h-screen text-white flex flex-col items-center p-8">
      <div className="w-full max-w-7xl">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-wide">🔌 Charging Lounge</h1>
          <div className="text-right">
            <div className="text-sm text-gray-300">Last updated</div>
            <div className="text-lg">{lastUpdated ?? "—"}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sorted.map((r, i) => {
            const statusColor = getStatusColor(r.startTime, r.endTime);
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 ${statusColor} p-6 shadow-lg flex flex-col justify-between`}
              >
                <div className="flex flex-col gap-3 text-center">
                  <div className="text-3xl font-extrabold tracking-wide">
                    {r.licensePlate || "—"}
                  </div>

                  <div className="text-lg">
                    {r.startTime
                      ? new Date(r.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}{" "}
                    –{" "}
                    {r.endTime
                      ? new Date(r.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </div>

                  <div className="text-gray-400 text-sm">{r.remark || ""}</div>

                  <div className="text-2xl font-bold mt-4">🔋 {r.soc ?? "—"}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <p className="text-gray-400 mt-20 text-lg text-center">No reservations to display</p>
        )}
      </div>
    </div>
  );
}
