/* ════════════════════════════════════════════════
   Jordan Nelson — Portfolio v2 (Editorial)
   ════════════════════════════════════════════════ */

/* Custom cursor */
(function () {
  const ring = document.getElementById("cursorRing");
  const dot = document.getElementById("cursorDot");
  const co = document.getElementById("cursorCoords");
  if (!ring || !dot || !co) return;
  let rx = innerWidth / 2,
    ry = innerHeight / 2;
  let x = rx,
    y = ry;
  addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
    co.style.transform = `translate(${x + 18}px, ${y + 18}px)`;
    co.textContent = `+${x.toString().padStart(4, "0")}.000 / +${y.toString().padStart(4, "0")}.000`;
  });
  function tick() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx - 14}px, ${ry - 14}px)`;
    requestAnimationFrame(tick);
  }
  tick();
  const sel =
    "a, button, .proj__item, .contact__link, .skills__group .items span";
  document.addEventListener(
    "mouseover",
    (e) => {
      if (e.target.closest(sel)) ring.classList.add("cursor-active");
    },
    true,
  );
  document.addEventListener(
    "mouseout",
    (e) => {
      if (e.target.closest(sel)) ring.classList.remove("cursor-active");
    },
    true,
  );
})();

/* Live Chicago time */
(function () {
  const el = document.getElementById("ctClock");
  if (!el) return;
  const pad = (n) => n.toString().padStart(2, "0");
  function tick() {
    const d = new Date();
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const ct = new Date(utc - 6 * 3600000);
    el.textContent = `CT — ${pad(ct.getHours())}:${pad(ct.getMinutes())}:${pad(ct.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* Marquee */
(function () {
  const mq = document.getElementById("mq");
  if (!mq) return;
  const items = [
    "Cloud",
    "DevOps",
    "Platform",
    "Reliability",
    "Security",
    "Automation",
    "Observability",
    "AI Infra",
  ];
  const block = items
    .map(
      (it, i) =>
        `<span${i % 2 === 1 ? ' class="dim"' : ""}>${it}</span><span class="sep">●</span>`,
    )
    .join("");
  mq.innerHTML = block + block;
})();

/* Projects (list + modal) */
const projects = [
  {
    num: "01",
    title: "LLM Gateway",
    titleOut: "& Observability",
    desc: "Cuts LLM API costs by routing requests across OpenAI and Anthropic based on cost, latency, or quality strategy. FastAPI gateway on ECS Fargate with DynamoDB caching, CloudWatch dashboards (9 widgets, 3 alarms), LLM-as-judge eval pipeline, Lambda nightly archival to S3, and scale-to-zero scheduling. 78 resources across 9 Terraform modules.",
    tags: [
      "ECS Fargate",
      "FastAPI",
      "Terraform",
      "DynamoDB",
      "Lambda",
      "CloudWatch",
    ],
    link: "https://github.com/jordann6/llm-gateway",
  },
  {
    num: "02",
    title: "Cloud Security",
    titleOut: "Lab",
    desc: "Full attack-detect-respond case study mapped to MITRE ATT&CK. Pacu kill chain simulation, OpenSearch SIEM correlation, EventBridge-to-Lambda automated remediation, Falco runtime detection on K3s, and OPA Gatekeeper policy enforcement.",
    tags: [
      "Terraform",
      "GuardDuty",
      "OpenSearch",
      "Falco",
      "OPA Gatekeeper",
      "Lambda",
    ],
    link: "https://github.com/jordann6/cloud-security-lab",
  },
  {
    num: "03",
    title: "Azure FinOps",
    titleOut: "Dashboard",
    desc: "Surfaces cloud spend trends, tagging gaps, cost anomalies, and budget forecasts. React on Azure Static Web Apps with C# .NET 8 timer-triggered Functions doing z-score anomaly detection and linear regression forecasting against Cosmos DB.",
    tags: [
      "Azure Functions",
      "Cosmos DB",
      "React",
      "C# .NET 8",
      "Static Web Apps",
    ],
    link: "https://github.com/jordann6/azure-finops-dashboard",
  },
  {
    num: "04",
    title: "NBA Intel",
    titleOut: "Center",
    desc: "RAG-powered prop analysis platform combining live NBA data with semantic search. FastAPI backend with Azure OpenAI GPT-4o and Qdrant vector store using text-embedding-3-small. Defensive stats, injury feeds, roster injection, and trend windows. Self-hosted on K3s homelab with Cloudflare tunnel.",
    tags: ["FastAPI", "Azure OpenAI", "Qdrant", "RAG", "K3s", "Cloudflare"],
    link: "https://github.com/jordann6/nba-intel-center",
  },
  {
    num: "05",
    title: "NFL Reliability",
    titleOut: "Platform",
    desc: "Enforces data quality SLOs for NFL API ingestion with automated schema validation and quarantine logic. Containerized Python service on Azure Container Apps with custom Prometheus metrics, PromQL burn-rate analysis, and Grafana dashboards.",
    tags: ["Azure Container Apps", "Prometheus", "Grafana", "PromQL", "SRE"],
    link: "https://github.com/jordann6/nfl-data-reliability-platform",
  },
  {
    num: "06",
    title: "Uptime",
    titleOut: "Monitor",
    desc: "Automated health monitoring for jordandesigns.io with zero ongoing cost. Weekly EventBridge schedule triggers a Python 3.11 Lambda checking HTTP status, logging to DynamoDB with 90-day TTL, and SNS email alerts on failure.",
    tags: ["EventBridge", "Lambda", "DynamoDB", "SNS", "Python"],
    link: "https://github.com/jordann6/website-uptime-monitor",
  },
  {
    num: "07",
    title: "Azure DevSecOps",
    titleOut: "Pipeline",
    desc: "End-to-end secure CI/CD pipeline integrating SAST, DAST, and IaC scanning gates. Automated security validation before build promotion with Azure DevOps, container image scanning, and policy-as-code enforcement.",
    tags: ["Azure DevOps", "SAST", "DAST", "Terraform", "Container Security"],
    link: "https://github.com/jordann6/azure-devsecops-project",
  },
  {
    num: "08",
    title: "Event-Driven",
    titleOut: "AWS Remediation",
    desc: "Automated infrastructure remediation triggered by CloudWatch alarms. Lambda functions written in Python with Boto3 handle EC2 instance recovery, security group lockdowns, and resource tagging enforcement without manual intervention.",
    tags: ["Lambda", "Boto3", "EC2", "CloudWatch", "Python"],
    link: "https://github.com/jordann6/event-driven-aws-remediation",
  },
  {
    num: "09",
    title: "Super Bowl",
    titleOut: "Intel Center",
    desc: "Analytics pipeline for Super Bowl LX matchup analysis. Azure OpenAI GPT-4o processes historical and real-time data to generate strategic insights, player comparisons, and game predictions.",
    tags: ["Azure OpenAI", "GPT-4o", "Python", "FastAPI"],
    link: "https://github.com/jordann6/sb-intel-center",
  },
  {
    num: "10",
    title: "Cloud Resume",
    titleOut: "Challenge",
    desc: "Portfolio site served from S3 through CloudFront with TLS and custom domain via Route 53. Visitor counter powered by API Gateway, Lambda (Python), and DynamoDB. GitHub Actions CI/CD syncs to S3 and invalidates cache on push. All infrastructure defined in Terraform.",
    tags: [
      "S3",
      "CloudFront",
      "Lambda",
      "DynamoDB",
      "Terraform",
      "GitHub Actions",
    ],
    link: "https://github.com/jordann6/cloud-resume-challenge",
  },
  {
    num: "11",
    title: "Arch Linux",
    titleOut: "Homelab",
    desc: "Repurposed a T2 MacBook into a dedicated infrastructure lab running Arch Linux with K3s. Hosts development workloads, vector databases, and project backends. Full writeup covering the build process, networking, and cluster configuration.",
    tags: ["Arch Linux", "K3s", "Kubernetes", "Networking", "Homelab"],
    link: "https://substack.com/@jordann6/p-183075828",
  },
];

(function () {
  const root = document.getElementById("projList");
  if (!root) return;
  root.innerHTML = projects
    .map(
      (p) => `
    <a class="proj__item" data-num="${p.num}" href="#">
      <div class="proj__num">/${p.num}</div>
      <div class="proj__main">
        <div class="proj__title">${p.title} <span class="out">${p.titleOut}</span></div>
        <div class="proj__hover-tags">
          ${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </div>
      <span class="proj__arrow">↗</span>
    </a>
  `,
    )
    .join("");
  root.addEventListener("click", (e) => {
    const it = e.target.closest(".proj__item");
    if (!it) return;
    e.preventDefault();
    openModal(projects.find((p) => p.num === it.dataset.num));
  });
})();

function openModal(p) {
  const root = document.getElementById("modalRoot");
  if (!root || !p) return;
  root.innerHTML = `
    <div class="modal-mask">
      <div class="modal">
        <div style="display:flex;justify-content:space-between;margin-bottom:24px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-dim)">
          <span>↳ Project /${p.num}</span><span class="closeM" style="cursor:pointer">Close ✕</span>
        </div>
        <h3 style="font-family:var(--font-display);font-weight:700;font-size:48px;line-height:0.95;letter-spacing:-0.02em;text-transform:uppercase;color:var(--white);margin-bottom:24px">
          ${p.title} <span style="-webkit-text-stroke:1px var(--white);-webkit-text-fill-color:transparent">${p.titleOut}</span>
        </h3>
        <p style="font-size:15px;line-height:1.8;color:var(--text-secondary);margin-bottom:32px;max-width:60ch">${p.desc}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:36px">
          ${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
        <a class="btn btn--primary" href="${p.link}" target="_blank">${p.link.includes("github") ? "View on GitHub" : "Read on Substack"} <span class="arrow">↗</span></a>
      </div>
    </div>`;
  const close = () => (root.innerHTML = "");
  root.querySelector(".modal-mask").addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal-mask") ||
      e.target.classList.contains("closeM")
    )
      close();
  });
}

/* Skills */
const skills = [
  {
    label: "/Languages",
    tags: ["Python", "JavaScript", "Bash", "Go", "C#", "SQL"],
  },
  { label: "/Cloud", tags: ["AWS", "Azure", "GCP"] },
  { label: "/Infra", tags: ["Docker", "Kubernetes", "Linux", "Terraform"] },
  { label: "/Pipelines", tags: ["GitHub Actions", "CI/CD"] },
  {
    label: "/Observability",
    tags: ["Prometheus", "Grafana", "PromQL", "Falco"],
  },
  {
    label: "/AI Infra",
    tags: [
      "LLM Gateway",
      "RAG Pipelines",
      "Vector Search",
      "OpenAI / Anthropic",
    ],
  },
];

(function () {
  const root = document.getElementById("skillsGrid");
  if (!root) return;
  root.innerHTML = skills
    .map(
      (g) => `
    <div class="skills__group">
      <div class="label">${g.label}</div>
      <div class="items">${g.tags.map((t, i) => `<span>${t}${i < g.tags.length - 1 ? "," : ""}</span>`).join("")}</div>
    </div>
  `,
    )
    .join("");
})();

/* Reveal on scroll + nav active state */
(function () {
  const obs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

  const navLinks = document.querySelectorAll(".nav__link");
  const sections = [
    "hero",
    "about",
    "experience",
    "projects",
    "skills",
    "certs",
    "contact",
  ];
  const railPos = document.getElementById("railPos");
  const obs2 = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach((l) =>
            l.classList.toggle("active", l.dataset.target === id),
          );
          const idx = sections.indexOf(id);
          if (idx >= 0 && railPos)
            railPos.textContent = `${(idx + 1).toString().padStart(2, "0")} / ${sections.length.toString().padStart(2, "0")}`;
        }
      });
    },
    { threshold: 0.5 },
  );
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) obs2.observe(el);
  });

  navLinks.forEach((l) =>
    l.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.getElementById(l.dataset.target);
      if (t)
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 40,
          behavior: "smooth",
        });
    }),
  );
})();

/* Visitor counter */
(function () {
  const API_ENDPOINT =
    "https://673vy98pwa.execute-api.us-east-1.amazonaws.com/prod/count";
  const el = document.getElementById("count");
  const mirror = document.querySelector(".count-mirror");
  if (!el) return;
  fetch(API_ENDPOINT)
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then((data) => {
      let visits = 0;
      if (data.visits) {
        visits = data.visits;
      } else if (data.body) {
        const body =
          typeof data.body === "string" ? JSON.parse(data.body) : data.body;
        visits = body.visits || body.count || 0;
      }
      const formatted = visits.toLocaleString();
      el.textContent = formatted;
      if (mirror) mirror.textContent = formatted;
    })
    .catch(() => {
      el.textContent = "---";
      if (mirror) mirror.textContent = "---";
    });
})();
