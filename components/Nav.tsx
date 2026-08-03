"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const LINKS = [
  { num: "01", label: "About", target: "about" },
  { num: "02", label: "Focus", target: "capabilities" },
  { num: "03", label: "Index", target: "projects" },
  { num: "04", label: "Stack", target: "skills" },
  { num: "05", label: "Certified", target: "certs" },
  { num: "06", label: "Signal", target: "contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState("hero");

  useEffect(() => {
    if (!onHome) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.5 },
    );
    LINKS.map((l) => l.target)
      .concat("hero")
      .forEach((id) => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    return () => obs.disconnect();
  }, [onHome]);

  const handleClick = (e: React.MouseEvent, target: string) => {
    if (!onHome) return; // let the /#target link navigate
    e.preventDefault();
    const el = document.getElementById(target);
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 40,
        behavior: "smooth",
      });
  };

  return (
    <nav className="nav">
      <Link href="/" className="nav__logo" aria-label="jordandesigns.io home">
        <Logo />
        Jordan<span className="dim-dot">.</span>
      </Link>
      <ul className="nav__links">
        {LINKS.map((l) => (
          <li key={l.target}>
            <Link
              href={`/#${l.target}`}
              className={`nav__link${active === l.target ? " active" : ""}`}
              onClick={(e) => handleClick(e, l.target)}
            >
              <span className="num">{l.num}</span>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav__time">
        <span>
          <span className="label">Status</span>Available
        </span>
        <Link
          href="/#contact"
          className="nav__cta"
          onClick={(e) => handleClick(e, "contact")}
        >
          Let&apos;s Talk <span className="arrow">→</span>
        </Link>
      </div>
    </nav>
  );
}
