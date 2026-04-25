// Portfolio UI Kit — Components
// Mirror of jordandesigns.io component library.
// All styles inline against design tokens defined in colors_and_type.css.

const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
function Nav({ active = "projects", onNav }) {
  const links = ["about", "experience", "projects", "skills", "certs", "contact"];
  return (
    <nav style={navStyles.bar}>
      <a href="#hero" style={navStyles.logo} onClick={(e) => { e.preventDefault(); onNav?.("hero"); }}>
        JN<span style={{ color: "var(--text-dim)" }}>.</span>
      </a>
      <ul style={navStyles.links}>
        {links.map((l) => (
          <li key={l}>
            <a
              href={`#${l}`}
              onClick={(e) => { e.preventDefault(); onNav?.(l); }}
              style={{
                ...navStyles.link,
                color: active === l ? "var(--accent-bright)" : "var(--text-secondary)",
              }}
            >
              {l === "certs" ? "Certs" : l.charAt(0).toUpperCase() + l.slice(1)}
            </a>
          </li>
        ))}
      </ul>
      <a href="mailto:jordandn6@outlook.com" style={navStyles.cta}>Hire Me</a>
    </nav>
  );
}

const navStyles = {
  bar: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 48px", height: 64,
    background: "rgba(5,5,5,0.85)",
    backdropFilter: "blur(20px) saturate(120%)",
    WebkitBackdropFilter: "blur(20px) saturate(120%)",
    borderBottom: "1px solid var(--border)",
  },
  logo: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
    letterSpacing: "0.02em", color: "var(--white)",
  },
  links: { display: "flex", gap: 36, listStyle: "none", margin: 0, padding: 0 },
  link: {
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 400,
    letterSpacing: "0.08em", textTransform: "uppercase",
    transition: "color 0.3s var(--ease)",
  },
  cta: {
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
    letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--black)", background: "var(--white)",
    padding: "8px 20px", whiteSpace: "nowrap", border: "none", cursor: "pointer",
  },
};

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────
function Hero({ visitorCount }) {
  return (
    <section id="hero" style={heroStyles.section} data-screen-label="01 Hero">
      <div style={heroStyles.gridBg} />
      <div style={heroStyles.glow} />
      <div style={heroStyles.content}>
        <p style={heroStyles.eyebrow}>{"// Available for new opportunities"}</p>
        <h1 style={heroStyles.name}>Jordan</h1>
        <p style={heroStyles.title}>DevOps & Cloud Engineer</p>
        <p style={heroStyles.desc}>
          Building and operating secure cloud infrastructure across AWS and Azure.
          Focused on AI-integrated platforms, infrastructure automation, cloud
          security, FinOps, and production observability.
        </p>
        <div style={heroStyles.actions}>
          <BtnPrimary>View Projects</BtnPrimary>
          <BtnSecondary>Get in Touch</BtnSecondary>
        </div>
      </div>
      <div style={heroStyles.badges}>
        <Badge>AWS SAA-C03</Badge>
        <Badge>AZ-104</Badge>
        <Badge>Chicago, IL</Badge>
        {visitorCount && <Badge>{visitorCount}</Badge>}
      </div>
    </section>
  );
}

const heroStyles = {
  section: {
    position: "relative", minHeight: "100vh",
    display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "center", textAlign: "center",
    padding: "120px 48px 80px", overflow: "hidden",
  },
  gridBg: {
    position: "absolute", inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)",
    WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)",
  },
  glow: {
    position: "absolute", top: "30%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600, height: 600,
    background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  content: { position: "relative", zIndex: 1, maxWidth: 720 },
  eyebrow: {
    fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)",
    letterSpacing: "0.06em", marginBottom: 32,
  },
  name: {
    fontFamily: "var(--font-display)", fontSize: "clamp(72px, 14vw, 160px)",
    fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.02em",
    textTransform: "uppercase", color: "var(--white)", marginBottom: 24,
  },
  title: {
    fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600,
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: "var(--text-secondary)", marginBottom: 24,
  },
  desc: {
    fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)",
    maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.8,
  },
  actions: { display: "flex", gap: 16, justifyContent: "center" },
  badges: {
    position: "relative", zIndex: 1, display: "flex", gap: 12, marginTop: 64,
    flexWrap: "wrap", justifyContent: "center",
  },
};

// ─────────────────────────────────────────────────────────────
// BUTTONS, BADGES, TAGS
// ─────────────────────────────────────────────────────────────
function BtnPrimary({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500,
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: hover ? "var(--white)" : "var(--black)",
        background: hover ? "transparent" : "var(--white)",
        padding: "14px 32px", whiteSpace: "nowrap",
        border: `1px solid ${hover ? "var(--border-hover)" : "transparent"}`,
        cursor: "pointer", transition: "all 0.3s var(--ease)",
      }}
    >{children}</button>
  );
}

function BtnSecondary({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500,
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: hover ? "var(--white)" : "var(--text-secondary)",
        background: "transparent",
        padding: "14px 32px", whiteSpace: "nowrap",
        border: `1px solid ${hover ? "var(--border-hover)" : "var(--border)"}`,
        cursor: "pointer", transition: "all 0.3s var(--ease)",
      }}
    >{children}</button>
  );
}

function Badge({ children }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 400,
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: "var(--text-dim)",
        padding: "6px 14px", whiteSpace: "nowrap",
        border: `1px solid ${hover ? "var(--border-hover)" : "var(--border)"}`,
        transition: "border-color 0.3s var(--ease)",
      }}
    >{children}</span>
  );
}

function Tag({ children, size = "exp" }) {
  const sizes = {
    exp: { fontSize: 10, padding: "4px 10px" },
    project: { fontSize: 9, padding: "3px 8px", textTransform: "uppercase" },
    skill: { fontSize: 11, padding: "5px 12px" },
  };
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)", fontWeight: 400,
        letterSpacing: "0.04em",
        color: "var(--tag-text)",
        background: "var(--tag-bg)",
        border: "1px solid var(--tag-border)",
        ...sizes[size],
      }}
    >{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────
function SectionHeader({ num, title }) {
  return (
    <div style={shStyles.wrap}>
      <span style={shStyles.num}>{num}</span>
      <h2 style={shStyles.title}>{title}</h2>
      <div style={shStyles.line} />
    </div>
  );
}
const shStyles = {
  wrap: { display: "flex", alignItems: "center", gap: 20, marginBottom: 56 },
  num: {
    fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)",
    letterSpacing: "0.04em",
  },
  title: {
    fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--white)",
    margin: 0,
  },
  line: { flex: 1, height: 1, background: "var(--border)" },
};

Object.assign(window, { Nav, Hero, BtnPrimary, BtnSecondary, Badge, Tag, SectionHeader });
