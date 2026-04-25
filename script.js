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
    desc: "Cuts LLM API costs by routing requests across OpenAI and Anthropic based on cost, latency, or quality strategy. FastAPI gateway on ECS Fargate with DynamoDB caching and an LLM-as-judge eval pipeline.",
    tags: ["ECS Fargate", "FastAPI", "Terraform", "DynamoDB", "Lambda"],
  },
  {
    num: "02",
    title: "Cloud Security",
    titleOut: "Lab",
    desc: "Full attack-detect-respond case study mapped to MITRE ATT&CK. Pacu kill chain, OpenSearch SIEM correlation, EventBridge-to-Lambda automated remediation, Falco runtime detection on K3s.",
    tags: ["Terraform", "GuardDuty", "OpenSearch", "Falco", "OPA Gatekeeper"],
  },
  {
    num: "03",
    title: "Azure FinOps",
    titleOut: "Dashboard",
    desc: "Surfaces cloud spend trends, tagging gaps, cost anomalies, and budget forecasts. React on Azure Static Web Apps with C# .NET 8 timer-triggered Functions doing z-score anomaly detection and linear regression.",
    tags: ["Azure Functions", "Cosmos DB", "React", "C# .NET 8"],
  },
  {
    num: "04",
    title: "NBA Intel",
    titleOut: "Center",
    desc: "RAG-powered prop analysis platform combining live NBA data with semantic search. FastAPI backend with Azure OpenAI GPT-4o and Qdrant vector search. Self-hosted on K3s with Cloudflare tunnel.",
    tags: ["FastAPI", "Azure OpenAI", "Qdrant", "RAG", "K3s"],
  },
  {
    num: "05",
    title: "Uptime",
    titleOut: "Monitor",
    desc: "Automated health monitoring for jordandesigns.io with zero ongoing cost. EventBridge triggers a Python 3.11 Lambda checking HTTP status, logging to DynamoDB with 90-day TTL, SNS email alerts on failure.",
    tags: ["EventBridge", "Lambda", "DynamoDB", "SNS", "Python"],
  },
  {
    num: "06",
    title: "NFL Reliability",
    titleOut: "Platform",
    desc: "Enforces data quality SLOs for NFL API ingestion with automated schema validation and quarantine logic. Containerized Python service on Azure Container Apps. Custom Prometheus metrics with PromQL burn-rate analysis.",
    tags: ["Azure Container Apps", "Prometheus", "Grafana", "SRE"],
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
        <a class="btn btn--primary" href="https://github.com/jordann6" target="_blank">View on GitHub <span class="arrow">↗</span></a>
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
