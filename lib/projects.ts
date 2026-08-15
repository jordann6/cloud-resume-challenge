export type Category = "AWS" | "Azure" | "GCP" | "AI" | "Platform" | "Data";

export interface Project {
  num: string;
  title: string;
  titleOut: string;
  desc: string;
  tags: string[];
  categories: Category[];
  link: string;
  /**
   * Extra repos for cross-cloud entries that cover one problem on both clouds.
   * When present the modal renders these instead of the single `link` button;
   * `link` stays populated as the primary/canonical repo.
   */
  links?: { label: string; href: string }[];
  /** present when this project has a dedicated deep case-study page */
  caseStudy?: string;
  /** curated into the homepage Selected Work tier */
  featured?: boolean;
  /**
   * Display order within the Selected Work tier, independent of `num` and of
   * catalog position. Lower ranks first. Only meaningful when `featured`.
   */
  featuredRank?: number;
}

export const CATEGORIES: Category[] = ["AWS", "Azure", "GCP", "AI", "Platform", "Data"];

export const categoryMeta: Record<
  Category,
  { slug: string; title: string; blurb: string }
> = {
  AWS: {
    slug: "aws",
    title: "AWS",
    blurb:
      "Serverless, security, FinOps, and platform work on AWS, all defined in Terraform and shipped through GitHub Actions OIDC pipelines.",
  },
  Azure: {
    slug: "azure",
    title: "Azure",
    blurb:
      "Azure builds across identity, governance, FinOps, and AKS platforms, credential-free with managed identity and Workload Identity.",
  },
  GCP: {
    slug: "gcp",
    title: "GCP",
    blurb:
      "Google Cloud work centered on the parts that do not transfer from AWS or Azure: workload identity federation, principal sets and resource hierarchy inheritance, and org policy constraints that make a control structural rather than procedural.",
  },
  AI: {
    slug: "ai",
    title: "AI",
    blurb:
      "AI-integrated systems: agent orchestration, RAG, LLM gateways, and Bedrock and Anthropic-backed automation on real cloud infrastructure.",
  },
  Platform: {
    slug: "platform",
    title: "Platform",
    blurb:
      "Platform engineering: Kubernetes, GitOps, internal developer platforms, and SRE-style observability across both clouds.",
  },
  Data: {
    slug: "data",
    title: "Data",
    blurb:
      "Data-platform engineering across both clouds: serverless lakehouses, medallion architecture, dbt analytics engineering, and catalog-driven query, all in Terraform with columnar Parquet and least-privilege, keyless access.",
  },
};

export function categoryFromSlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => categoryMeta[c].slug === slug);
}

export function projectsByCategory(cat: Category): Project[] {
  return projects.filter((p) => p.categories.includes(cat));
}

/** Label used by the "Case Study" filter chip; not a real Category. */
export const CASE_STUDY_FILTER = "Case Study" as const;

export const caseStudyMeta = {
  slug: "case-studies",
  title: "Case Studies",
  blurb:
    "Deep-dive write-ups on selected builds: the architecture decisions, the trade-offs, and how each system was deployed, demoed, and destroyed.",
};

export function caseStudyProjects(): Project[] {
  return projects.filter((p) => p.caseStudy);
}

export function featuredProjects(): Project[] {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredRank ?? Infinity) - (b.featuredRank ?? Infinity));
}

export const projects: Project[] = [
  {
    num: "01",
    title: "Cost Intelligence",
    titleOut: "Dashboard",
    desc: "Lambda ingester pulls 90 days of Cost Explorer data into a DynamoDB single-table store daily, running z-score anomaly detection per service against a 30-day rolling baseline (threshold 2.5σ) and generating a 14-day linear regression forecast on aggregate spend. A second Lambda scans all account resources via the Resource Groups Tagging API and flags missing required tags. Results are served through an API Gateway HTTP API to a React frontend on S3 behind CloudFront with Origin Access Control. Three separate IAM execution roles enforce least-privilege access at each layer: ingester (ce:GetCostAndUsage, tag:GetResources, DynamoDB write), analyzer (DynamoDB read/write, SNS publish), and API (DynamoDB read only). SNS alert fires on every anomaly detection run that finds outliers. EventBridge Scheduler triggers ingestion at 01:00 UTC and analysis at 02:00 UTC. 34 resources provisioned in Terraform with S3 remote backend and native state locking, deployed via GitHub Actions OIDC.",
    tags: ["Lambda", "Cost Explorer", "DynamoDB", "API Gateway", "CloudFront", "React", "EventBridge Scheduler", "Terraform"],
    categories: ["AWS"],
    link: "https://github.com/jordann6/aws-cost-intelligence-dashboard",
    caseStudy: "cost-intelligence-dashboard",
  },
  {
    num: "02",
    title: "Multi-Agent AI",
    titleOut: "Coding Orchestrator",
    desc: "Multi-agent system that routes natural language coding tasks to specialist agents through an orchestrator, fully asynchronous so submissions return a job ID in under two seconds while the coder runs the agentic loop in the background. API Gateway's 29-second integration timeout broke sequential Anthropic tool-use calls, so the orchestrator returns 202 immediately and the coder Lambda processes the loop independently, writing results to DynamoDB with 24-hour TTL. ARN-scoped least-privilege IAM isolates blast radius: the orchestrator can invoke only the coder Lambda, status can only read DynamoDB, and the coder cannot invoke any Lambda at all. The write_code, explain_code, and debug_code tools are deterministic Python functions returning structured scaffolds and AST metadata rather than recursive LLM calls, grounding the loop in real code analysis instead of model self-talk. Three separately sized Lambda packages, Secrets Manager for the Anthropic key, CloudWatch log groups with 14-day retention, and fully provisioned in Terraform.",
    tags: ["Lambda", "API Gateway", "DynamoDB", "Anthropic SDK", "Terraform", "Python", "IAM", "Secrets Manager"],
    categories: ["AWS", "AI"],
    link: "https://github.com/jordann6/multi-agent-coding-orchestrator",
    caseStudy: "multi-agent-coding-orchestrator",
  },
  {
    num: "03",
    title: "Multi-Region",
    titleOut: "Failover (AWS + Azure)",
    desc: "Automated regional disaster recovery built around the fact that failover runs on two clocks: stateless traffic shifts in seconds via DNS while stateful promotion needs orchestration. An identical serverless order API (API Gateway v2 and Lambda in private-subnet-only VPCs with no IGW or NAT) runs in us-east-1 and us-west-2 over an RDS PostgreSQL primary with an encrypted cross-region read replica. A Route 53 health check probes the primary /health endpoint every 10 seconds, and failover routing answers with the standby endpoint the moment it fails. A CloudWatch alarm on the health check metric (which only exists in us-east-1) emits a state change that EventBridge forwards cross-region to the standby default bus, where a failover Lambda verifies the replica is promotable, calls PromoteReadReplica idempotently, and publishes what it did to SNS. Every response component lives in the standby region, so the machinery that answers a regional failure never depends on the failing region. Until promotion completes, the standby serves reads and returns an honest 409 on writes, which makes the promotion itself observable. Credentials live in Secrets Manager with cross-region replication reached through interface endpoints, TLS to PostgreSQL is verified against the RDS CA bundle, and the failover role can promote exactly one ARN. CI gates on Bandit, Checkov, and Trivy, with an OIDC-authenticated plan job and zero static keys. Verified end to end against real AWS: the primary was broken live, DNS answered with the standby region in about 60 seconds, the alarm-to-promotion automation fired in about 100 seconds, and the promoted standby accepted the write it had correctly refused minutes earlier. The whole stack was then destroyed the same night with zero residual billing, about a quarter for the full session. Built a second time on Azure to prove the pattern is not AWS-specific: Traffic Manager health-probes the primary every ten seconds while a PostgreSQL Flexible Server cross-region replica takes minutes to promote, the same two clocks on a different stack. There the database is Entra-only with password authentication disabled and a user-assigned managed identity is the administrator, so no password exists in code, config, or state, and one azurerm provider spans both regions where AWS requires aliased-provider ceremony.",
    tags: ["Route 53", "Traffic Manager", "RDS PostgreSQL", "PostgreSQL Flexible Server", "Lambda", "Azure Functions", "EventBridge", "Managed Identity", "Terraform"],
    categories: ["AWS", "Azure", "Platform"],
    caseStudy: "multi-region-failover",
    link: "https://github.com/jordann6/multi-region-failover-manager",
    links: [
      { label: "AWS repo", href: "https://github.com/jordann6/multi-region-failover-manager" },
      { label: "Azure repo", href: "https://github.com/jordann6/azure-multi-region-failover" },
    ],
    featured: true,
    featuredRank: 4,
  },
  {
    num: "04",
    title: "Azure FinOps",
    titleOut: "Dashboard",
    desc: "Surfaces cloud spend trends, tagging gaps, cost anomalies, and budget forecasts before they hit the billing cycle. C# .NET 8 timer-triggered Azure Functions ingest the Cost Management API into Cosmos DB, running z-score anomaly detection against rolling baselines and 14-day linear regression forecasting per subscription. A second function scans the subscription against required tag policies, surfacing untagged resources with the specific missing tag details so cost attribution stays reliable. React frontend served from Azure Static Web Apps, all infrastructure provisioned in Terraform with system-assigned managed identity and zero stored credentials at the cost visibility layer.",
    tags: ["Azure Functions", "Cosmos DB", "React", "C# .NET 8", "Static Web Apps", "Terraform"],
    categories: ["Azure"],
    link: "https://github.com/jordann6/azure-finops-dashboard",
    caseStudy: "azure-finops-dashboard",
    featured: true,
    featuredRank: 3,
  },
  {
    num: "05",
    title: "LLM Gateway",
    titleOut: "& Observability",
    desc: "Cuts LLM API costs by routing requests across OpenAI and Anthropic based on cost, latency, or quality strategy, with DynamoDB caching in front to deduplicate repeated prompts. FastAPI gateway runs on ECS Fargate behind an ALB, instrumented with a CloudWatch dashboard of 9 widgets and 3 alarms covering latency, error rate, and provider failover. An LLM-as-judge evaluation pipeline scores response quality on a nightly cadence, and a Lambda archives raw request and response pairs to S3 for replay and audit. Scale-to-zero scheduling drops the service overnight to keep idle cost near zero. 78 resources across 9 Terraform modules, deployed via GitHub Actions.",
    tags: ["ECS Fargate", "FastAPI", "Terraform", "DynamoDB", "Lambda", "CloudWatch"],
    categories: ["AWS", "AI"],
    link: "https://github.com/jordann6/llm-gateway",
  },
  {
    num: "06",
    title: "Azure Zero Trust",
    titleOut: "Identity Pipeline",
    desc: "Seven-module Terraform pipeline enforcing Zero Trust across authentication, privileged access, workload identity, and threat detection on Azure. The identity layer provisions Entra ID users, groups, app registration, and managed identity with RBAC scoped to data plane resources — Key Vault carries no access policies and Storage Account has no shared keys. Five Conditional Access policies cover MFA enforcement, legacy auth blocking, device compliance, and risk-based sign-in controls. Defender for Cloud enabled at Standard tier across Key Vault, Storage, and ARM. Microsoft Sentinel onboarded with five scheduled analytics rules mapped to MITRE ATT&CK: brute force (T1110), unfamiliar sign-in location (T1078), PIM activation outside business hours, Key Vault access from unknown IP (T1552), and bulk user deletion (T1531). A Logic App playbook handles incident response via HTTP webhook. GitHub Actions authenticates via OIDC federated credential — no secrets stored anywhere in the pipeline.",
    tags: ["Microsoft Entra ID", "Microsoft Sentinel", "Defender for Cloud", "Key Vault", "Logic Apps", "Azure Monitor", "Terraform", "GitHub Actions OIDC"],
    categories: ["Azure"],
    link: "https://github.com/jordann6/zero-trust-identity-pipeline",
  },
  {
    num: "07",
    title: "Cloud Security",
    titleOut: "Lab",
    desc: "End-to-end attack, detect, and respond case study across AWS and Kubernetes — 62 Terraform resources across 7 modules. The full MITRE ATT&CK kill chain is scripted under attack/ so it runs identically every time and always under the leaked credential rather than an admin identity: leaked IAM credentials → permission enumeration → privilege escalation from 1,039 to 15,319 permissions via policy attachment → S3 exfiltration of staged PII → lateral movement via STS role assumption. On the detection side, CloudTrail and VPC Flow Logs feed into an OpenSearch SIEM with a kill chain correlation dashboard. GuardDuty findings on IAM threats trigger an EventBridge rule that fires a Lambda to automatically disable compromised access keys. On Kubernetes, Falco runs as a DaemonSet catching runtime attacks (shell spawning, sensitive file reads, unauthorized binary execution, container escape via host mount), and OPA Gatekeeper blocks privileged containers, host namespaces, and root execution. The Gatekeeper policies are unit-tested with gator against known-good and known-bad pods, and CI gates selectively: defensive modules are held to a Checkov baseline while the intentionally-vulnerable surface is scanned informationally, with secret scanning blocking everywhere. Techniques are captured as an importable ATT&CK Navigator layer.",
    tags: ["GuardDuty", "OpenSearch", "Falco", "OPA Gatekeeper", "EventBridge", "Lambda", "Pacu", "gator", "Checkov", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/cloud-security-lab",
    caseStudy: "cloud-security-lab",
  },
  {
    num: "08",
    title: "Uptime",
    titleOut: "Monitor (AWS + Azure)",
    desc: "Active health monitoring for jordandesigns.io, built independently on both clouds so the same three checks run against the same target through two different serverless stacks. Each five-minute invocation validates HTTP status, response body content match, and SSL certificate expiry together, retrying once before recording a failure so transient blips do not page. On AWS an EventBridge schedule drives a Lambda that logs results to DynamoDB with a 90-day TTL and publishes IsHealthy, LatencyMs, and SSLDaysRemaining as CloudWatch custom metrics, with alarms for site-down on two consecutive failures, high-latency on sustained slow responses, and SSL expiry at 30 days warning and 7 days critical, all surfaced on a dashboard with threshold annotations. On Azure a timer-triggered Python function on Flex Consumption writes to Cosmos DB serverless with a 90-day container TTL and logs to Application Insights, where three KQL scheduled-query alerts cover the same three conditions and route to an action group delivering email and SMS. The Azure function reaches Cosmos through a managed identity granted the built-in data-plane contributor role, so no keys live in config. Both stacks are provisioned in Terraform and were verified live against the running site.",
    tags: ["EventBridge", "Lambda", "CloudWatch", "DynamoDB", "Azure Functions", "Cosmos DB", "Application Insights", "Managed Identity", "Terraform"],
    categories: ["AWS", "Azure"],
    link: "https://github.com/jordann6/website-uptime-monitor",
    links: [
      { label: "AWS repo", href: "https://github.com/jordann6/website-uptime-monitor" },
      { label: "Azure repo", href: "https://github.com/jordann6/azure-website-uptime-monitor" },
    ],
  },
  {
    num: "09",
    title: "Azure DevSecOps",
    titleOut: "Pipeline",
    desc: "Four-stage security-gated CI/CD pipeline for a containerized Flask app deployed to AKS via blue/green rollout. Bandit SAST and pip-audit CVE scanning run first, then Checkov validates both Terraform and Kubernetes manifests. The Docker image is built for linux/amd64, scanned by Trivy (blocks on unfixed CRITICAL/HIGH), and pushed to ACR only after passing. OWASP ZAP then runs a baseline DAST scan against a live container before the deploy stage applies manifests to AKS via envsubst image substitution. Containers run as non-root with allowPrivilegeEscalation=false, readOnlyRootFilesystem, all capabilities dropped, and seccompProfile: RuntimeDefault. AKS has local admin disabled, AAD RBAC enforced, and OIDC issuer enabled for workload identity. GitHub Actions authenticates to Azure via OIDC — no stored credentials.",
    tags: ["AKS", "ACR", "Bandit", "Trivy", "OWASP ZAP", "Checkov", "GitHub Actions OIDC", "Terraform"],
    categories: ["Azure", "Platform"],
    link: "https://github.com/jordann6/azure-devsecops-project",
  },
  {
    num: "10",
    title: "Event-Driven",
    titleOut: "Remediation (AWS + Azure)",
    desc: "Fully automated remediation pipeline triggered by a CloudWatch metric alarm — no manual intervention in the hot path. When EC2 CPU utilization exceeds 80% for two consecutive 5-minute periods, CloudWatch publishes a state-change event to EventBridge, which invokes a Python Lambda directly. The Lambda routes on event type: EventBridge alarm events trigger an EC2 reboot; manual invocations with an action field route to either lockdown_sg (revokes all open-world ingress rules from the security group) or enforce_tags (applies required Environment, ManagedBy, and Monitored tags to non-compliant instances). Every execution publishes a structured result to SNS and writes a JSON audit trail to CloudWatch Logs with 14-day retention. IAM policy scopes ec2:RebootInstances to the specific instance ARN and sns:Publish to the specific topic ARN. Terraform provisions all resources including the alarm, EventBridge rule, Lambda permission, and log group. GitHub Actions deploys via OIDC with Bandit SAST and pip-audit gates before apply. The Azure build mirrors the same three actions on a different alerting model: an Azure Monitor metric alert on Percentage CPU over a 10-minute window fires an action group that both notifies by email and SMS and invokes a Python function on Flex Consumption, which restarts the VM on a common alert schema payload, or runs lockdown_nsg to delete inbound NSG rules sourced from Internet, wildcard, or 0.0.0.0/0, or enforce_tags. It authenticates with a system-assigned managed identity bound to a custom RBAC role scoped to exactly VM restart, VM write, and NSG rule delete on the resource group. Both are pure code with no AI or workflow engine in the loop, the deliberate counterpart to the n8n and Claude incident responder. Verified end to end against real Azure with restart, NSG lockdown, and tag enforcement all confirmed.",
    tags: ["Lambda", "EventBridge", "CloudWatch", "EC2", "Azure Functions", "Azure Monitor", "Managed Identity", "Custom RBAC", "Terraform", "Python"],
    categories: ["AWS", "Azure"],
    link: "https://github.com/jordann6/event-driven-aws-remediation",
    links: [
      { label: "AWS repo", href: "https://github.com/jordann6/event-driven-aws-remediation" },
      { label: "Azure repo", href: "https://github.com/jordann6/azure-event-driven-remediation" },
    ],
  },
  {
    num: "11",
    title: "Automated",
    titleOut: "Backup (AWS + Azure)",
    desc: "A backup vault with automated daily verification at 08:00 UTC, built on both clouds so the same retention policy is expressed through two different lifecycle engines. Neither build stores a credential: on AWS an IAM execution role authenticates the Lambda to S3, and on Azure a managed identity authenticates the Logic App to Blob Storage over MSI, so no access keys or connection strings exist anywhere. Versioning preserves every write as a recoverable point on both sides. AWS tiers objects Standard to Standard-IA at 30 days, Glacier at 90, and delete at 365, with noncurrent versions archived to Glacier at 7 days and expired at 90; Azure tiers blobs Hot to Cool at 30 days, Archive at 90, and delete at 365, with 7-day soft delete covering accidental removal. An optional SendGrid call sends a daily confirmation once the object or blob list succeeds. 15 resources on AWS in Terraform with an S3 remote backend and native state locking, 9 on Azure with an Azure Blob backend, both deployed and validated end to end through GitHub Actions OIDC.",
    tags: ["S3", "Lambda", "EventBridge Scheduler", "Azure Blob Storage", "Logic Apps", "Managed Identity", "Lifecycle Management", "Terraform", "GitHub Actions OIDC"],
    categories: ["AWS", "Azure"],
    link: "https://github.com/jordann6/aws-backup-system",
    links: [
      { label: "AWS repo", href: "https://github.com/jordann6/aws-backup-system" },
      { label: "Azure repo", href: "https://github.com/jordann6/azure-backup-system" },
    ],
  },
  {
    num: "12",
    title: "Serverless Document",
    titleOut: "Intelligence",
    desc: "Event-driven document extraction pipeline on Azure Functions triggered by Blob Storage uploads. Dropping any file into the raw container fires a Python 3.11 blob trigger, which submits the document to Azure AI Document Intelligence (prebuilt-document model), extracts key-value pairs and raw content, writes a structured JSON result to a processed container, and upserts a metadata row to Table Storage for fast querying — all without touching the raw blob. Two storage accounts isolate the Functions runtime from document storage. System-assigned Managed Identity with six scoped RBAC role assignments handles all service-to-service auth — no connection strings or API keys anywhere in application config. All infrastructure provisioned in Terraform with an Azure Blob remote backend, deployed via GitHub Actions federated credentials.",
    tags: ["Azure Functions", "Azure AI Document Intelligence", "Blob Storage", "Table Storage", "Managed Identity", "Terraform", "Python", "GitHub Actions OIDC"],
    categories: ["Azure", "AI"],
    link: "https://github.com/jordann6/azure-document-intelligence",
  },
  {
    num: "13",
    title: "AWS Developer",
    titleOut: "Platform",
    desc: "Internal Developer Platform on EKS that gives application teams a paved road. ArgoCD app-of-apps GitOps reconciles every platform component from Git. Crossplane with an IRSA-authenticated AWS provider exposes a self-service Bucket API: a developer's one-line claim provisions a real S3 bucket hardened by default with AES256 encryption, versioning, all four public-access-block settings, and an owning-team tag, with no static credentials anywhere. Kyverno enforces an owning-team label as admission policy in flagged namespaces. A Backstage golden-path template scaffolds a new service complete with a Dockerfile, a hardened Helm chart, and an ArgoCD Application so it is GitOps-deployable the moment it exists. EKS, VPC, OIDC, and the scoped IRSA role provisioned in Terraform with an S3 remote state backend. Verified end to end against real AWS, then torn down clean.",
    tags: ["EKS", "ArgoCD", "Crossplane", "Kyverno", "Backstage", "IRSA", "Terraform", "GitOps"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/aws-developer-platform",
    caseStudy: "aws-developer-platform",
    featured: true,
    featuredRank: 6,
  },
  {
    num: "14",
    title: "Azure Developer",
    titleOut: "Platform",
    desc: "Internal Developer Platform on AKS, the Azure counterpart to the AWS platform built on a different toolchain to show the paved-road pattern is not cloud or tool specific. Flux reconciles the platform from Git via GitRepository, Kustomization, and HelmRelease. Crossplane with an Azure provider authenticated through Azure Workload Identity exposes a self-service StorageAccount API: a claim provisions a real storage account hardened by default with TLS1_2 minimum, HTTPS-only traffic, public blob access disabled, and infrastructure encryption, with no client secrets. Kyverno enforces owning-team labels as admission policy. AKS with OIDC issuer and workload identity, plus a federated user-assigned managed identity, provisioned in Terraform with an Azure Storage state backend. Verified end to end against real Azure, then torn down clean.",
    tags: ["AKS", "Flux", "Crossplane", "Workload Identity", "Kyverno", "Terraform", "GitOps"],
    categories: ["Azure", "Platform"],
    link: "https://github.com/jordann6/azure-developer-platform",
    caseStudy: "azure-developer-platform",
  },
  {
    num: "15",
    title: "Azure Landing",
    titleOut: "Zone",
    desc: "Enterprise-grade Azure landing zone built entirely in Terraform. Establishes the governance foundation that workload subscriptions inherit: a four-level management group hierarchy (org root, Platform, Workloads, Sandbox), three custom Azure Policy definitions assigned at the Workloads management group scope (require owner tag, deny public IPs, allowed locations), and a hub-spoke network. Hub VNet carries correctly-named and minimum-sized reserved subnets for Azure Firewall, VPN Gateway, and Bastion alongside an active management subnet with an internet-deny NSG. A reusable Terraform module vends new spokes with a single call: it provisions the spoke resource group, spoke VNet, workload subnet, and both directions of VNet peering. Two spokes (Platform, Sandbox) demonstrated. Verified end to end against real Azure, then torn down clean.",
    tags: ["Management Groups", "Azure Policy", "Hub-Spoke", "VNet Peering", "Terraform", "Governance"],
    categories: ["Azure", "Platform"],
    link: "https://github.com/jordann6/azure-landing-zone",
    caseStudy: "azure-landing-zone",
  },
  {
    num: "16",
    title: "Incident",
    titleOut: "Responder (AWS + Azure)",
    desc: "Automated incident response where the runbook is an n8n workflow rather than glue code. A CloudWatch alarm on a target EC2 instance (CPUUtilization at or above 80% for two 5-minute periods) publishes to an SNS topic, which delivers over HTTPS to n8n running on ECS Fargate behind an ALB with an ACM certificate on a Route 53 subdomain. The workflow confirms its own SNS subscription programmatically, asks Claude Haiku for a plain-English incident summary and recommended next step, posts an incident card to Slack, reboots the instance via the EC2 API signed with SigV4, then waits and re-checks the alarm with DescribeAlarms to either mark the incident resolved or escalate. Remediation runs under a least-privilege IAM user scoped to RebootInstances on the single target ARN plus read-only enrichment, and n8n secrets are pulled from SSM SecureString parameters at task start so nothing sensitive lives in Terraform state. The deliberate counterpart to the Lambda-glued event-driven-aws-remediation project: same incident class, a visual and version-controlled runbook instead of code. Built to deploy, demo, and destroy for about a dollar a day. The same runbook was then mapped onto Azure on a deliberately different toolchain: an Azure Monitor metric alert fires through an action group webhook posting the common alert schema to n8n on Azure Container Apps, which serves a publicly trusted HTTPS endpoint with no load balancer or certificate to manage, and restarts the VM through the Azure Management API using an OAuth2 client-credentials service principal scoped to Virtual Machine Contributor on the single target. Same incident class, same visual and version-controlled runbook, two different alerting and identity models.",
    tags: ["ECS Fargate", "Container Apps", "n8n", "CloudWatch", "Azure Monitor", "Claude Haiku", "Entra ID", "Terraform"],
    categories: ["AWS", "Azure", "AI", "Platform"],
    link: "https://github.com/jordann6/aws-incident-responder",
    links: [
      { label: "AWS repo", href: "https://github.com/jordann6/aws-incident-responder" },
      { label: "Azure repo", href: "https://github.com/jordann6/azure-incident-responder" },
    ],
    caseStudy: "aws-incident-responder",
  },
  {
    num: "17",
    title: "Azure VM",
    titleOut: "Hardening",
    desc: "Immutable golden-image pipeline that bakes a CIS-style hardening baseline into an Ubuntu 22.04 image, then deploys a hardened jump host from it, filling the VM config-management gap in an otherwise serverless and Kubernetes portfolio. An Ansible role applies the baseline across sshd (no root login, no password auth, strong ciphers and key exchange), auditd, fail2ban, sysctl kernel parameters, PAM password policy, and filesystem module blacklisting, with every control toggleable. Molecule tests the role in a container on every push via GitHub Actions (converge, verify, idempotence), so a broken control fails CI before it is ever baked into an image. Packer's azure-arm builder runs the role as a provisioner against a transient build VM and captures a managed image, authenticated through the Azure CLI so no secret ever touches a file. Terraform then deploys a jump host from that image into a Z1-style management subnet behind an internet-deny NSG that allows SSH from a single source, with a use_existing_hub switch to drop the host into a live azure-landing-zone hub instead. Terraform owns every cloud resource and Ansible does in-OS configuration only, keeping the tool boundary clean. Built to deploy, demo, and destroy for under a dollar.",
    tags: ["Packer", "Ansible", "Molecule", "Terraform", "Azure VM", "CIS"],
    categories: ["Azure", "Platform"],
    link: "https://github.com/jordann6/azure-vm-hardening",
  },
  {
    num: "18",
    title: "Observability",
    titleOut: "Stack (EKS + AKS)",
    desc: "One Kubernetes observability platform that runs on EKS and AKS from a single repo, where the identical kube-prometheus-stack, Helm values, and alert rules carry over unchanged and the only real difference is the cluster layer. Terraform stands up either side: on AWS a VPC with a single NAT gateway to hold cost down plus an EKS cluster with a two-node t3.medium managed node group, on Azure a resource group and an AKS cluster with a two-node Standard_B2s pool and a system-assigned managed identity, so the Azure path stores no credentials at all. Helm then installs Prometheus, Grafana, AlertManager, node-exporter, and kube-state-metrics on both. A sample workload is scraped through a ServiceMonitor so the dashboards carry real data, and the same three custom PrometheusRule alerts (sample-app target down, pod crashlooping, node memory pressure) route to AlertManager with a null receiver by default so the demo needs no external endpoint. The demo script port-forwards Grafana, Prometheus, and AlertManager, then scales the sample app to zero to trip the target-down alert on cue. Both clouds were verified against the live Prometheus API with every scrape target reporting up, then torn down clean with zero residual billing, the Azure path removing resource group, cluster, and node VMSS together. Deploy, demo, and destroy run from idempotent scripts driven by a single cloud argument, which is what makes the cross-cloud parity claim testable rather than asserted.",
    tags: ["EKS", "AKS", "Prometheus", "Grafana", "AlertManager", "Helm", "kube-prometheus-stack", "ServiceMonitor", "Terraform"],
    categories: ["AWS", "Azure", "Platform"],
    link: "https://github.com/jordann6/observability-stack",
  },
  {
    num: "19",
    title: "AWS Landing Zone",
    titleOut: "Automator",
    desc: "Terraform account vending machine that turns a bare AWS Organization into a SOC 2 ready multi-account foundation, built for the gap between one shared account with a root login and a full Control Tower deployment. One apply stands up the OU hierarchy (Security, Workloads/Prod, Workloads/NonProd, Sandbox), four SCP guardrails (root-user deny, leave-org deny, region allowlist, CloudTrail tamper protection), IAM Identity Center groups and permission sets, an organization CloudTrail flowing into an SSE-KMS, versioned, object-locked bucket in a dedicated log-archive account, and per-account AWS Budgets alarms. After that, every new account is one block in a tfvars map: the vending module creates it in the right OU with owner and cost-center tags, assumes into it to apply an IAM baseline (account alias, strict password policy, scoped smoke-test role, default VPC removed in every region), and wires SSO assignments. The apply is two-stage because Terraform provider configurations must resolve at plan time, so cross-account assume-role ARNs come from variables filled by a helper script after the accounts exist. Deployed live against a real Organization: the SCP check returned an explicit service control policy deny for API calls outside the region allowlist, org CloudTrail delivered per-account logs within minutes, SSO group assignments granted Developer on nonprod with nothing on the management account, and vended accounts came up with zero VPCs. CI gates on checkov, tflint, and gitleaks with an OIDC-authenticated plan job and zero static keys; all real tfvars stay gitignored so emails and account IDs never reach the repo. The same workflow reads three ways: SOC 2 foundation for startups, account vending for SaaS platform teams, client onboarding for MSPs.",
    tags: ["AWS Organizations", "SCPs", "IAM Identity Center", "CloudTrail", "KMS", "S3 Object Lock", "AWS Budgets", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/landing-zone-automator",
    caseStudy: "aws-landing-zone-automator",
  },
  {
    num: "20",
    title: "Azure AKS",
    titleOut: "Runtime Security",
    desc: "Defense in depth for a running AKS cluster, the Kubernetes runtime-security counterpart to the AWS cloud-security-lab, built on a different policy engine and detection stack to show the pattern is not tool specific. Three independent controls layer on one cluster, each acting at a different point so an attack that evades one is caught by the next. Terraform provisions the AKS cluster with OIDC issuer, workload identity, Azure Monitor, and the microsoft_defender add-on wired to a shared Log Analytics workspace, plus a subscription-level Microsoft Defender for Containers plan for agentless image CVE scanning and control-plane threat alerts. At admission, four Enforce-mode Kyverno ClusterPolicies reject unsafe pods before they run: no privileged containers, no host namespaces, no hostPath volumes, and runAsNonRoot required. At runtime, Falco runs as a modern-eBPF DaemonSet with five MITRE-tagged custom rules covering shell spawning, sensitive file reads, container escape via mount, dropped-binary execution, and Azure IMDS credential theft. Every Kyverno policy is unit-tested offline with the Kyverno CLI against known-good and known-bad pods, gating them in CI before they reach a cluster. A scripted attack driver first proves admission control blocks the vulnerable pod, then runs the same pod in an exempt namespace to demonstrate runtime detection. System-assigned managed identity means no stored credentials anywhere.",
    tags: ["AKS", "Kyverno", "Falco", "Defender for Containers", "Log Analytics", "Workload Identity", "Terraform", "MITRE ATT&CK"],
    categories: ["Azure", "Platform"],
    link: "https://github.com/jordann6/azure-aks-runtime-security",
    caseStudy: "azure-aks-runtime-security",
    featured: true,
    featuredRank: 5,
  },
  {
    num: "21",
    title: "Incident Forensics",
    titleOut: "& Evidence Capture",
    desc: "Automated incident response where a GuardDuty finding against an EC2 instance drives a Step Functions runbook with no human in the hot path. The states run in the order a responder would work by hand: parse the finding and gate on severity, isolate the instance by swapping every network interface onto a quarantine security group with no ingress and no egress, snapshot every attached EBS volume, then copy each snapshot re-encrypted with a dedicated forensics KMS key so evidence moves into a custody domain governed by a key only the pipeline controls. A bounded wait loop polls the copies to completion before the runbook attaches a deny-all policy conditioned on aws:TokenIssueTime to the instance role, invalidating any temporary credentials an attacker pulled from the metadata service, which isolating the host alone does not do. Finally it writes a JSON evidence manifest with captured console output to an SSE-KMS bucket and deletes the unencrypted sources so only encrypted evidence survives. Isolation runs before capture on purpose: stopping active damage outranks a few seconds of forensic completeness. Seven single-purpose Lambdas each carry their own least-privilege role, and the one destructive capability, credential revocation, is fenced to a single IAM path both in policy and at runtime. DevSecOps CI gates on ruff, bandit, terraform validate, checkov, and gitleaks.",
    tags: ["GuardDuty", "Step Functions", "Lambda", "KMS", "EventBridge", "S3", "IAM", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/aws-incident-forensics",
  },
  {
    num: "22",
    title: "Order Management",
    titleOut: "API (.NET)",
    desc: "A production-style order service in ASP.NET Core 8 where the engineering around the endpoints is the point. The order status lifecycle is enforced in the domain aggregate rather than the HTTP layer, so an order advances Received to Confirmed to Shipped to Delivered and can be cancelled only before it ships, with illegal moves throwing a domain exception the API surfaces as HTTP 409 Conflict rather than a 400, because the request is well-formed and only conflicts with current state. That lifecycle is covered by twelve xUnit tests that need no infrastructure since the rules are pure domain logic. EF Core with Npgsql runs against RDS PostgreSQL whose master password is generated and managed by RDS in Secrets Manager, read once at startup through the task role and never placed in the image, an environment variable, or Terraform state. The service runs on ECS Fargate under the CodeDeploy blue/green controller with two target groups: a new task set is health-gated on a readiness endpoint that checks the database, validated on a test listener while the current version serves production, then cut over, with a CloudWatch 5xx alarm wired to roll the deployment back automatically. Serilog emits structured JSON to CloudWatch, OpenTelemetry collects traces and metrics, requests are rate limited, and the container runs non-root from a multi-stage build. CI gates on a warnings-as-errors build and tests, a Trivy image scan, terraform validate, checkov, and gitleaks.",
    tags: ["C# .NET 8", "ECS Fargate", "CodeDeploy", "RDS PostgreSQL", "EF Core", "Secrets Manager", "OpenTelemetry", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/order-management-api",
  },
  {
    num: "23",
    title: "Serverless",
    titleOut: "Lakehouse",
    desc: "A serverless data lakehouse on one S3 bucket split into raw, curated, and query-results zones by prefix. Raw CSV lands in the raw zone; a Glue crawler infers its schema and registers it in the Data Catalog with no hand-written DDL, on the principle of crawling what you do not control. Athena then reads that raw table and runs a CTAS that transforms it into Snappy-compressed, columnar Parquet in the curated zone, whose schema is a deliberate contract the transform declares. The economic payoff is measured, not asserted: the validator runs the same count and sum query against both zones and confirms the curated Parquet scans 156 bytes versus 2.09 MB for the raw CSV, the entire argument for a curated zone made concrete. The Glue crawler role takes the managed Glue service policy for catalog access but its S3 reach is a custom inline policy scoped to this one bucket, not the broad managed S3 access wizards attach by default; the Athena workgroup enforces its own encrypted result location so ad-hoc queries cannot redirect output. A lifecycle rule expires query scratch after seven days. Twelve resources in Terraform, built to deploy, demo, and destroy for well under a quarter, with force-destroy emptying the bucket on teardown so nothing lingers.",
    tags: ["S3", "Glue Data Catalog", "Athena CTAS", "Parquet", "IAM", "Terraform"],
    categories: ["AWS", "Data"],
    link: "https://github.com/jordann6/aws-serverless-lakehouse",
    caseStudy: "aws-serverless-lakehouse",
  },
  {
    num: "24",
    title: "dbt Analytics",
    titleOut: "Engineering",
    desc: "The analytics-engineering layer on top of the lakehouse, where the transformations are code and one command reconciles the warehouse to them. A dbt project on the dbt-athena adapter seeds raw orders, builds a typed and cleaned silver staging view (order_date cast to a real date, non-positive quantity and price dropped, a computed line_total the marts can trust), and materializes two gold marts as Snappy Parquet: revenue by category and country, and a daily revenue trend one row per day. Data quality is enforced as twelve dbt tests that gate every run: unique and not_null on keys, accepted_values on category and country, and a singular test asserting that total revenue in the gold mart reconciles to total line_total in silver to the cent, so a transform that silently drops or double-counts rows fails the build. Terraform provisions the S3 lake, the Glue schema dbt materializes into, and an Athena workgroup; the whole GitOps loop runs as dbt seed, run, and test, and CI compiles the model DAG and lints on every push. An independent validator re-checks the marts straight against Athena, confirming the Parquet output, the row survival, and the silver-to-gold revenue reconciliation without going through dbt.",
    tags: ["dbt", "Athena", "Glue", "S3", "Parquet", "Data Tests", "GitOps", "Terraform"],
    categories: ["AWS", "Data"],
    link: "https://github.com/jordann6/aws-lakehouse-dbt",
    caseStudy: "dbt-analytics-athena",
  },
  {
    num: "25",
    title: "Medallion",
    titleOut: "Lakehouse (Azure)",
    desc: "The Azure analog of the Athena lakehouse, using the same bronze, silver, and gold medallion pattern with no cluster and no dedicated pool. Raw CSV lands in a bronze container on ADLS Gen2 with the hierarchical namespace enabled, which is what gives Blob storage real directory semantics. Synapse serverless SQL reads it with OPENROWSET, types and cleans it into a silver Parquet table with CETAS, then aggregates silver into a gold Parquet table with a second CETAS; the only compute is the serverless engine, free at rest and billed per terabyte scanned. Access is by identity, not keys: serverless reaches the lake as the workspace managed identity through a database-scoped credential declared WITH IDENTITY = 'Managed Identity', so no storage key or SAS token is ever created, stored, or committed, and Terraform grants that identity Storage Blob Data Contributor. A pure-Python TDS runner drives the SQL with no ODBC or sqlcmd dependency. The build documents two real Azure lessons: some subscriptions are soft-blocked from provisioning new SQL servers in certain regions, and a subscription Owner still gets 403 on the blob data plane until granted a data-plane role. A four-check validator confirms Parquet output, row survival, and silver-to-gold revenue reconciliation.",
    tags: ["ADLS Gen2", "Synapse Serverless", "CETAS", "Managed Identity", "Parquet", "Terraform"],
    categories: ["Azure", "Data"],
    link: "https://github.com/jordann6/azure-medallion-lakehouse",
  },
  {
    num: "26",
    title: "GPU Index",
    titleOut: "API (FastAPI)",
    desc: "An async FastAPI service for GPU pricing intelligence, where the database work is the point rather than the endpoints. Two million price observations across twenty-six accelerators, ten providers, and twenty regions make the query plan matter: the hot path returns the latest price per provider and region with a thirty-day rolling median, and it went from 166.6ms to 23.8ms, an 85.5 percent cut, with heap blocks read falling from 43,215 to 1,198. The win came from two specific decisions. The index column order was matched to the DISTINCT ON sort so Postgres consumes index order and skips the sort entirely, and the selected columns were carried in INCLUDE so both branches of the plan run index-only with Heap Fetches at zero. A partial index on availability measured worse and was rejected, because the API passes availability as a bind parameter and the planner cannot prove a partial predicate holds for an unknown parameter; the /v1/index endpoint does use one, since there the filter is a literal. Planner cost settings are treated as part of the tuning and applied to both the before and after runs, so the reported delta isolates the indexes rather than mixing in the cost-model change. Keyset pagination replaces OFFSET, which at depth fifty thousand is 3.4ms versus 0.7ms, because OFFSET walks and discards every preceding row no matter what indexes exist. Redis serves a read-through cache and a per-key token bucket, and both fail open: a Redis outage degrades to a direct database read rather than taking the API down. Under load the service sustains 1,114 requests per second at a p50 of 6.8ms and a p95 of 8.3ms with zero errors and a 99.7 percent cache hit ratio; the load harness fails its own run above a one percent error rate, after an early version reported flattering percentiles computed over thirteen thousand rate-limited requests. Ingestion fans out across fifty provider feeds under a bounded semaphore at 20.1 times sequential, with return_exceptions so one bad feed cannot sink the run. Forty-one tests at ninety-five percent coverage swap the session and cache through FastAPI dependency overrides. Terraform provisions ECS Fargate, RDS, ElastiCache, an ALB, and a ten dollar budget with no NAT Gateway, deliberately, since NAT would be the largest line item and the resource most likely to survive a partial destroy. CI gates on ruff, mypy, coverage, Bandit, Trivy, and gitleaks, then captures the running task definition before registering a new revision so a failed smoke test rolls back to a known-good target.",
    tags: ["FastAPI", "Pydantic v2", "SQLAlchemy async", "PostgreSQL", "Redis", "ECS Fargate", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/gpu-index-api",
    caseStudy: "gpu-index-api",
    featured: true,
    featuredRank: 2,
  },
  {
    num: "27",
    title: "Secrets Lifecycle",
    titleOut: "& Rotation Readiness",
    desc: "Governance tooling built on the observation that secrets age out not because nobody notices but because nobody knows which workloads consume them, so rotation carries outage risk. A Go scanner Lambda sweeps Secrets Manager, SSM SecureString parameters, and IAM access keys through a bounded goroutine worker pool, multi-account capable via assumed roles, capturing metadata only: the scanner and analyzer roles carry an explicit IAM deny on GetSecretValue and GetParameter plus a kms:ViaService-scoped deny on Decrypt, so secret values cannot be read anywhere in the pipeline even if a broader policy were ever attached. A Python analyzer queries 90 days of CloudTrail through Athena with partition projection to build a consumer map per secret: which principals actually read it and how often. That map drives a rotation readiness score combining age, consumer count, consumer identifiability, and rotation configuration, and Claude on Bedrock synthesizes an ordered rotation runbook with rollback path and confidence level for the highest-risk secrets, prompted for strict JSON and validated on parse, degrading to a deterministic rule-based runbook when the model is unavailable. Every finding maps to HIPAA 164.308(a)(5)(ii)(D), SOC 2 CC6.1, NIST 800-53 IA-5, and CIS 1.14 from a versioned config file, lands as an evidence artifact in a versioned S3 bucket with Object Lock in governance mode, and imports to Security Hub as ASFF findings. EventBridge schedules the scan and Lambda on-success destinations chain scanner to analyzer to reporter, which serves a self-contained dashboard from S3. Verified live end to end: 17 resources scanned, consumers identified for 53 percent of secrets down to the exact Lambda execution roles and read counts, 5 runbooks generated, 31 control-mapped findings imported to Security Hub, then all 40 Terraform resources destroyed the same day with the account verified clean.",
    tags: ["Go", "Lambda", "CloudTrail", "Athena", "DynamoDB", "Amazon Bedrock", "Security Hub", "S3 Object Lock", "EventBridge", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/aws-secrets-lifecycle",
    caseStudy: "secrets-lifecycle",
    featured: true,
    featuredRank: 1,
  },
  {
    num: "28",
    title: "Azure Secrets",
    titleOut: "Lifecycle & Rotation",
    desc: "The Azure counterpart to the AWS secrets platform, rebuilt as a single Ruby on Rails 8 application on Container Apps rather than three Lambdas, ported as an idea rather than as code so the places Azure genuinely works differently stay visible. The scanner sweeps Key Vault secrets and certificates, App Configuration key values, and Entra ID app registration credentials through a bounded worker pool, metadata only: the managed identity holds Key Vault Reader, which carries secrets/readMetadata/action and vaults/*/read but not getSecret/action, so reading a value is structurally impossible rather than merely unimplemented. Azure has no equivalent of an IAM explicit deny, so a custom Azure Policy audits any role assignment that would widen that grant. The analyzer replaces CloudTrail, Glue, and Athena with one KQL query against Log Analytics, resolves caller object IDs to display names through Microsoft Graph, and scores rotation readiness on two dimensions the AWS version had no analogue for: expiry state, and whether the vault uses RBAC, where the resource does not name its own readers and the audit log is the only evidence there is. Azure OpenAI synthesizes runbooks pinned to json_object with a validated parse and a deterministic fallback. Findings map to HIPAA, SOC 2, NIST 800-53 IA-5 and AC-2, Microsoft cloud security benchmark IM-3 and IM-8, and CIS Azure 8.3, 8.5, and 8.7, landing as immutable Blob evidence and streaming into Microsoft Sentinel through the Logs Ingestion API. There is no stored credential anywhere: Postgres has password authentication disabled and the app authenticates with an Entra token minted per connection, because a platform that reports on static credentials should not hold one. A make verify job proves all of this against the live cloud in both directions, including that reading a secret value is denied with 403 and that the evidence container rejects an overwrite with 409, and exits non-zero on regression so a widened role fails the build.",
    tags: ["Ruby on Rails", "Container Apps", "Key Vault", "Log Analytics KQL", "Entra ID", "Azure OpenAI", "Microsoft Sentinel", "PostgreSQL", "Terraform"],
    categories: ["Azure", "Platform"],
    link: "https://github.com/jordann6/azure-secrets-lifecycle",
    caseStudy: "azure-secrets-lifecycle",
  },
  {
    num: "29",
    title: "Workload Identity",
    titleOut: "Federation (GCP)",
    desc: "CI that authenticates to Google Cloud with no service account key anywhere, and an org policy that makes creating one impossible even for a project owner. Four federation paths are built side by side so the trade-offs are visible rather than asserted: GitHub Actions to GCP through direct resource access, where a principalSet holds IAM roles on the bucket, registry, and secret and no service account exists at all; the same token exchanged for a service account through roles/iam.workloadIdentityUser, built only for comparison; AWS to GCP through a pool that verifies a signed GetCallerIdentity request against AWS STS; and GCP to AWS through web identity federation, where AWS treats accounts.google.com as a built-in provider so trust pins to the service account numeric unique ID rather than its email, because an email is reusable after deletion and a unique ID is not. The security control is the provider attribute condition, not the attribute mapping: mapping renames claims while the condition decides who gets in, and a pool without one trusts every token GitHub's issuer signs, which is every workflow run in every repository on GitHub. Authority splits across two attributes of one pool so read binds on attribute.repository and write binds on attribute.ref, which is what lets a fork pull request read without being able to write. iam.disableServiceAccountKeyCreation and disableServiceAccountKeyUpload turn the keyless claim from a convention into a control, and Secret Manager and Artifact Registry share one CMEK key so disabling a single key version revokes both at once. Verified live: the deployed attribute condition, both constraints enforcing, zero default networks, CMEK binding confirmed through the API, and a service account key creation attempt refused as project owner with the constraint named in the violation. Four failures during the first apply are documented rather than smoothed over, including that organizationAdmin grants neither folder creation nor org policy administration, and that user credentials with no quota project bill orgpolicy calls to Google's shared OAuth client project. Deployed and destroyed the same day for under five cents, with the pool soft-delete window and the permanence of KMS key rings written into the teardown.",
    tags: ["Workload Identity Federation", "Org Policy", "Secret Manager", "Cloud KMS", "Artifact Registry", "GitHub OIDC", "Terraform"],
    categories: ["GCP", "Platform"],
    link: "https://github.com/jordann6/gcp-workload-identity-federation",
    caseStudy: "gcp-workload-identity-federation",
  },
  {
    num: "30",
    title: "GCP",
    titleOut: "Landing Zone",
    desc: "An organization built as code, and the third version of a problem already solved with AWS Organizations and SCPs and with an Azure Landing Zone and Azure Policy, built again because the mechanism genuinely differs. An SCP is a deny boundary evaluated against IAM at request time and Azure Policy evaluates resources through effects, while GCP org policy constrains the shape of the configuration itself, so the API rejects a violating resource and the violation cannot exist rather than being disallowed to whoever asked. Exceptions invert too: an SCP deny cannot be un-denied lower in the tree, so AWS exceptions mean moving an account to another OU, while a GCP list constraint lets a child policy widen an inherited one, demonstrated here by allowing US locations at the org and adding EU for nonprod alone without weakening anything elsewhere. Nine constraints attach at the organization root rather than a folder, since a folder-scoped policy is bypassed by creating a project somewhere else: no service account keys, no default network, no serial port access, OS Login required, no public Cloud SQL, uniform bucket access, no external IPs on VMs, and approved locations only. A tenth, domain restricted sharing, ships deliberately disabled because it blocks binding allUsers and would break any public Cloud Run service, and naming that trade-off in code is worth more than silently enforcing one side of it. Every project is vended through one factory, so no project can exist without a folder, a billing link, data access audit logs, and the default network suppressed; the two workload projects are identical except for placement, which is the whole demonstration. A Shared VPC host project owns the network while workload projects attach as service projects and receive access per subnet rather than per project, with explicit default-deny ingress and SSH permitted only from the IAP forwarding range, so there is no public SSH path and no VM carries an external IP. An organization sink with include_children ships admin activity, data access, system event, and policy denial logs to a partitioned BigQuery dataset and covers projects created after the sink exists, with partition expiry bounding retention and cost together. Security Command Center Standard streams active unmuted findings to Pub/Sub and a billing budget alerts on both actual and forecast spend, and one CMEK key covers the audit dataset and both topics so a single disable revokes the entire audit trail and finding stream at once.",
    tags: ["Org Policy", "Resource Manager", "Shared VPC", "Cloud Logging", "BigQuery", "Security Command Center", "Cloud KMS", "Terraform"],
    categories: ["GCP", "Platform"],
    link: "https://github.com/jordann6/gcp-landing-zone",
    caseStudy: "gcp-landing-zone",
  },
  {
    num: "31",
    title: "Supply Chain",
    titleOut: "Security (GCP)",
    desc: "A signature over a digest, rather than a check on where an image came from. Most artifact controls verify a registry name, a repository path, or a tag pattern, and every one of those is a string an attacker satisfies by pushing to the registry, which is a far lower bar than compromising a build. The question worth answering is whether the checks actually ran on these exact bytes, and the only durable answer is a signature made by something that could not have signed unless they passed. Cloud Build builds a container, resolves the tag to a digest and works only on the digest from then on, runs a synchronous on-demand Artifact Analysis scan, and signs with a Cloud KMS asymmetric key only when nothing blocking comes back; Binary Authorization on Cloud Run then refuses any digest that signature does not cover. The gate is the step ordering rather than a conditional, since Cloud Build stops on the first failing step, so there is nothing inside the signing step to bypass. Two projects split the trust boundary: the signing key, registry, scanner, and attestor live in the build project while the deployment policy lives in the runtime project, whose Binary Authorization service agent holds attestorsVerifier on the attestor and nothing more, so verifying and signing are different permissions on different resources in different projects and bypassing the gate requires compromising both. If they shared a project, anyone who could edit the policy could mint the signature satisfying it. The same argument runs one layer down for VM images, where Packer bakes a CIS-informed Ubuntu image into an image family and compute.trustedImageProjects makes that project's images the only bootable ones, expressed as a project rather than a name so there is no tag convention to get wrong; the constraint is scoped to the runtime project rather than the org because at the org it would also cover the build project, where Packer must boot a stock image, and the bake would deadlock on the policy it exists to satisfy. Verified live in four acts: an unsigned image, real and in the trusted registry and built by the same Cloud Build, refused at deploy with the attestor named in the denial; the same source through the pipeline scanned, signed, deployed, and answering; a stock public image refused at instance create by the org constraint; and the hardened family booting. The scan gate blocked the project's own container on its first run, on two CRITICALs in the Go toolchain rather than in the application or base image, and the fix was bumping the compiler rather than lowering the threshold. Deployed, demonstrated, and destroyed the same day for under a dollar, with the four things terraform destroy does not clean written into the teardown script and the README.",
    tags: ["Binary Authorization", "Cloud Build", "Artifact Analysis", "Cloud KMS", "Artifact Registry", "Cloud Run", "Packer", "Org Policy", "Terraform"],
    categories: ["GCP", "Platform"],
    link: "https://github.com/jordann6/gcp-supply-chain-security",
    caseStudy: "gcp-supply-chain-security",
  },
  {
    num: "32",
    title: "Zero Trust",
    titleOut: "Access (GCP)",
    desc: "Identity and Access Management answers whether a principal may perform an action, and cannot answer whether the request should be happening at all, which is the gap a stolen credential lives in: it is by construction a valid one, scoped correctly and granted deliberately. The network perimeter used to be the second question and stopped working when resources became APIs on the public internet, because a Cloud Storage bucket has no inside. This rebuilds that second question at the API across three services. Access Context Manager defines what a trusted request looks like as a named object rather than as policy text, so an IAM condition references it by name and changing the definition of trusted is one edit rather than an audit of every policy that inlined an aws:SourceIp equivalent. Identity-Aware Proxy is enabled directly on the Cloud Run service rather than through a load balancer, protecting the run.app endpoint for nothing instead of about twenty dollars a month of infrastructure in front of a container that scales to zero, and the grant it enforces is conditioned on the access level, so losing the trusted context revokes access without the role changing and without the application knowing a policy exists. VPC Service Controls does the part with no honest equivalent on AWS or Azure: the perimeter is an object containing projects, so a resource is protected from the moment it exists, inverting a model where the boundary is conditions written into each resource policy and a bucket created without them is silently outside. The demonstration is a comparison rather than a refusal. A service account holding a real roles/storage.objectViewer on exactly that bucket, impersonated rather than keyed, is refused from a laptop with a VPC-SC violation ID while the same identity reads the same object cleanly from an instance inside the perimeter that has no public address, no NAT, and no SSH key, reachable only through the IAP TCP tunnel with OS Login binding SSH to IAM. Two access levels exist because they fail differently: the trusted level combines identity and network and gates the application, while a management level with no network condition gates perimeter ingress, a deliberate weakening on the reasoning that the ability to remove a control must survive that control being wrong. State lives in a seed project outside the perimeter for the same reason. Applied in dry run first, which immediately caught the VM guest agent calling an API the enforced config would have broken silently, and the live run surfaced a subtler one: under enforcement Terraform could not manage the bucket while plain gcloud as the same user could, because user_project_override attached a quota project outside the perimeter to calls against resources inside it, a RESOURCES_NOT_IN_SAME_SERVICE_PERIMETER refusal that no ingress rule can admit and that is fixed with a second provider rather than a looser policy. Deployed, demonstrated, and destroyed the same day for under a dollar, with the organization-scoped objects that outlive the project written into the teardown.",
    tags: ["VPC Service Controls", "Access Context Manager", "Identity-Aware Proxy", "Cloud Run", "OS Login", "Private Google Access", "IAM Conditions", "Terraform"],
    categories: ["GCP", "Platform"],
    link: "https://github.com/jordann6/gcp-zero-trust-access",
    caseStudy: "gcp-zero-trust-access",
  },
  {
    num: "33",
    title: "GKE with",
    titleOut: "Config Sync (GCP)",
    desc: "A GitOps reconciler and an admission controller are both described as enforcing configuration, and they make different promises. This builds both on one cluster and shows the difference rather than asserting it. Delete a ResourceQuota out of a tenant namespace and Config Sync puts it back in about five seconds; flip one boolean and the identical command from the identical account is refused by an admission webhook and never reaches etcd. Reconciliation is eventual consistency with a measurable window, admission control is a control, and the window is the whole distinction: for those seconds the quota did not exist and any pod admitted in that gap was admitted without it. That is fine for a quota and it is not fine for everything. The cluster is zonal GKE with private nodes, Workload Identity, and a Cloud NAT that exists solely because the reconciler polls github.com over the internet rather than over a Google API path, which makes it load bearing rather than incidental. Terraform builds the cluster and enables the fleet features and manages no object inside it, so a bad namespace change is a revert and one sync interval rather than an apply. Config Sync reconciles a config directory from this public repo with no credential at all, because the repo is public over HTTPS and secret_type is none, which forces the discipline that configuration carries no secrets. Policy Controller runs the full constraint template library with three constraints: two enforcing, and one deliberately left in dry run so its recorded violations answer the question that cannot be answered any other way, which is what turning it on would break. The dry-run constraint is a hand-written ConstraintTemplate requiring image digests, and it flags the sample app that is running right now on a tagged image. Both features are fleet features rather than open source installs, which only became the cheaper option in September 2025 when Google dissolved the GKE Enterprise tier and moved Config Sync, Policy Controller, Fleets, and Connect Gateway into base GKE at no cost; the open source path is now actively worse, since kpt-config-sync publishes no release assets and the manifest bucket its own documentation points at no longer serves ordinary callers. The live run corrected the build in ways review had not. The privileged-pod test was refused by Pod Security Admission rather than by the constraint it named, because PSA runs inside the API server ahead of every validating webhook, which means that test could never have proven Policy Controller works no matter how it was written. Deployed, demonstrated across six acts, and destroyed the same day for about a dollar.",
    tags: ["GKE", "Config Sync", "Policy Controller", "GitOps", "Gatekeeper", "Workload Identity", "NetworkPolicy", "Terraform"],
    categories: ["GCP", "Platform"],
    link: "https://github.com/jordann6/gcp-gke-config-sync",
    caseStudy: "gcp-gke-config-sync",
  },
  {
    num: "34",
    title: "HPC Slurm",
    titleOut: "Cluster (AWS)",
    desc: "A scheduler, a fabric, and a parallel filesystem, built to answer what an interconnect is actually worth rather than to assert it. The measurement only means something if the two runs are the same computation, so the same binary solves the same 2D heat equation over the same 8192 grid for the same 500 iterations at the same four ranks, and the checksum comes back 1.073498e+07 on both fabrics. Over ordinary ENA the job spends 17.5 percent of its time blocked on halo exchange; over EFA it spends 0.8 percent, which is communication time falling by roughly nineteen times. Wall clock went up rather than down, from 18.8 to 21.0 seconds, because a c5n core is older and slower than a c6i core, and reporting the speedup on wall time would have been reporting the CPU rather than the fabric. That is the entire reason the job prints a communication fraction. The workload is a real stencil with a 1D row decomposition where every rank trades boundary rows with its neighbours before it can compute, using MPI_Sendrecv rather than paired blocking sends that deadlock the moment a message outgrows the eager threshold, and the test that guards it asserts the invariant that a domain-decomposed stencil must produce an identical checksum at 1, 2, 4, and 8 ranks, because a broken halo exchange computes against stale boundary rows while every job still exits zero. Terraform owns the VPC, FSx for Lustre, S3, IAM, and the accounting database while ParallelCluster owns only the cluster, since letting the scheduler create its own network and filesystem puts a NAT gateway and 1.2 TiB of Lustre outside state, which is exactly how they survive a teardown and keep billing. Both queues sit at MinCount zero, so an idle cluster is a head node and nothing else, and the EFA nodes at $1.94 an hour each exist only while a job holds them. Nothing carries a public IP or an open port 22: the head node is private and driven over SSM, and the demo uses send-command rather than an interactive session, so it needs no TTY, no key material, and no session-manager-plugin. Nothing in the repository had ever been run against AWS before this deploy, and the first real run found eleven defects, which is the part worth reading.",
    tags: ["ParallelCluster", "Slurm", "EFA", "FSx for Lustre", "MPI", "Open MPI", "SSM", "RDS", "Terraform"],
    categories: ["AWS", "Platform"],
    link: "https://github.com/jordann6/hpc-slurm-cluster",
    caseStudy: "hpc-slurm-cluster",
  },
];
