"use client";

import { useEffect, useState } from "react";
import VisitorCount from "./VisitorCount";

const SECTIONS = ["hero", "about", "experience", "projects", "skills", "certs", "contact"];

// Chicago is UTC-6 in CST and UTC-5 in CDT; let the runtime handle the shift
// rather than hardcoding an offset that goes an hour wrong every summer.
const chicagoTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  // h23 rather than hour12:false, which renders midnight as 24:00:00.
  hourCycle: "h23",
});

export default function FrameHud({
  vol,
  version,
}: {
  vol: string;
  version: string;
}) {
  const [clock, setClock] = useState("CT — 00:00:00");
  const [railPos, setRailPos] = useState("01 / 07");

  useEffect(() => {
    const tick = () => setClock(`CT — ${chicagoTime.format(new Date())}`);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SECTIONS.indexOf(e.target.id);
            if (idx >= 0)
              setRailPos(
                `${(idx + 1).toString().padStart(2, "0")} / ${SECTIONS.length
                  .toString()
                  .padStart(2, "0")}`,
              );
          }
        });
      },
      { threshold: 0.5 },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div className="frame-edge frame-edge--tl" aria-hidden>
        <span className="row lit">
          jd<span className="dim-dot">.</span>
        </span>
        <span className="row">VOL. {vol}</span>
      </div>
      <div className="frame-edge frame-edge--tr" aria-hidden>
        <span className="row lit">{clock}</span>
        <span className="row">41.8781°N / 87.6298°W</span>
      </div>
      <div className="frame-edge frame-edge--bl" aria-hidden>
        <span className="row">
          ↳ VIEWS — <span className="lit"><VisitorCount fallback="000" /></span>
        </span>
        <span className="row lit">JORDANDESIGNS.IO</span>
      </div>
      <div className="frame-edge frame-edge--br" aria-hidden>
        <span className="row">
          SIGNAL — <span className="lit">GREEN</span>
        </span>
        <span className="row">{version} — EDITORIAL</span>
      </div>

      <div className="side-rail" aria-hidden>
        <span>SCROLL</span>
        <span className="pip" />
        <span>{railPos}</span>
        <span className="pip" />
        <span>JORDAN</span>
      </div>
    </>
  );
}
