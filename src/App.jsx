<table className="min-w-full border-collapse table-auto text-center text-lg"> {/* text-lg sets uniform size */}
  <thead>
    <tr
      style={{
        backgroundColor: "#F3F3F5",
        color: "#0D291A",
        fontFamily: "sans-serif"
      }}
    >
      <th className="px-6 py-3">Vehicle</th>
      <th className="px-6 py-3">Start</th>
      <th className="px-6 py-3">End</th>
      <th className="px-6 py-3">Lane</th>
      <th className="px-6 py-3">Remark</th>
      <th className="px-6 py-3">SoC</th>
    </tr>
  </thead>
  <tbody>
    {sorted.map((r, i) => {
      const bgColor = i % 2 === 0 ? "#0D291A" : "#02CC02";
      const textColor = "text-white";
      return (
        <tr
          key={i}
          style={{ backgroundColor: bgColor }}
          className={`${textColor} border-b border-gray-700`}
        >
          <td className="px-6 py-4">{r.licensePlate || "—"}</td>
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
          <td className="px-6 py-4">{r.lane || "—"}</td>
          <td className="px-6 py-4">{r.remark || "—"}</td>
          <td className="px-6 py-4">{r.soc ?? "—"}%</td>
        </tr>
      );
    })}
  </tbody>
</table>
