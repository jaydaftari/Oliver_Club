"use client";

import { useMemo, useState } from "react";
import type { LumaEvent } from "@/lib/luma";
import { LumaEventCard, EmptyNote } from "@/components/member/parts";
import { T } from "@/components/member/theme";

const NEAR = "__near__";
const ALL = "__all__";

export default function EventsBrowser({
  events,
  nearbyIds,
  cities,
  hasNearby,
  locationLabel,
}: {
  events: LumaEvent[];
  nearbyIds: string[];
  cities: string[];
  hasNearby: boolean;
  locationLabel: string;
}) {
  const nearbySet = useMemo(() => new Set(nearbyIds), [nearbyIds]);
  const [city, setCity] = useState<string>(hasNearby ? NEAR : ALL);
  const [fromDate, setFromDate] = useState<string>("");

  const filtered = useMemo(() => {
    const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    return events.filter((e) => {
      const cityOk = city === ALL ? true : city === NEAR ? nearbySet.has(e.id) : e.city === city;
      const dateOk = fromMs === null ? true : new Date(e.start_at).getTime() >= fromMs;
      return cityOk && dateOk;
    });
  }, [events, city, fromDate, nearbySet]);

  return (
    <div>
      {/* filter bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: 18,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>City</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={controlStyle}>
            {hasNearby && (
              <option value={NEAR}>Near you{locationLabel ? ` · ${locationLabel}` : ""}</option>
            )}
            <option value={ALL}>All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>From date</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={controlStyle}
          />
        </label>

        {(city !== (hasNearby ? NEAR : ALL) || fromDate) && (
          <button
            type="button"
            onClick={() => {
              setCity(hasNearby ? NEAR : ALL);
              setFromDate("");
            }}
            style={{
              ...controlStyle,
              cursor: "pointer",
              color: T.accent,
              background: "transparent",
            }}
          >
            Reset
          </button>
        )}

        <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(29,30,26,0.5)" }}>
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyNote>
          No upcoming events match{" "}
          {city === NEAR ? "your area" : city === ALL ? "that date" : `events in ${city}`}.
        </EmptyNote>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((e) => (
            <LumaEventCard
              key={e.id}
              event={e}
              badge={nearbySet.has(e.id) ? "Near you" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  font: `600 10px/1 ${T.sans}`,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(29,30,26,0.55)",
};

const controlStyle: React.CSSProperties = {
  fontFamily: T.sans,
  fontSize: 14,
  padding: "10px 12px",
  background: "#ffffff",
  border: "1px solid rgba(29,30,26,0.2)",
  borderRadius: 10,
  color: T.ink,
  outline: "none",
};
