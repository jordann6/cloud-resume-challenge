export interface ExperienceRow {
  year: string;
  company: string;
  role: string;
  stack: string[];
}

export const experience: ExperienceRow[] = [
  {
    year: "2025—\nNOW",
    company: "Snorkel AI, Inc.",
    role: "DevOps Engineer",
    stack: ["GitHub Actions", "Kubernetes", "AKS", "AWS Lambda", "EventBridge", "CloudWatch", "Boto3", "Bandit", "Trivy", "OWASP ZAP", "Checkov"],
  },
  {
    year: "2025—\nNOW",
    company: "Independent Practice",
    role: "Cloud Engineer",
    stack: ["Azure Functions", "Cosmos DB", "Terraform", "Lambda", "CloudWatch", "EventBridge", "VNet", "Key Vault", "C#"],
  },
  {
    year: "2024—\n2025",
    company: "Wiggs CPA",
    role: "IT Support Specialist",
    stack: ["Azure", "AWS", "Terraform", "Python", "Bash", "Entra ID"],
  },
  {
    year: "2022—\n2024",
    company: "Wiggs CPA",
    role: "Desktop Specialist",
    stack: ["Active Directory", "MFA", "Runbooks", "Incident Response"],
  },
];

export interface SkillGroup {
  label: string;
  tags: string[];
}

export const skills: SkillGroup[] = [
  { label: "/Languages", tags: ["Python", "JavaScript", "Bash", "Go", "C#", "Ruby", "SQL"] },
  { label: "/Cloud", tags: ["AWS", "Azure", "GCP"] },
  { label: "/Infra", tags: ["Docker", "Kubernetes", "Linux", "Terraform"] },
  { label: "/Pipelines", tags: ["GitHub Actions", "CI/CD"] },
  { label: "/Observability", tags: ["Prometheus", "Grafana", "PromQL", "Falco"] },
  { label: "/AI Infra", tags: ["LLM Gateway", "RAG Pipelines", "Vector Search", "OpenAI / Anthropic"] },
];

export interface Cert {
  sigil: string;
  sub: string;
  name: string;
  provider: string;
  status: "Active" | "Expired" | "In Progress";
}

export const certs: Cert[] = [
  { sigil: "AWS", sub: "SAA—C03", name: "Solutions Architect Associate", provider: "Amazon Web Services", status: "Active" },
  { sigil: "AWS", sub: "SCS—C02", name: "Security Specialty", provider: "Amazon Web Services", status: "In Progress" },
  { sigil: "AZ", sub: "—104", name: "Azure Administrator Associate", provider: "Microsoft Azure", status: "Expired" },
];

export interface CapabilityProof {
  label: string;
  href: string;
  /** internal case-study routes render with next/link */
  internal?: boolean;
}

export interface Capability {
  num: string;
  title: string;
  blurb: string;
  proofs: CapabilityProof[];
}

export const capabilities: Capability[] = [
  {
    num: "A",
    title: "Cloud Foundations & Governance",
    blurb:
      "Multi-account and multi-subscription foundations built in Terraform: OU and management group hierarchies, SCP and Azure Policy guardrails, hub-spoke networking, account vending, and centralized audit logging.",
    proofs: [
      { label: "AWS Landing Zone Automator", href: "https://github.com/jordann6/landing-zone-automator" },
      { label: "Azure Landing Zone", href: "https://github.com/jordann6/azure-landing-zone" },
      { label: "AWS SCP Governance", href: "https://github.com/jordann6/aws-scp-governance" },
    ],
  },
  {
    num: "B",
    title: "FinOps & Cost Engineering",
    blurb:
      "Cost visibility built as software on both clouds: anomaly detection against rolling baselines, spend forecasting, tagging compliance for attribution, and scale-to-zero patterns that keep idle cost near nothing.",
    proofs: [
      { label: "Cost Intelligence Dashboard", href: "/work/cost-intelligence-dashboard/", internal: true },
      { label: "Azure FinOps Dashboard", href: "https://github.com/jordann6/azure-finops-dashboard" },
      { label: "LLM Gateway Cost Routing", href: "https://github.com/jordann6/llm-gateway" },
    ],
  },
  {
    num: "C",
    title: "Resilience & Incident Response",
    blurb:
      "Systems that answer failure without a human in the hot path: cross-region failover with automated database promotion, alarm-driven remediation, and AI-assisted incident runbooks, all verified against live cloud breakage.",
    proofs: [
      { label: "Multi-Region Failover Manager", href: "/work/multi-region-failover/", internal: true },
      { label: "AWS Incident Responder", href: "/work/aws-incident-responder/", internal: true },
      { label: "Azure Event-Driven Remediation", href: "https://github.com/jordann6/azure-event-driven-remediation" },
    ],
  },
  {
    num: "D",
    title: "Platform & DevSecOps",
    blurb:
      "Paved roads on Kubernetes across both clouds: GitOps reconciliation, self-service infrastructure APIs, admission policy, and CI/CD pipelines gated on SAST, container scanning, and DAST before anything deploys.",
    proofs: [
      { label: "AWS Developer Platform", href: "/work/aws-developer-platform/", internal: true },
      { label: "Cloud Security Lab", href: "/work/cloud-security-lab/", internal: true },
      { label: "Azure DevSecOps Pipeline", href: "https://github.com/jordann6/azure-devsecops-project" },
    ],
  },
  {
    num: "E",
    title: "Data Platform Engineering",
    blurb:
      "The storage, catalog, transformation, and governance layers data teams build on: serverless lakehouses and medallion architecture across both clouds, dbt analytics engineering with data-quality test gates, and columnar Parquet that cuts query scan cost, all in Terraform with keyless, least-privilege access.",
    proofs: [
      { label: "AWS Serverless Lakehouse", href: "https://github.com/jordann6/aws-serverless-lakehouse" },
      { label: "dbt Analytics Engineering", href: "https://github.com/jordann6/aws-lakehouse-dbt" },
      { label: "Azure Medallion Lakehouse", href: "https://github.com/jordann6/azure-medallion-lakehouse" },
    ],
  },
];

export const marqueeItems = [
  "Cloud",
  "DevOps",
  "Platform",
  "FinOps",
  "Reliability",
  "Security",
  "Cost Optimization",
  "Automation",
  "Observability",
  "AI Infra",
];
