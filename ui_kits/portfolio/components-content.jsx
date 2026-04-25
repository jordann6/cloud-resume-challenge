// Portfolio UI Kit — Projects, Skills, Certs, Contact

const { useState: __useState } = React;

// ─────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────
function Projects({ onOpen }) {
  const projects = [
    { num: "01", title: "LLM Gateway & Observability Platform", desc: "Cuts LLM API costs by routing requests across OpenAI and Anthropic based on cost, latency, or quality strategy. FastAPI gateway on ECS Fargate with DynamoDB caching and an LLM-as-judge eval pipeline.", tags: ["ECS Fargate", "FastAPI", "Terraform", "DynamoDB", "Lambda"] },
    { num: "02", title: "Cloud Security Lab", desc: "Full attack-detect-respond case study mapped to MITRE ATT&CK. Pacu kill chain, OpenSearch SIEM with kill chain correlation, EventBridge-to-Lambda automated remediation, Falco runtime detection on K3s.", tags: ["Terraform", "GuardDuty", "OpenSearch", "Falco", "OPA Gatekeeper"] },
    { num: "03", title: "Azure FinOps Cost Visibility Dashboard", desc: "Surfaces cloud spend trends, tagging gaps, cost anomalies, and budget forecasts. React on Azure Static Web Apps with C# .NET 8 timer-triggered Functions doing z-score anomaly detection and linear regression.", tags: ["Azure Functions", "Cosmos DB", "React", "C# .NET 8"] },
    { num: "04", title: "NBA Intel Center", desc: "RAG-powered prop analysis platform combining live NBA data with semantic search. FastAPI backend with Azure OpenAI GPT-4o and Qdrant vector search. Self-hosted on K3s with Cloudflare tunnel.", tags: ["FastAPI", "Azure OpenAI", "Qdrant", "RAG", "K3s"] },
    { num: "05", title: "Website Uptime Monitor", desc: "Automated health monitoring for jordandesigns.io with zero ongoing cost. EventBridge triggers a Python 3.11 Lambda checking HTTP status, logging to DynamoDB with 90-day TTL, SNS email alerts on failure.", tags: ["EventBridge", "Lambda", "DynamoDB", "SNS", "Python"] },
    { num: "06", title: "NFL Data Reliability Platform", desc: "Enforces data quality SLOs for NFL API ingestion with automated schema validation and quarantine logic. Containerized Python service on Azure Container Apps. Custom Prometheus metrics with PromQL burn-rate analysis.", tags: ["Azure Container Apps", "Prometheus", "Grafana", "SRE"] },
  ];
  return (
    <section id="projects" style={secStyles.section} data-screen-label="04 Projects">
      <SectionHeader num="03" title="Projects" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
        background: "var(--border)", border: "1px solid var(--border)",
      }}>
        {projects.map((p) => <ProjectCard key={p.num} {...p} onClick={() => onOpen?.(p)} />)}
      </div>
    </section>
  );
}

function ProjectCard({ num, title, desc, tags, onClick }) {
  const [hover, setHover] = __useState(false);
  return (
    <a
      onClick={(e) => { e.preventDefault(); onClick?.(); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        background: hover ? "var(--surface)" : "var(--bg)",
        padding: "36px 32px",
        textDecoration: "none", color: "inherit",
        transition: "background 0.4s var(--ease)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--text-dim)", marginBottom: 12,
        }}>Project {num}</span>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600,
          color: "var(--white)", marginBottom: 14, lineHeight: 1.2,
          letterSpacing: "0.01em",
        }}>{title}</div>
        <p style={{
          fontSize: 13, lineHeight: 1.8, color: "var(--text-secondary)",
          marginBottom: 20, flex: 1,
        }}>{desc}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
          {tags.map((t) => <Tag key={t} size="project">{t}</Tag>)}
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
          letterSpacing: "0.04em",
          color: hover ? "var(--white)" : "var(--text-dim)",
          transition: "color 0.3s var(--ease)",
          marginTop: "auto",
        }}>View on GitHub ↗</span>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────
function Skills() {
  const groups = [
    { label: "Languages", tags: ["Python", "JavaScript", "Bash", "Go", "C#", "SQL"] },
    { label: "Cloud Platforms", tags: ["AWS", "Azure", "GCP"] },
    { label: "Infrastructure & Orchestration", tags: ["Docker", "Kubernetes", "Linux", "Terraform"] },
    { label: "CI/CD & Automation", tags: ["GitHub Actions", "CI/CD Pipelines"] },
    { label: "Observability & Security", tags: ["Prometheus", "Grafana", "PromQL", "Falco"] },
    { label: "AI Infrastructure", tags: ["LLM Gateway Design", "RAG Pipelines", "Vector Search", "OpenAI / Anthropic APIs"] },
  ];
  return (
    <section id="skills" style={{ ...secStyles.section, paddingBottom: 80 }} data-screen-label="05 Skills">
      <SectionHeader num="04" title="Skills" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
        background: "var(--border)", border: "1px solid var(--border)",
      }}>
        {groups.map((g) => <SkillGroup key={g.label} {...g} />)}
      </div>
    </section>
  );
}

function SkillGroup({ label, tags }) {
  const [hover, setHover] = __useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "var(--surface)" : "var(--bg)",
        padding: "28px 32px",
        transition: "background 0.3s var(--ease)",
      }}
    >
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--text-dim)", marginBottom: 14,
      }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t) => <Tag key={t} size="skill">{t}</Tag>)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CERTS
// ─────────────────────────────────────────────────────────────
function Certs() {
  return (
    <section id="certs" style={{ ...secStyles.section, paddingTop: 0 }} data-screen-label="06 Certs">
      <SectionHeader num="05" title="Certifications" />
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
        background: "var(--border)", border: "1px solid var(--border)",
      }}>
        <CertCard icon={["AWS", "SAA"]} name="Solutions Architect Associate" provider="Amazon Web Services · SAA-C03" status="Active" />
        <CertCard icon={["AZ", "104"]} name="Azure Administrator Associate" provider="Microsoft Azure · AZ-104" />
      </div>
    </section>
  );
}

function CertCard({ icon, name, provider, status }) {
  const [hover, setHover] = __useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 20, padding: 32,
        background: hover ? "var(--surface)" : "var(--bg)",
        transition: "background 0.3s var(--ease)",
      }}
    >
      <div style={{
        width: 52, height: 52,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
        color: "var(--white)", textAlign: "center", lineHeight: 1.15,
        letterSpacing: "0.04em",
        border: "1px solid var(--border-hover)",
        flexShrink: 0,
      }}>
        {icon[0]}<br />{icon[1]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600,
          color: "var(--white)", marginBottom: 3, letterSpacing: "0.02em",
        }}>{name}</div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--text-dim)", letterSpacing: "0.02em",
        }}>{provider}</div>
      </div>
      {status && (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
          letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--text-dim)", padding: "4px 12px",
          border: "1px solid var(--border)", whiteSpace: "nowrap",
        }}>{status}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────
function Contact() {
  const links = [
    { label: "Email", value: "jordandn6@outlook.com", href: "mailto:jordandn6@outlook.com" },
    { label: "LinkedIn", value: "linkedin.com/in/jordan-nelson-aa0828165", href: "https://linkedin.com/in/jordan-nelson-aa0828165" },
    { label: "GitHub", value: "github.com/jordann6", href: "https://github.com/jordann6" },
    { label: "Portfolio", value: "jordandesigns.io", href: "https://jordandesigns.io" },
  ];
  return (
    <section id="contact" style={secStyles.section} data-screen-label="07 Contact">
      <SectionHeader num="06" title="Contact" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
        <div>
          <h3 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(48px, 6vw, 72px)",
            fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase",
            letterSpacing: "-0.02em", color: "var(--white)", marginBottom: 24, margin: 0,
          }}>
            Let's<br />
            <span style={{
              WebkitTextStroke: "1px var(--text-dim)",
              WebkitTextFillColor: "transparent",
            }}>Build</span><br />
            Something.
          </h3>
          <p style={{
            fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8,
            margin: "24px 0 32px", maxWidth: 400,
          }}>
            Open to Cloud Engineer, DevOps Engineer, and Platform Engineer roles.
            Remote or hybrid in Chicago preferred.
          </p>
          <BtnPrimary>Send an Email</BtnPrimary>
        </div>
        <div style={{
          display: "flex", flexDirection: "column",
          borderTop: "1px solid var(--border)",
        }}>
          {links.map((l) => <ContactLink key={l.label} {...l} />)}
        </div>
      </div>
    </section>
  );
}

function ContactLink({ label, value }) {
  const [hover, setHover] = __useState(false);
  return (
    <a
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 0", paddingLeft: hover ? 12 : 0,
        borderBottom: "1px solid var(--border)",
        transition: "padding-left 0.3s var(--ease)",
        textDecoration: "none", color: "inherit", cursor: "pointer",
      }}
    >
      <div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--text-dim)", display: "block", marginBottom: 4,
        }}>{label}</span>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 14,
          color: hover ? "var(--white)" : "var(--text-secondary)",
          transition: "color 0.3s var(--ease)",
        }}>{value}</span>
      </div>
      <span style={{
        fontSize: 18,
        color: hover ? "var(--white)" : "var(--text-dim)",
        transform: hover ? "translate(2px, -2px)" : "none",
        transition: "all 0.3s var(--ease)",
      }}>↗</span>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "32px 48px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: "1px solid var(--border)",
      fontFamily: "var(--font-mono)", fontSize: 11,
      color: "var(--text-dim)", letterSpacing: "0.04em",
    }}>
      <span>© 2026 Jordan Nelson</span>
      <span>Built on <span style={{ color: "var(--text-secondary)" }}>AWS</span> · jordandesigns.io</span>
    </footer>
  );
}

Object.assign(window, { Projects, ProjectCard, Skills, SkillGroup, Certs, CertCard, Contact, ContactLink, Footer });
