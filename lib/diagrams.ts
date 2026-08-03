export interface DiagramNode {
  label: string;
  sub?: string;
  accent?: boolean;
}

export interface DiagramCol {
  nodes: DiagramNode[];
}

export interface Diagram {
  caption: string;
  cols: DiagramCol[];
}

// Hand-authored left-to-right architecture flows, keyed by case-study slug.
// A column with multiple nodes renders them stacked (a branch / fan-out).
export const diagrams: Record<string, Diagram> = {
  "multi-region-failover": {
    caption: "One failure, two clocks: DNS shifts traffic in seconds while EventBridge crosses regions to promote the replica",
    cols: [
      { nodes: [{ label: "Route 53", sub: "health check · 10s" }] },
      {
        nodes: [
          { label: "DNS Failover", sub: "standby answers ~60s" },
          { label: "CloudWatch", sub: "alarm · us-east-1" },
        ],
      },
      { nodes: [{ label: "EventBridge", sub: "cross-region bus" }] },
      {
        nodes: [
          { label: "Failover Lambda", sub: "PromoteReadReplica", accent: true },
          { label: "SNS", sub: "operator notify" },
        ],
      },
      { nodes: [{ label: "RDS Replica", sub: "promoted · writable", accent: true }] },
    ],
  },
  "aws-developer-platform": {
    caption: "Self-service paved road — claim to hardened AWS resource, no static credentials",
    cols: [
      { nodes: [{ label: "Developer", sub: "Backstage template" }] },
      { nodes: [{ label: "Git", sub: "app-of-apps" }] },
      {
        nodes: [
          { label: "ArgoCD", sub: "reconcile" },
          { label: "Kyverno", sub: "admission policy" },
        ],
      },
      { nodes: [{ label: "Crossplane", sub: "IRSA provider", accent: true }] },
      { nodes: [{ label: "S3 Bucket", sub: "AES256 · versioned · tagged", accent: true }] },
    ],
  },
  "azure-developer-platform": {
    caption: "Same paved road on Azure — Flux + Workload Identity replace ArgoCD + IRSA",
    cols: [
      { nodes: [{ label: "Developer", sub: "claim" }] },
      { nodes: [{ label: "Git", sub: "GitRepository" }] },
      {
        nodes: [
          { label: "Flux", sub: "Kustomization" },
          { label: "Kyverno", sub: "admission policy" },
        ],
      },
      { nodes: [{ label: "Crossplane", sub: "Workload Identity", accent: true }] },
      { nodes: [{ label: "Storage Acct", sub: "TLS1.2 · no public", accent: true }] },
    ],
  },
  "aws-incident-responder": {
    caption: "Alarm to SNS to n8n runbook — enrich, notify, remediate, then verify",
    cols: [
      { nodes: [{ label: "CloudWatch", sub: "alarm · CPU ≥ 80%" }] },
      { nodes: [{ label: "SNS", sub: "HTTPS delivery" }] },
      { nodes: [{ label: "n8n", sub: "ECS Fargate · ALB · ACM", accent: true }] },
      {
        nodes: [
          { label: "Claude Haiku", sub: "summary", accent: true },
          { label: "Slack", sub: "incident card" },
          { label: "EC2 Reboot", sub: "SigV4 · scoped IAM" },
        ],
      },
      { nodes: [{ label: "DescribeAlarms", sub: "resolve / escalate" }] },
    ],
  },
  "cost-intelligence-dashboard": {
    caption: "Scheduled ingest and analysis to a single-table store, served behind CloudFront",
    cols: [
      { nodes: [{ label: "EventBridge", sub: "scheduler 01:00/02:00" }] },
      {
        nodes: [
          { label: "Ingester λ", sub: "Cost Explorer" },
          { label: "Analyzer λ", sub: "z-score · forecast", accent: true },
        ],
      },
      { nodes: [{ label: "DynamoDB", sub: "single-table" }] },
      {
        nodes: [
          { label: "API Gateway", sub: "HTTP API" },
          { label: "SNS", sub: "anomaly alert" },
        ],
      },
      { nodes: [{ label: "React / S3", sub: "CloudFront · OAC", accent: true }] },
    ],
  },
  "cloud-security-lab": {
    caption: "Attack to detect to respond — Pacu kill chain, SIEM correlation, automated containment",
    cols: [
      { nodes: [{ label: "Pacu", sub: "leaked IAM creds" }] },
      {
        nodes: [
          { label: "PrivEsc", sub: "1k → 15k perms" },
          { label: "S3 Exfil + STS", sub: "lateral movement" },
        ],
      },
      { nodes: [{ label: "CloudTrail", sub: "+ VPC Flow Logs" }] },
      {
        nodes: [
          { label: "OpenSearch", sub: "kill-chain SIEM", accent: true },
          { label: "GuardDuty", sub: "IAM threat" },
          { label: "Falco + OPA", sub: "K8s runtime" },
        ],
      },
      { nodes: [{ label: "EventBridge λ", sub: "disable keys", accent: true }] },
    ],
  },
  "multi-agent-coding-orchestrator": {
    caption: "Async by design — return a job ID in under 2s, run the agentic loop in the background",
    cols: [
      { nodes: [{ label: "Client", sub: "NL coding task" }] },
      { nodes: [{ label: "Orchestrator λ", sub: "202 + job ID", accent: true }] },
      {
        nodes: [
          { label: "Coder λ", sub: "agentic loop", accent: true },
          { label: "Anthropic", sub: "tool use" },
        ],
      },
      { nodes: [{ label: "DynamoDB", sub: "24h TTL" }] },
      { nodes: [{ label: "Status λ", sub: "poll job" }] },
    ],
  },
  "azure-aks-runtime-security": {
    caption: "Defense in depth on AKS — Kyverno blocks unsafe pods at admission, Falco detects what an exempt workload does at runtime, Defender watches the cloud plane",
    cols: [
      { nodes: [{ label: "Pod Deploy", sub: "create request" }] },
      { nodes: [{ label: "Kyverno", sub: "admission · deny unsafe", accent: true }] },
      { nodes: [{ label: "AKS Pod", sub: "runs in exempt ns" }] },
      { nodes: [{ label: "Falco", sub: "eBPF · 5 ATT&CK rules", accent: true }] },
      {
        nodes: [
          { label: "Defender", sub: "cloud threat alerts" },
          { label: "Log Analytics", sub: "correlation" },
        ],
      },
    ],
  },
  "gpu-index-api": {
    caption: "A read-through cache in front of index-only plans: the hot path went from 166.6ms to 23.8ms",
    cols: [
      { nodes: [{ label: "Client", sub: "1,114 req/s · p95 8.3ms" }] },
      { nodes: [{ label: "ALB", sub: "ECS Fargate · no NAT" }] },
      {
        nodes: [
          { label: "FastAPI", sub: "async · Pydantic v2", accent: true },
          { label: "Rate Limit", sub: "token bucket · fails open" },
        ],
      },
      { nodes: [{ label: "Redis", sub: "read-through · 99.7% hit", accent: true }] },
      { nodes: [{ label: "PostgreSQL", sub: "index-only · 23.8ms", accent: true }] },
    ],
  },
  "secrets-lifecycle": {
    caption: "Consumer maps from CloudTrail turn a stale secret into an ordered rotation runbook, with auditor evidence on the way out",
    cols: [
      { nodes: [{ label: "EventBridge", sub: "scheduled sweep" }] },
      {
        nodes: [
          { label: "Go Scanner λ", sub: "worker pool · metadata only", accent: true },
          { label: "Explicit Deny", sub: "GetSecretValue · kms:ViaService" },
        ],
      },
      { nodes: [{ label: "DynamoDB", sub: "normalized inventory" }] },
      {
        nodes: [
          { label: "Analyzer λ", sub: "Athena · 90d CloudTrail", accent: true },
          { label: "Bedrock", sub: "runbook · strict JSON" },
        ],
      },
      {
        nodes: [
          { label: "Security Hub", sub: "ASFF findings", accent: true },
          { label: "S3 Evidence", sub: "Object Lock · governance" },
          { label: "Dashboard", sub: "static · S3" },
        ],
      },
    ],
  },
  "azure-finops-dashboard": {
    caption: "Daily ingest, then statistics: sigma-tiered anomalies and a 14-day projection, all under one managed identity",
    cols: [
      { nodes: [{ label: "Timer Triggers", sub: "06:00 · 06:30 · 07:00 UTC" }] },
      { nodes: [{ label: "Cost Mgmt API", sub: "7-day actuals by resource" }] },
      {
        nodes: [
          { label: "Ingest Fn", sub: "C# .NET 8 · upsert" },
          { label: "Anomaly Fn", sub: "30d rolling · 2σ", accent: true },
          { label: "Forecast Fn", sub: "14d linear trend" },
        ],
      },
      { nodes: [{ label: "Cosmos DB", sub: "RBAC only · key auth off", accent: true }] },
      {
        nodes: [
          { label: "HTTP API", sub: "5 endpoints" },
          { label: "React SPA", sub: "Static Web Apps", accent: true },
        ],
      },
    ],
  },
  "aws-landing-zone-automator": {
    caption: "One block in a tfvars file, and the account arrives inside guardrails with logging, budgets, and SSO already applied",
    cols: [
      { nodes: [{ label: "tfvars", sub: "account_requests" }] },
      { nodes: [{ label: "Organizations", sub: "OU tree · all features" }] },
      {
        nodes: [
          { label: "SCPs", sub: "deny root · region allowlist", accent: true },
          { label: "Identity Center", sub: "3 groups · per-account" },
          { label: "Budgets", sub: "80% alarm" },
        ],
      },
      { nodes: [{ label: "Vended Account", sub: "baseline · no default VPC", accent: true }] },
      { nodes: [{ label: "Log Archive", sub: "org trail · SSE-KMS · locked", accent: true }] },
    ],
  },
  "azure-landing-zone": {
    caption: "Governance attaches to the management group before the first subscription lands, so policy is the environment rather than a ticket",
    cols: [
      { nodes: [{ label: "Tenant Root", sub: "mg-jordann6" }] },
      {
        nodes: [
          { label: "Workloads MG", sub: "subscription placed", accent: true },
          { label: "Azure Policy", sub: "owner tag · no public IP" },
        ],
      },
      { nodes: [{ label: "Hub VNet", sub: "10.0.0.0/16", accent: true }] },
      {
        nodes: [
          { label: "Reserved", sub: "Firewall · Gateway · Bastion" },
          { label: "snet-management", sub: "NSG denies inbound" },
        ],
      },
      {
        nodes: [
          { label: "Platform Spoke", sub: "10.1.0.0/16 · peered", accent: true },
          { label: "Sandbox Spoke", sub: "10.2.0.0/16 · peered" },
        ],
      },
    ],
  },
  "aws-serverless-lakehouse": {
    caption: "Crawl what you do not control, declare what you do: the same query scans 156 B curated against 2.09 MB raw",
    cols: [
      { nodes: [{ label: "Orders CSV", sub: "50k rows · seed 42" }] },
      { nodes: [{ label: "S3 raw/", sub: "as produced upstream" }] },
      { nodes: [{ label: "Glue Crawler", sub: "infers schema · no DDL", accent: true }] },
      { nodes: [{ label: "Athena CTAS", sub: "declared contract", accent: true }] },
      {
        nodes: [
          { label: "S3 curated/", sub: "Snappy Parquet · 156 B", accent: true },
          { label: "athena-results/", sub: "7-day expiry" },
        ],
      },
    ],
  },
  "dbt-analytics-athena": {
    caption: "Transformations and their correctness checks are both versioned code, and one command reconciles the warehouse or fails the build",
    cols: [
      { nodes: [{ label: "dbt seed", sub: "5k rows · seed 42" }] },
      { nodes: [{ label: "Bronze", sub: "raw_orders · as-is" }] },
      { nodes: [{ label: "Silver", sub: "stg_orders view · typed", accent: true }] },
      {
        nodes: [
          { label: "category_revenue", sub: "by category · country", accent: true },
          { label: "daily_revenue", sub: "one row per day · AOV", accent: true },
        ],
      },
      {
        nodes: [
          { label: "12 Tests", sub: "gate every build", accent: true },
          { label: "Reconciliation", sub: "gold to silver, to the cent" },
        ],
      },
    ],
  },
};

export function getDiagram(slug: string): Diagram | undefined {
  return diagrams[slug];
}
