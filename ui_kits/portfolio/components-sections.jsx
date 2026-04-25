// Portfolio UI Kit — Section components

const { useState: _useState } = React;

// ─────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={secStyles.section} data-screen-label="02 About">
      <SectionHeader num="01" title="About" />
      <div style={aboutStyles.grid}>
        <div style={aboutStyles.text}>
          <p style={aboutStyles.p}>
            I transitioned into technology through hands-on experience, beginning in
            help desk and progressing into a <strong style={aboutStyles.strong}>DevOps Engineer role</strong> by
            steadily expanding my development and automation responsibilities.
          </p>
          <p style={aboutStyles.p}>
            After leaving law school, I redirected my focus toward software engineering
            and cloud infrastructure, treating learning as a deliberate and continuous
            practice. My work emphasizes <strong style={aboutStyles.strong}>reliability, reproducibility, and operational
            awareness</strong> across the software development lifecycle.
          </p>
          <p style={aboutStyles.p}>
            Currently at <strong style={aboutStyles.strong}>Snorkel AI</strong>, I build DevSecOps pipelines, Kubernetes
            blue-green deployment strategies, and event-driven remediation systems
            on AWS and Azure.
          </p>
        </div>
        <div style={aboutStyles.stats}>
          <Stat num="5+" label="Years in Cloud" />
          <Stat num="2" label="Certifications" />
          <Stat num="AWS" label="+ Azure + GCP" />
          <Stat num="AI" label="Infra + Integration" />
        </div>
      </div>
    </section>
  );
}

function Stat({ num, label }) {
  const [hover, setHover] = _useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "var(--surface)" : "var(--bg)",
        padding: "28px 24px",
        transition: "background 0.3s var(--ease)",
      }}
    >
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
        color: "var(--white)", marginBottom: 4,
      }}>{num}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "var(--text-dim)",
      }}>{label}</div>
    </div>
  );
}

const aboutStyles = {
  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "start" },
  text: {},
  p: { color: "var(--text-secondary)", marginBottom: 20, fontSize: 14, lineHeight: 1.85 },
  strong: { fontWeight: 500, color: "var(--white)" },
  stats: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
    background: "var(--border)", border: "1px solid var(--border)",
  },
};

// ─────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────
function Experience() {
  const items = [
    {
      period: "2025 — Present", company: "Snorkel AI", role: "DevOps Specialist",
      bullets: [
        "Reduced vulnerable build promotion by 90% through a custom DevSecOps pipeline integrating SAST, DAST, and IaC scanning.",
        "Implemented Kubernetes blue-green deployment strategies enabling zero-downtime releases, reducing deployment failures by ~70%.",
        "Orchestrated an event-driven remediation workflow using AWS Lambda and Boto3, reducing MTTR by ~40%.",
      ],
      tags: ["AWS Lambda", "Kubernetes", "Boto3", "DevSecOps", "Bash", "IAM"],
    },
    {
      period: "2024 — 2025", company: "Wiggs CPA", role: "IT Support Specialist",
      bullets: [
        "Executed a cloud rehosting migration from AWS to Azure with full service dependency mapping.",
        "Provisioned and rightsized Azure infrastructure using IaC, maintaining 99%+ uptime post-migration.",
        "Engineered Python and Bash scripts for Entra ID auth remediation, cutting resolution time by ~50%.",
      ],
      tags: ["Azure", "AWS", "Terraform", "Python", "Bash", "Entra ID"],
    },
  ];
  return (
    <section id="experience" style={secStyles.section} data-screen-label="03 Experience">
      <SectionHeader num="02" title="Experience" />
      <div>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "200px 1fr", gap: 48,
            padding: "40px 0",
            borderTop: i === 0 ? "1px solid var(--border)" : 0,
            borderBottom: "1px solid var(--border)",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)",
                letterSpacing: "0.04em", marginBottom: 6,
              }}>{it.period}</div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600,
                color: "var(--text-secondary)", textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>{it.company}</div>
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600,
                color: "var(--white)", marginBottom: 16, letterSpacing: "0.02em",
              }}>{it.role}</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {it.bullets.map((b, j) => (
                  <li key={j} style={{
                    fontSize: 13, lineHeight: 1.75, color: "var(--text-secondary)",
                    paddingLeft: 16, position: "relative",
                  }}>
                    <span style={{
                      position: "absolute", left: 0, top: 10,
                      width: 4, height: 1, background: "var(--text-dim)",
                    }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {it.tags.map((t) => <Tag key={t} size="exp">{t}</Tag>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const secStyles = {
  section: { maxWidth: 1100, margin: "0 auto", padding: "140px 48px" },
};

Object.assign(window, { About, Experience, Stat, secStyles });
