export interface CaseBlock {
  num: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface CaseStudy {
  slug: string;
  num: string;
  title: string;
  titleOut: string;
  category: string;
  lede: string;
  meta: { k: string; v: string }[];
  blocks: CaseBlock[];
  stack: string[];
  repo: string;
  /** Terminal-styled run receipt: what was provisioned, proven, and torn down */
  receipt?: { rows: { k: string; v: string }[]; total: { k: string; v: string } };
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "golden-path-finops-copilot",
    num: "36",
    title: "Golden-Path FinOps",
    titleOut: "Copilot (AWS + Bedrock)",
    category: "AWS · AI · Platform",
    lede: "A self-service provisioning copilot where a plain-language request becomes a right-sized, budget-checked, policy-gated pull request. The language model translates intent onto vetted modules; every consequential decision stays in code, and the output is a diff a human reviews, never a direct apply.",
    meta: [
      { k: "Role", v: "Platform Eng / FinOps" },
      { k: "Cloud", v: "AWS" },
      { k: "Model", v: "Claude on Bedrock" },
      { k: "Gate", v: "OPA / Rego" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Self-service infrastructure has two failure modes. A Backstage-style form makes the developer already know which module and which instance family they need before they can fill it out. An LLM that freeform-generates and applies Terraform is a gimmick no platform team would ship, because the moment a model invents HCL and runs it, nothing is reviewable and nothing is bounded.",
          "The goal was the version that is actually defensible: let a model turn fuzzy human intent into a selection against vetted modules, keep every real decision deterministic and in code, and make the output a pull request a human reviews rather than a live change.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "The model is a translation and advisory layer only. Claude on Bedrock calls a fixed set of deterministic tools (list_golden_paths, right_size, estimate_cost, check_budget, submit_for_review); it never authors Terraform or invents an instance type or a price.",
          "A right-sizing engine picks the cheapest option that still fits the stated workload: Graviton over x86, burstable for bursty non-latency-critical workloads, Fargate Spot for non-prod stateless services, nightly auto-stop for non-prod, gp3 and KMS encryption always.",
          "A cost tool prices the plan from Infracost when the binary is present and a static price table otherwise, so an estimate is produced with no network call and no credentials. A budget gate checks that estimate against the team's monthly envelope and returns ok, warn, or over.",
          "An OPA/Rego policy denies missing tags, unencrypted storage, un-approved GPUs, over-budget requests, and un-hardened production databases. Over-budget and GPU requests are flagged, not silently approved, and clear only with an explicit approval label.",
          "The output is a pull request carrying the rendered tfvars, the cost delta, the right-sizing rationale, and the policy result. It is never a direct apply; a human merges, then Terraform runs.",
        ],
      },
      {
        num: "/03",
        heading: "Why it holds up",
        paragraphs: [
          "The obvious challenge is why an LLM instead of a form. The answer is that the form is still there underneath, as the module catalog and the tool schemas; the model just removes the requirement that the developer already knows the answer. The determinism lives in the modules and the policy, and the model's output is always reviewable as a diff before anything is created. That is the line between a demo toy and something you would run in production.",
          "The policy is written to avoid the usual trap where a Rego suite passes because no rule ever fires. Every deny rule has a fixture that breaks exactly one thing, plus a base-passes case that proves the rules do not fire spuriously, so the gate is verified to actually gate.",
        ],
      },
      {
        num: "/04",
        heading: "Bedrock, without a key",
        paragraphs: [
          "The model call goes through the Messages-API Bedrock client and authenticates with IAM and SigV4, so there is no Anthropic API key to store, rotate, or leak. For a tool whose entire thesis is FinOps and guardrails, the integration uses a role, not a secret, which is the same posture it enforces on everything it provisions.",
          "Model access was enabled entirely from the CLI through the Bedrock model-agreement API (use-case form and EULA acceptance), not the console, so the whole enablement path is scriptable and auditable.",
        ],
      },
      {
        num: "/05",
        heading: "Testing",
        paragraphs: [
          "The deterministic pipeline runs and is verifiable with no AWS credentials at all. Unit tests cover the right-sizing engine and the budget gate, the Rego suite proves every deny rule fires, and an offline scenario sweep exercises the burstable, production-hardened, spot, storage, and over-budget paths end to end, each producing a rendered pull request.",
          "The headline request, a Postgres for staging at about 50GB with bursty daytime traffic and no latency sensitivity, resolves to a t4g.micro burstable Graviton instance on gp3 with a nightly auto-stop schedule at about $7.53 a month, and an over-budget production request is blocked by the policy gate until an approval label is attached.",
          "Run live against Bedrock, the same request is driven by the model itself: it calls list_golden_paths, right_size, estimate_cost, check_budget, and submit_for_review in that order, lands on the same t4g.micro plan, and opens the pull request. The tools stay deterministic, so the live path and the offline sweep produce the same artifact.",
        ],
      },
    ],
    stack: ["Claude on Bedrock", "OPA / Rego", "Infracost", "Terraform", "Python", "FastAPI", "GitHub PRs"],
    repo: "https://github.com/jordann6/aws-golden-path-copilot",
    receipt: {
      rows: [
        { k: "Right-size", v: "Bursty non-latency staging Postgres resolved to a t4g.micro burstable Graviton on gp3 with nightly auto-stop, ~$7.53/mo" },
        { k: "Policy", v: "8 Rego tests: every deny rule fires against a fixture, a base-passes case rules out a vacuous gate" },
        { k: "Budget", v: "Over-budget production request BLOCKED; clears only with an explicit approval label" },
        { k: "Bedrock", v: "Live run on Claude Sonnet over Bedrock: the model drove the loop list_golden_paths → right_size → estimate_cost → check_budget → submit_for_review, authenticated over IAM/SigV4 with no API key" },
      ],
      total: { k: "Output", v: "A reviewed pull request, never a direct apply" },
    },
  },
  {
    slug: "multi-region-failover",
    num: "03",
    title: "Multi-Region",
    titleOut: "Failover Manager (AWS)",
    category: "AWS · Platform · SRE",
    lede: "Automated regional disaster recovery that treats failover as two problems on two clocks: DNS shifts traffic in about a minute while orchestration promotes the database behind it, demonstrated live against real AWS and torn down the same night.",
    meta: [
      { k: "Role", v: "Cloud / SRE" },
      { k: "Cloud", v: "AWS" },
      { k: "Regions", v: "us-east-1 + us-west-2" },
      { k: "Resources", v: "70 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Stateless failover is a DNS feature. Stateful failover is not: a cross-region read replica keeps the data close, but something still has to decide the primary is gone and promote the standby to writable. Those two mechanisms run on different clocks, and gating traffic on the slower one extends the outage for no reason.",
          "The goal was a system where traffic shifts in seconds, the database promotes itself in minutes, and the window in between is honest and observable rather than hidden.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "An identical serverless order API (API Gateway v2 and Lambda in private-subnet-only VPCs, no IGW or NAT) runs in us-east-1 and us-west-2 over an RDS PostgreSQL primary with an encrypted cross-region read replica.",
          "A Route 53 health check probes the primary /health endpoint every 10 seconds, and failover routing answers with the standby endpoint the moment it fails, with no automation in the traffic path.",
          "A CloudWatch alarm on the health check metric emits a state change that EventBridge forwards cross-region to the standby bus, where a failover Lambda verifies the replica is promotable, calls PromoteReadReplica idempotently, and publishes what it did to SNS.",
          "Until promotion completes, the standby serves reads and returns an honest 409 on writes, which makes the promotion itself observable as a behavior change rather than a log line.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "Every response component lives in the standby region on purpose: the machinery that answers a regional failure must not depend on the failing region. The health check metric only exists in us-east-1, which is exactly why the alarm's consequences are shipped out of that region immediately.",
          "Credentials live in Secrets Manager with cross-region replication reached through interface endpoints, TLS to PostgreSQL is verified against the RDS CA bundle, and the failover role can promote exactly one ARN. CI gates on Bandit, Checkov, and Trivy, with an OIDC-authenticated plan job and zero static keys.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "Demonstrated live: the primary was broken deliberately, DNS answered with the standby region in about 60 seconds, and the alarm-to-promotion automation fired about 100 seconds after the failure began. The promoted standby then accepted the same write it had correctly refused minutes earlier.",
          "All 70 resources were destroyed the same night, with every leftover check across both regions coming back empty. Total session cost was about a quarter.",
        ],
      },
    ],
    stack: ["Route 53", "RDS PostgreSQL", "Lambda", "EventBridge", "API Gateway v2", "Secrets Manager", "SNS", "Terraform"],
    repo: "https://github.com/jordann6/multi-region-failover-manager",
    receipt: {
      rows: [
        { k: "Provision", v: "70 resources across two regions, RDS primary plus encrypted cross-region replica, all Terraform" },
        { k: "Demo", v: "Primary broken live: DNS flipped in ~60s, alarm-to-promotion automation fired in ~100s" },
        { k: "Proof", v: "Standby returned 409 on writes as a replica, then 201 once promoted" },
        { k: "Destroy", v: "Torn down the same night, all leftover checks empty, zero residual billing" },
      ],
      total: { k: "Session cost", v: "About $0.25" },
    },
  },
  {
    slug: "aws-developer-platform",
    num: "13",
    title: "AWS Developer",
    titleOut: "Platform",
    category: "AWS · Platform",
    lede: "An internal developer platform on EKS that gives application teams a paved road: a one-line claim provisions hardened, policy-compliant AWS infrastructure with no static credentials anywhere.",
    meta: [
      { k: "Role", v: "Platform Eng" },
      { k: "Cloud", v: "AWS" },
      { k: "Control plane", v: "EKS" },
      { k: "IaC", v: "Terraform" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Application teams should not have to hand-write S3 buckets, wire IAM, and remember every hardening checkbox to ship a service. Doing so spreads inconsistent, often insecure infrastructure across an org and makes every new service a bespoke review.",
          "The goal was a paved road: a self-service interface where a developer declares what they need, and the platform returns a real, hardened, policy-compliant resource without ever touching cloud credentials.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "ArgoCD app-of-apps GitOps reconciles every platform component from Git, so the cluster's desired state is version-controlled and auditable.",
          "Crossplane with an IRSA-authenticated AWS provider exposes a self-service Bucket API: a developer's one-line claim provisions a real S3 bucket, no static credentials in the path.",
          "Buckets are hardened by default: AES256 encryption, versioning, all four public-access-block settings, and a mandatory owning-team tag.",
          "Kyverno enforces an owning-team label as an admission policy in flagged namespaces, so non-compliant workloads are rejected at the API server.",
          "A Backstage golden-path template scaffolds a new service with a Dockerfile, a hardened Helm chart, and an ArgoCD Application, GitOps-deployable the moment it exists.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "EKS, the VPC, the OIDC provider, and the scoped IRSA role are all provisioned in Terraform with an S3 remote state backend. Crossplane assumes the IRSA role to act on AWS, which keeps credential material out of pods entirely.",
          "The platform layer (ArgoCD, Crossplane, Kyverno, Backstage) is itself reconciled by GitOps, so the boundary between cluster bootstrap (Terraform) and platform configuration (Git) is explicit.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "A developer's one-line claim yields a production-grade, hardened S3 bucket with zero credential handling and guaranteed tagging for cost attribution and ownership.",
          "Verified end to end against real AWS, then torn down clean, demonstrating the full provision-and-destroy lifecycle rather than a screenshot.",
        ],
      },
    ],
    stack: ["EKS", "ArgoCD", "Crossplane", "Kyverno", "Backstage", "IRSA", "Terraform", "GitOps"],
    repo: "https://github.com/jordann6/aws-developer-platform",
    receipt: {
      rows: [
        { k: "Provision", v: "EKS, VPC, OIDC provider, scoped IRSA role, Terraform with S3 remote state" },
        { k: "Demo", v: "One-line Crossplane claim returned a hardened, tagged S3 bucket with zero credential handling" },
        { k: "Policy", v: "Kyverno admission rejected unlabeled workloads at the API server" },
        { k: "Destroy", v: "Torn down clean after end-to-end verification against real AWS" },
      ],
      total: { k: "Lifecycle", v: "Deploy · Demo · Destroy" },
    },
  },
  {
    slug: "azure-developer-platform",
    num: "14",
    title: "Azure Developer",
    titleOut: "Platform",
    category: "Azure · Platform",
    lede: "The Azure counterpart to the AWS platform, built on a deliberately different toolchain to prove the paved-road pattern is not cloud or tool specific.",
    meta: [
      { k: "Role", v: "Platform Eng" },
      { k: "Cloud", v: "Azure" },
      { k: "Control plane", v: "AKS" },
      { k: "IaC", v: "Terraform" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "A paved-road platform is only convincing if it generalizes. Building one on AWS proves it works once; rebuilding the same developer experience on Azure with a different GitOps and identity stack proves the pattern, not the tooling.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "Flux reconciles the platform from Git via GitRepository, Kustomization, and HelmRelease, the Azure-native counterpart to the AWS app-of-apps model.",
          "Crossplane with an Azure provider, authenticated through Azure Workload Identity, exposes a self-service StorageAccount API.",
          "A claim provisions a real storage account hardened by default: TLS1_2 minimum, HTTPS-only traffic, public blob access disabled, and infrastructure encryption, with no client secrets.",
          "Kyverno enforces owning-team labels as admission policy, identical governance intent to the AWS build.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "AKS with the OIDC issuer and workload identity enabled, plus a federated user-assigned managed identity, is provisioned in Terraform with an Azure Storage state backend.",
          "Workload Identity replaces IRSA as the credential-free bridge between the cluster and the cloud control plane, the key substitution that makes the pattern portable.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "Same developer experience as the AWS platform (one claim, one hardened resource, no secrets) delivered on an entirely different toolchain.",
          "Verified end to end against real Azure, then torn down clean.",
        ],
      },
    ],
    stack: ["AKS", "Flux", "Crossplane", "Workload Identity", "Kyverno", "Terraform", "GitOps"],
    repo: "https://github.com/jordann6/azure-developer-platform",
    receipt: {
      rows: [
        { k: "Provision", v: "AKS with OIDC issuer, workload identity, federated managed identity, Terraform with Azure Storage state" },
        { k: "Demo", v: "StorageAccount claim provisioned hardened storage, TLS 1.2 minimum, no client secrets anywhere" },
        { k: "Policy", v: "Kyverno enforced owning-team labels as admission policy" },
        { k: "Destroy", v: "Torn down clean after end-to-end verification against real Azure" },
      ],
      total: { k: "Lifecycle", v: "Deploy · Demo · Destroy" },
    },
  },
  {
    slug: "aws-incident-responder",
    num: "16",
    title: "Incident",
    titleOut: "Responder (AWS)",
    category: "AWS · Platform · AI",
    lede: "Automated incident response where the runbook is a visual, version-controlled n8n workflow rather than glue code, with an LLM summarizing the incident in plain English.",
    meta: [
      { k: "Role", v: "Cloud / SRE" },
      { k: "Cloud", v: "AWS" },
      { k: "Runtime", v: "ECS Fargate" },
      { k: "Cost", v: "~$1/day" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Incident remediation logic buried in Lambda code is hard to read, hard to change, and invisible to anyone who is not the author. The aim was a runbook that is both automated and legible: a workflow a responder can read, reason about, and version-control.",
          "It is the deliberate counterpart to an earlier Lambda-glued remediation project: same incident class, a visual runbook instead of code.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "A CloudWatch alarm on a target EC2 instance (CPU at or above 80% for two 5-minute periods) publishes to an SNS topic, delivered over HTTPS to n8n.",
          "The workflow confirms its own SNS subscription programmatically, then asks Claude Haiku for a plain-English incident summary and a recommended next step.",
          "It posts an incident card to Slack, reboots the instance via the EC2 API signed with SigV4, then waits and re-checks the alarm with DescribeAlarms to either resolve or escalate.",
          "Remediation runs under a least-privilege IAM user scoped to RebootInstances on the single target ARN plus read-only enrichment.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "n8n runs on ECS Fargate behind an ALB with an ACM certificate on a Route 53 subdomain. Secrets are pulled from SSM SecureString parameters at task start, so nothing sensitive lives in Terraform state.",
          "The whole stack is provisioned in Terraform and built to deploy, demo, and destroy for about a dollar a day.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "A self-healing incident loop that detects, explains, notifies, remediates, and verifies, with the entire decision path visible as a workflow diagram rather than opaque code.",
          "Paired with an Azure counterpart built on Container Apps and Entra service principals to demonstrate the same pattern across clouds.",
        ],
      },
    ],
    stack: ["ECS Fargate", "n8n", "CloudWatch", "SNS", "Claude Haiku", "ALB", "ACM", "Terraform"],
    repo: "https://github.com/jordann6/aws-incident-responder",
    receipt: {
      rows: [
        { k: "Provision", v: "n8n on ECS Fargate behind an ALB with ACM and Route 53, CloudWatch alarm, SNS, all Terraform" },
        { k: "Demo", v: "CPU alarm fired, Claude summarized the incident, Slack card posted, EC2 rebooted via SigV4, alarm re-checked to resolution" },
        { k: "IAM", v: "Remediation scoped to RebootInstances on a single instance ARN" },
        { k: "Destroy", v: "Torn down clean" },
      ],
      total: { k: "Run cost", v: "About a dollar a day" },
    },
  },
  {
    slug: "cost-intelligence-dashboard",
    num: "01",
    title: "Cost Intelligence",
    titleOut: "Dashboard",
    category: "AWS · FinOps",
    lede: "A serverless FinOps platform that detects spend anomalies and forecasts cost before the billing period closes, with least-privilege isolation at every layer.",
    meta: [
      { k: "Role", v: "Cloud / FinOps" },
      { k: "Cloud", v: "AWS" },
      { k: "Resources", v: "34 (Terraform)" },
      { k: "Pattern", v: "Serverless" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Cloud spend surprises arrive after the billing period closes, when it is too late to act. Untagged resources make attribution impossible. The goal was to surface anomalies and a forward forecast early enough to do something about them.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "A Lambda ingester pulls 90 days of Cost Explorer data into a DynamoDB single-table store daily.",
          "It runs z-score anomaly detection per service against a 30-day rolling baseline at a 2.5σ threshold, and generates a 14-day linear regression forecast on aggregate spend.",
          "A second Lambda scans all account resources via the Resource Groups Tagging API and flags missing required tags.",
          "An SNS alert fires on every analysis run that finds outliers; EventBridge Scheduler triggers ingestion at 01:00 UTC and analysis at 02:00 UTC.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "Results are served through an API Gateway HTTP API to a React frontend on S3 behind CloudFront with Origin Access Control.",
          "Three separate IAM execution roles enforce least privilege at each layer: the ingester (ce:GetCostAndUsage, tag:GetResources, DynamoDB write), the analyzer (DynamoDB read/write, SNS publish), and the API (DynamoDB read only).",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "Spend anomalies are flagged before the billing period closes, and tagging gaps surface with the specific missing tag so cost attribution stays reliable.",
          "34 resources provisioned in Terraform with an S3 remote backend and native state locking, deployed via GitHub Actions OIDC.",
        ],
      },
    ],
    stack: ["Lambda", "Cost Explorer", "DynamoDB", "API Gateway", "CloudFront", "React", "EventBridge Scheduler", "Terraform"],
    repo: "https://github.com/jordann6/aws-cost-intelligence-dashboard",
    receipt: {
      rows: [
        { k: "Provision", v: "34 resources in Terraform with S3 remote backend and native state locking" },
        { k: "Demo", v: "Z-score anomaly detection and a 14-day forecast over 90 days of live Cost Explorer data" },
        { k: "IAM", v: "Three execution roles, least privilege at each layer" },
        { k: "Deploy", v: "GitHub Actions OIDC, no static keys" },
      ],
      total: { k: "Stack", v: "Serverless end to end" },
    },
  },
  {
    slug: "cloud-security-lab",
    num: "07",
    title: "Cloud Security",
    titleOut: "Lab",
    category: "AWS · Platform · Security",
    lede: "An end-to-end attack, detect, and respond lab across AWS and Kubernetes, executing a full MITRE ATT&CK kill chain and the detection and response controls that catch it.",
    meta: [
      { k: "Role", v: "Cloud Security" },
      { k: "Cloud", v: "AWS + K8s" },
      { k: "Resources", v: "62 (Terraform)" },
      { k: "Framework", v: "MITRE ATT&CK" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Detection rules are only trustworthy if you have seen them fire against a real attack. This lab builds both sides: an offensive kill chain and the defensive controls that should catch it, so detection efficacy is demonstrated rather than assumed.",
        ],
      },
      {
        num: "/02",
        heading: "Attack",
        bullets: [
          "The full MITRE ATT&CK kill chain is scripted under attack/ so it runs identically every time and always under the leaked credential rather than an admin identity: initial access, permission enumeration, then privilege escalation from 1,039 to 15,319 permissions via policy attachment.",
          "Then S3 exfiltration of staged PII and lateral movement via STS role assumption, with Pacu and ScoutSuite available for deeper manual exploration.",
        ],
      },
      {
        num: "/03",
        heading: "Detect & Respond",
        bullets: [
          "CloudTrail and VPC Flow Logs feed an OpenSearch SIEM with a kill-chain correlation dashboard.",
          "GuardDuty findings on IAM threats trigger an EventBridge rule that fires a Lambda to automatically disable compromised access keys.",
          "On Kubernetes, Falco runs as a DaemonSet catching runtime attacks: shell spawning, sensitive file reads, unauthorized binary execution, and container escape via host mount.",
          "OPA Gatekeeper blocks privileged containers, host namespace access, and root execution across all non-system namespaces.",
        ],
      },
      {
        num: "/04",
        heading: "Detection as Code",
        bullets: [
          "The Gatekeeper admission policies are unit-tested with gator against known-good and known-bad pods, so a broken policy fails CI before it ever reaches a cluster.",
          "CI gates selectively against a codebase that is vulnerable on purpose: the defensive modules are held to a Checkov baseline that blocks new misconfigurations, the intentionally-vulnerable surface is scanned informationally, and secret scanning blocks everywhere.",
          "The exercised techniques are captured as an importable MITRE ATT&CK Navigator layer.",
        ],
      },
      {
        num: "/05",
        heading: "Outcome",
        paragraphs: [
          "A closed loop from exploitation to automated containment, with every control demonstrated against a live, reproducible attack rather than described in the abstract.",
          "62 Terraform resources across 7 modules, deployable and destroyable on demand.",
        ],
      },
    ],
    stack: ["GuardDuty", "OpenSearch", "Falco", "OPA Gatekeeper", "gator", "EventBridge", "Lambda", "Pacu", "Checkov", "Terraform"],
    repo: "https://github.com/jordann6/cloud-security-lab",
    receipt: {
      rows: [
        { k: "Provision", v: "62 Terraform resources across 7 modules, AWS plus Kubernetes" },
        { k: "Attack", v: "Pacu kill chain escalated 1,039 to 15,319 permissions and exfiltrated staged PII" },
        { k: "Detect", v: "Falco caught 100% of simulated runtime attacks, OpenSearch correlated the kill chain" },
        { k: "Respond", v: "GuardDuty finding fired EventBridge, Lambda disabled the compromised key" },
      ],
      total: { k: "Coverage", v: "Attack · Detect · Respond" },
    },
  },
  {
    slug: "multi-agent-coding-orchestrator",
    num: "02",
    title: "Multi-Agent AI",
    titleOut: "Coding Orchestrator",
    category: "AWS · AI",
    lede: "A fully asynchronous multi-agent system that routes natural-language coding tasks to specialist agents, designed around API Gateway's timeout instead of against it.",
    meta: [
      { k: "Role", v: "AI Infra" },
      { k: "Cloud", v: "AWS" },
      { k: "Pattern", v: "Async agents" },
      { k: "Model", v: "Anthropic" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Agentic loops that make sequential model tool-use calls routinely run longer than API Gateway's hard 29-second integration timeout, which breaks any synchronous request/response design.",
          "The system had to return fast, run the loop reliably in the background, and keep blast radius contained between agents.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "The orchestrator returns 202 with a job ID in under two seconds, then the coder Lambda processes the agentic loop independently, writing results to DynamoDB with a 24-hour TTL.",
          "ARN-scoped least-privilege IAM isolates blast radius: the orchestrator can invoke only the coder Lambda, status can only read DynamoDB, and the coder cannot invoke any Lambda at all.",
          "The write_code, explain_code, and debug_code tools are deterministic Python functions returning structured scaffolds and AST metadata, grounding the loop in real code analysis instead of recursive LLM self-talk.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "Three separately sized Lambda packages, Secrets Manager for the Anthropic key, and CloudWatch log groups with 14-day retention, all provisioned in Terraform.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "A resilient async pattern that turns a platform constraint (the 29-second timeout) into the architecture, with grounded tools and tightly scoped permissions per agent.",
        ],
      },
    ],
    stack: ["Lambda", "API Gateway", "DynamoDB", "Anthropic SDK", "Terraform", "Python", "IAM", "Secrets Manager"],
    repo: "https://github.com/jordann6/multi-agent-coding-orchestrator",
    receipt: {
      rows: [
        { k: "Submit", v: "202 and a job ID returned in under two seconds" },
        { k: "Run", v: "Coder Lambda executes the agentic tool-use loop asynchronously" },
        { k: "Store", v: "Results land in DynamoDB with a 24-hour TTL" },
        { k: "IAM", v: "Orchestrator can invoke only the coder, the coder can invoke nothing" },
      ],
      total: { k: "Pattern", v: "Async agentic pipeline" },
    },
  },
  {
    slug: "azure-aks-runtime-security",
    num: "20",
    title: "Azure AKS",
    titleOut: "Runtime Security",
    category: "Azure · Platform · Security",
    lede: "Defense in depth for a running AKS cluster: admission control, runtime detection, and cloud-native container security layered so an attack that evades one is caught by the next, proven end to end against real Azure and torn down the same session.",
    meta: [
      { k: "Role", v: "Cloud Security" },
      { k: "Cloud", v: "Azure + AKS" },
      { k: "Layers", v: "Admission · Runtime · Cloud" },
      { k: "Framework", v: "MITRE ATT&CK" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Kubernetes security is usually pitched as a single control: an admission policy, or a runtime agent, or a cloud scanner. Each one has a gap. Admission control stops a bad pod from being created but sees nothing once a workload is running. A runtime agent watches behavior but cannot prevent the deploy. A cloud scanner knows the control plane and the image supply chain but not the syscalls on the node.",
          "The goal was to run all three on one cluster and show, against live attacks, that the layers overlap: what one misses, the next catches.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "Admission (Kyverno): four Enforce-mode ClusterPolicies reject unsafe pods before they run, blocking privileged containers, host namespaces, hostPath volumes, and containers that do not set runAsNonRoot.",
          "Runtime (Falco): a modern-eBPF DaemonSet with five custom rules, each tagged with a MITRE ATT&CK technique, covering shell spawning, sensitive file reads, container escape via mount, dropped-binary execution, and Azure IMDS credential theft.",
          "Cloud (Defender for Containers): a subscription-level plan wired to the same Log Analytics workspace as AKS diagnostics, adding agentless image CVE scanning and control-plane threat alerts.",
          "Kyverno was chosen over OPA Gatekeeper, used in the AWS cloud-security-lab, specifically to demonstrate range across both dominant Kubernetes policy engines.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "One Terraform stack provisions the resource group, a Log Analytics workspace, and an AKS cluster with the OIDC issuer and workload identity enabled, the Azure Monitor and Defender add-ons attached, and a system-assigned managed identity so no credentials are stored anywhere.",
          "Every Kyverno policy is unit-tested offline with the Kyverno CLI against known-good and known-bad pods, and that test gates CI before any policy is enforced on a cluster. The exercised techniques are also captured as an importable MITRE ATT&CK Navigator layer.",
        ],
      },
      {
        num: "/04",
        heading: "Proving It Live",
        bullets: [
          "A scripted attack driver first applies the vulnerable pod to a policed namespace, where Kyverno denies it with all four policies firing. That is the admission proof.",
          "The same pod then runs in a deliberately exempt break-glass namespace, and the driver executes each attack technique in turn while Falco is tailed.",
          "Against the live cluster Falco caught all five techniques, including the CRITICAL container escape via host mount and the Azure IMDS credential-access rule, confirming the runtime layer catches what the exemption let through.",
          "The deploy surfaced and fixed four real defects (Kubernetes versions aged into LTS-only, a missing namespace exemption, an admission check defeated by shell pipefail, and attack commands that did not match their detection rules), so the repository is reproducible rather than merely plausible.",
        ],
      },
      {
        num: "/05",
        heading: "Outcome",
        paragraphs: [
          "A working defense-in-depth model where prevention and detection are demonstrated against the same attack rather than described in the abstract, on a cluster that was stood up, proven, and destroyed clean with zero residual billing.",
          "The Azure counterpart to the AWS cloud-security-lab, built on a different policy engine and detection stack to show the pattern is not tool specific.",
        ],
      },
    ],
    stack: ["AKS", "Kyverno", "Falco", "Defender for Containers", "Log Analytics", "Workload Identity", "Terraform", "MITRE ATT&CK"],
    repo: "https://github.com/jordann6/azure-aks-runtime-security",
    receipt: {
      rows: [
        { k: "Provision", v: "AKS cluster, Log Analytics, and Defender for Containers via 5 Terraform resources" },
        { k: "Prevent", v: "Kyverno blocked the privileged/hostPath/hostPID pod with all 4 policies firing" },
        { k: "Detect", v: "Falco caught all 5 runtime techniques, including CRITICAL container escape" },
        { k: "Destroy", v: "Torn down clean, Defender plan reverted to Free, zero residual billing" },
      ],
      total: { k: "Model", v: "Prevent · Detect · Verify" },
    },
  },
  {
    slug: "gpu-index-api",
    num: "26",
    title: "GPU Index",
    titleOut: "API (FastAPI)",
    category: "AWS · Backend · Performance",
    lede: "An async FastAPI service where the query plan is the product: two million price observations, a hot path cut 85 percent by making an index match the sort it feeds, and every claim backed by an EXPLAIN plan rather than an assertion.",
    meta: [
      { k: "Role", v: "Backend / Platform" },
      { k: "Cloud", v: "AWS" },
      { k: "Dataset", v: "2M rows, 385 MB" },
      { k: "Coverage", v: "41 tests, 95%" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "GPU capacity is priced differently by every provider, in every region, and changes hourly. Answering the only question that matters, which is where a given accelerator is cheapest right now and how that compares to its recent trend, means reading the latest observation per provider and region out of a table where most rows are history.",
          "That is a query-planning problem, not an endpoint problem. At a few thousand rows every plan looks fine and proves nothing, so the dataset was built to two million observations across twenty-six accelerators, ten providers, and twenty regions specifically so the indexing decisions would have consequences worth measuring.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "FastAPI with Pydantic v2 and SQLAlchemy 2.0 async over asyncpg, with the session, cache client, and authenticated principal all provided as dependencies so tests can swap them through dependency_overrides.",
          "The hot path uses DISTINCT ON rather than a ROW_NUMBER window function: the window version sorts the full filtered set before discarding rows, while DISTINCT ON consumes index order and stops at the first row per group.",
          "Redis serves both a read-through cache and a per-key token bucket, and both fail open. A Redis outage degrades to a direct database read rather than taking the API down, because availability is worth more than hit ratio or perfect throttling.",
          "Ingestion fans out across provider feeds under a bounded semaphore with return_exceptions, so one feed returning garbage cannot sink the run and a wide provider list cannot exhaust the connection pool.",
        ],
      },
      {
        num: "/03",
        heading: "The Tuning",
        paragraphs: [
          "The baseline hot query ran 166.6ms and read 43,215 heap blocks. The first attempt at an index barely moved it, 4 percent, and the plan explained why: the index led with region while the DISTINCT ON ordered by provider_id, so Postgres sorted 54,000 rows to disk anyway, and neither branch of the plan carried its selected columns so both fell back to heap fetches.",
          "Fixing both took the query to 23.8ms, an 85.5 percent cut, with heap blocks down to 1,198 and Heap Fetches at zero on both branches. Matching the index column order to the sort it feeds removed the sort entirely; carrying the selected columns in INCLUDE made the scans index-only.",
          "The most useful finding was a negative one. A partial index on availability measured worse than a covering index, because the API passes availability as a bind parameter and the planner cannot prove a partial predicate holds for a value it does not yet know. The index-ranking endpoint does use a partial index, since there the filter is a literal. Same technique, opposite verdict, decided by measurement.",
        ],
      },
      {
        num: "/04",
        heading: "Measuring Honestly",
        bullets: [
          "Planner cost settings are applied to both the before and after runs, so the reported delta isolates the indexes rather than mixing in the cost-model change. Left at the default random_page_cost of 4.0, Postgres assumes spinning-disk seeks and rejects the index-only scan even once the index exists.",
          "Keyset pagination replaces OFFSET, measured at depth fifty thousand: 3.4ms versus 0.7ms. OFFSET walks and discards every preceding row no matter what indexes exist, so its cost grows with depth by construction.",
          "The first load test reported a healthy-looking p95 computed over 13,461 rate-limited errors. The harness now fails its own run above a one percent error rate, because a flattering percentile measured on rejected requests is worse than no number at all.",
          "Corrected, the service sustains 1,114 requests per second at a p50 of 6.8ms and a p95 of 8.3ms with zero errors and a 99.7 percent cache hit ratio. At concurrency 20 against two workers the p95 rises to 126ms, which is queue time, not query time, and is reported alongside rather than omitted.",
        ],
      },
      {
        num: "/05",
        heading: "What Deploying Caught",
        bullets: [
          "RDS no longer offers PostgreSQL 16.4, so the first apply failed outright and the version was pinned forward.",
          "The seed script crashed in the container with ModuleNotFoundError. Python puts the script's directory on sys.path, not the working directory, and the API never hit it because uvicorn adds cwd. Only a real deployment surfaces that class of bug.",
          "The tuning indexes lived in the tuning script rather than the schema, so the cloud hot path sat at 170ms until they were applied out of band. They now live in an Alembic migration with the DDL defined once and imported by both the migration and the tuning script, so a measured index can never be missing from a deployment.",
          "Coverage read 77 percent until the report was corrected: SQLAlchemy runs async code inside greenlets that coverage does not trace by default, so every line after an await on the session appeared unhit.",
        ],
      },
      {
        num: "/06",
        heading: "Outcome",
        paragraphs: [
          "A service whose performance claims are reproducible rather than asserted: one command regenerates the tuning document with full EXPLAIN plans, and the numbers in the README are the numbers that command produces.",
          "Deployed to ECS Fargate behind an ALB with RDS and ElastiCache, verified live with ten smoke tests including that an unauthenticated request is refused, then destroyed clean. Deliberately no NAT Gateway, which would have been the largest line item and the resource most likely to survive a partial teardown.",
        ],
      },
    ],
    stack: ["FastAPI", "Pydantic v2", "SQLAlchemy async", "asyncpg", "PostgreSQL", "Redis", "ECS Fargate", "Alembic", "Terraform"],
    repo: "https://github.com/jordann6/gpu-index-api",
    receipt: {
      rows: [
        { k: "Provision", v: "31 Terraform resources: ECS Fargate, RDS, ElastiCache, ALB, ECR, $10 budget" },
        { k: "Tune", v: "Hot query 166.6ms to 23.8ms (85.5%), heap blocks 43,215 to 1,198" },
        { k: "Prove", v: "1,114 req/s at p95 8.3ms, zero errors, 10/10 live smoke tests passed" },
        { k: "Destroy", v: "All 31 destroyed, no orphans, no final snapshot, zero residual billing" },
      ],
      total: { k: "Cost", v: "~$0.20 for the demo window" },
    },
  },
  {
    slug: "secrets-lifecycle",
    num: "27",
    title: "Secrets Lifecycle",
    titleOut: "& Rotation Readiness",
    category: "AWS · Security · Platform",
    lede: "Governance tooling that answers the question AWS Config cannot: not whether a secret is stale, but why nobody rotated it. Dependency analysis over CloudTrail turns rotation from an outage gamble into an ordered runbook, with auditor-ready evidence produced on the way out.",
    meta: [
      { k: "Role", v: "Cloud Security / Platform" },
      { k: "Cloud", v: "AWS" },
      { k: "Languages", v: "Go + Python" },
      { k: "Resources", v: "40 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Staleness detection is a solved problem: AWS Config will happily tell you a secret is 400 days old. What it cannot tell you is which workloads read that secret, which is the only question that matters when someone proposes rotating it. Without a consumer map, every rotation is an outage gamble, so the rational move for every individual team is to not rotate, and the fleet ages indefinitely.",
          "The goal was a platform that identifies the consumers of every secret from observed access rather than assumptions, scores how safely each secret could be rotated today, and hands the operator an ordered runbook instead of a finding.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "A Go scanner Lambda sweeps Secrets Manager, SSM SecureString parameters, and IAM access keys through a bounded goroutine worker pool, multi-account capable via assumed roles, writing normalized records to DynamoDB.",
          "A Python analyzer queries 90 days of CloudTrail through Athena (partition projection, no MSCK repair) for GetSecretValue and GetParameter events, building a consumer map per secret: which principals read it, how often, and how recently.",
          "The consumer map drives a rotation readiness score combining age, consumer count, consumer identifiability, and rotation configuration, and Claude on Bedrock synthesizes an ordered runbook with rollback path and confidence level for the highest-risk secrets, prompted for strict JSON and validated on parse, with a deterministic rule-based fallback when the model is unavailable.",
          "Every finding maps to HIPAA 164.308(a)(5)(ii)(D), SOC 2 CC6.1, NIST 800-53 IA-5, and CIS 1.14 from a versioned config file, lands in a versioned S3 bucket with Object Lock in governance mode, and imports to Security Hub as ASFF findings.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "The defining constraint is that a tool inspecting every secret in the account must be provably unable to read any of them. The scanner and analyzer roles carry an explicit IAM deny on GetSecretValue and GetParameter, so metadata access cannot escalate even if a broader policy is ever attached. The first version denied kms:Decrypt outright, which broke Lambda's own environment variable decryption at cold start; the fix scopes the deny with kms:ViaService to Secrets Manager and SSM, keeping the guarantee without breaking the runtime. A redaction layer scrubs anything resembling key material before data reaches logs, DynamoDB, or Bedrock, as defense in depth on top of never fetching values.",
          "The pipeline is chained with Lambda on-success destinations rather than Step Functions: EventBridge fires the scanner asynchronously, and scanner, analyzer, and reporter pass the scan ID through their response payloads. Each function gets its own least-privilege role, and the evidence bucket accepts writes only from the analyzer.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "Verified live end to end against a seeded environment of 15 test secrets with real consumer Lambdas and a working rotation function: 17 resources scanned in about a second, consumers identified for 53 percent of secrets down to the exact Lambda execution roles and read counts, 5 rotation runbooks generated, and 31 control-mapped findings imported to Security Hub with evidence artifacts locked in S3.",
          "All 40 Terraform resources were destroyed the same day, including a governance-retention bypass sweep of the evidence bucket, with the account verified clean of every secops-prefixed resource and Security Hub returned to its unsubscribed state.",
        ],
      },
    ],
    stack: ["Go", "Python", "Lambda", "CloudTrail", "Athena", "DynamoDB", "Amazon Bedrock", "Security Hub", "S3 Object Lock", "EventBridge", "Terraform"],
    repo: "https://github.com/jordann6/aws-secrets-lifecycle",
    receipt: {
      rows: [
        { k: "Provision", v: "40 Terraform resources across 8 modules, plus a seeded test environment of 15 secrets with live consumers" },
        { k: "Demo", v: "17 resources scanned in ~1s; consumer maps resolved from CloudTrail to exact execution roles and read counts" },
        { k: "Proof", v: "5 runbooks generated, 31 ASFF findings in Security Hub, evidence artifact under governance-mode Object Lock" },
        { k: "Destroy", v: "Governance bypass sweep, then full teardown same day; account verified clean, Security Hub unsubscribed" },
      ],
      total: { k: "Cost", v: "under $1 for the full build-demo-destroy session" },
    },
  },
  {
    slug: "azure-finops-dashboard",
    num: "04",
    title: "Azure FinOps",
    titleOut: "Dashboard",
    category: "Azure · FinOps",
    lede: "Cost visibility that answers the question a bill cannot: not what you spent, but which resource changed behavior and what it will cost you next. Statistical anomaly detection and trend forecasting over the Cost Management API, written in C# and running credential-free.",
    meta: [
      { k: "Role", v: "Cloud / FinOps" },
      { k: "Cloud", v: "Azure" },
      { k: "Language", v: "C# .NET 8" },
      { k: "Modules", v: "3 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "A cloud bill tells you what you spent after you have already spent it, aggregated to a level where nothing is actionable. By the time a runaway resource shows up as a line item, it has been running for most of a billing cycle, and the person who could have caught it has no signal that anything changed.",
          "The three questions worth answering are earlier and more specific: which resources are behaving differently than they did last month, where is spend heading if nothing changes, and which resources cannot even be attributed to an owner because nobody tagged them.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "A timer-triggered Function ingests the previous seven days of actual cost from the Cost Management REST API each morning, grouped by resource, resource type, and resource group, upserting into Cosmos DB keyed by resource ID so re-runs are idempotent.",
          "Anomaly detection runs half an hour later against the stored history: a rolling 30-day mean and standard deviation per resource, flagging any resource whose latest daily cost exceeds two sigma, tiered Low at 2.0, Medium at 2.5, and High at 3.0.",
          "Forecasting runs after that, projecting 14 days on a linear trend over the trailing 30-day window with confidence intervals derived from historical variance, and refuses to project at all on fewer than seven days of data rather than emitting a number nobody should trust.",
          "A tag hygiene pass evaluates every subscription resource against a required-tag policy and reports both a compliance percentage and the specific resources missing specific tags, because a percentage alone is not something anyone can act on.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "Five HTTP-triggered Functions expose the stored results as a REST API to a React single-page app on Static Web Apps, so the read path never touches the Cost Management API and page loads are not gated on an upstream call. The four Cosmos containers separate daily costs, anomalies, forecasts, and budgets, which keeps the analysis jobs from contending with the read path.",
          "The whole thing runs without a stored credential. The Function App uses a system-assigned managed identity with exactly three role assignments: Cost Management Reader and Reader at subscription scope for cost and resource metadata, and Cosmos DB Built-in Data Contributor at database scope for the data plane. Key-based access to Cosmos is disabled at the account level, so even a leaked connection string would be inert. Three reusable Terraform modules compose into a dev environment with remote state in Azure Storage.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "A cost pipeline where every number on the dashboard is traceable to a stored record and a stated method: the anomaly tiers are a sigma threshold rather than a heuristic, and the forecast declares its own confidence bounds and refuses to run on thin data.",
          "The FinOps counterpart on the AWS side is the Cost Intelligence Dashboard, which applies the same z-score and regression approach to Cost Explorer. Running the same method across both clouds is what makes the practice portable rather than a single-provider trick.",
        ],
      },
    ],
    stack: ["Azure Functions", "C# .NET 8", "Cosmos DB", "Cost Management API", "Static Web Apps", "React", "Application Insights", "Terraform"],
    repo: "https://github.com/jordann6/azure-finops-dashboard",
  },
  {
    slug: "aws-landing-zone-automator",
    num: "19",
    title: "AWS Landing Zone",
    titleOut: "Automator",
    category: "AWS · Platform · Governance",
    lede: "An account vending machine for the gap between one shared account with a root login and a platform team running Control Tower. One apply stands up a SOC 2 ready multi-account foundation; after that a new account is one block in a tfvars file and it arrives with guardrails, logging, budgets, and SSO already applied.",
    meta: [
      { k: "Role", v: "Cloud / Platform" },
      { k: "Cloud", v: "AWS" },
      { k: "Scope", v: "Organization-wide" },
      { k: "Resources", v: "58 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Multi-account AWS is the recommendation everyone gives and almost nobody implements, because the first account separation is where the work actually is: organizational units, service control policies, centralized immutable audit logging, and single sign-on all have to exist before the second account is worth having.",
          "The target was the middle of that gap. Startups getting SOC 2 ready need account separation, immutable audit logs, least-privilege SSO, and root controls, which is most of what an auditor asks about first. SaaS teams need dev, staging, and prod per product. MSPs need a client to land inside guardrails on day one. All three are the same recurring workflow, not a one-time script.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "Organizations with all features enabled, and an OU tree of Security, Workloads/Prod, Workloads/NonProd, and Sandbox, so policy attaches to a boundary rather than to individual accounts.",
          "Four service control policies as the guardrail layer: deny root user actions, deny leaving the organization, a region allowlist, and CloudTrail tamper protection.",
          "An organization CloudTrail encrypted with SSE-KMS writing into a versioned, object-locked bucket in a dedicated log-archive account, so the audit trail is outside the accounts it is auditing and cannot be rewritten by them.",
          "Vending itself is an `account_requests` map: each entry creates an account in the right OU with tags, a monthly budget alarm at 80 percent, and an in-account baseline that sets an IAM alias, a strict password policy, a smoke-test role, and removes the default VPC.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "The apply runs in two stages, and the reason is a real Terraform constraint rather than a workaround. Provider configurations are static and must resolve at plan time, but the aliased providers that assume roles into the log-archive and vended accounts need account IDs that do not exist until the first stage finishes. A helper script copies those IDs from stage one outputs into a gitignored tfvars file, and the second apply completes the cross-account wiring.",
          "Nothing sensitive reaches the repository. Account emails, notification addresses, and account IDs live only in gitignored tfvars and remote state, outputs carrying account IDs are marked sensitive, the state bucket name is passed through a gitignored backend config, and CI authenticates with GitHub OIDC against the committed example file only.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "Deployed live against a real organization and validated on six independent checks: an SCP explicitly denying a disallowed region, per-account organization CloudTrail delivery, least-privilege SSO assignment, budget alarms, tag and OU placement, and zero default VPCs in the vended accounts.",
          "Teardown taught more than the build. Closed accounts block OU deletion until they are moved back to the root, the account-close waiter finishes a minute or so before AWS actually settles, and the SSO assignment loop needs the account request map emptied before the final destroy pass will complete. All three are documented in the repo, because the teardown path is the part of a landing zone nobody writes down.",
        ],
      },
    ],
    stack: ["AWS Organizations", "Service Control Policies", "IAM Identity Center", "CloudTrail", "KMS", "S3 Object Lock", "AWS Budgets", "Terraform"],
    repo: "https://github.com/jordann6/landing-zone-automator",
    receipt: {
      rows: [
        { k: "Provision", v: "58 resources against a real organization: OUs, 4 SCPs, Identity Center, org CloudTrail, vended accounts" },
        { k: "Validate", v: "6 of 6 checks passed, including an SCP-denied region and zero default VPCs in vended accounts" },
        { k: "Destroy", v: "Torn down the same night, state at zero, only the default FullAWSAccess SCP remaining" },
        { k: "Residual", v: "Trail KMS key in its mandatory 7-day deletion window, unbilled" },
      ],
      total: { k: "Cost", v: "a few cents for the full deploy-demo-destroy cycle" },
    },
  },
  {
    slug: "azure-landing-zone",
    num: "15",
    title: "Azure Landing",
    titleOut: "Zone",
    category: "Azure · Platform · Governance",
    lede: "The governance foundation a workload subscription inherits before anyone deploys into it: a management group hierarchy, policy as code, and a hub-spoke network whose spokes are vended by a single module call.",
    meta: [
      { k: "Role", v: "Cloud / Platform" },
      { k: "Cloud", v: "Azure" },
      { k: "Hierarchy", v: "4 levels" },
      { k: "Resources", v: "24 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Governance applied after workloads exist is negotiation. Governance applied to a management group before the first subscription lands there is just the environment. The distinction decides whether a policy is a guardrail or a ticket.",
          "The goal was the smallest complete Azure foundation that a workload subscription could be dropped into and immediately inherit: a hierarchy that policy can attach to, a network with room for the services it will eventually need, and a repeatable way to add the next spoke.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "A four-level management group tree under the tenant root, splitting Platform, Workloads, and Sandbox, with the subscription moved into Workloads so all policy assignments apply to everything in it automatically.",
          "Three custom Azure Policy definitions authored and assigned at the Workloads scope: require an owner tag, deny public IP creation, and restrict resources to allowed locations.",
          "A hub VNet at 10.0.0.0/16 carrying reserved subnets for Firewall, Gateway, and Bastion alongside an active management subnet whose NSG blocks inbound internet.",
          "Two spokes, Platform and Sandbox, each peered bidirectionally with the hub, provisioned through a reusable module so a third spoke is one block.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "The reserved subnets are the detail that matters most and costs nothing. Azure Firewall, VPN and ExpressRoute Gateway, and Bastion each require an exactly-named subnet at a minimum prefix size, so those subnets are carved and named correctly up front even though none of the services are deployed. Activating any of them later is a resource addition rather than a re-addressing exercise across every peered network, which is the expensive version of that mistake.",
          "Policy effects are set to Audit for the demo deployment rather than Deny. That is a deliberate choice worth stating plainly: in a production pipeline these become Deny and run as a separate governance stage ahead of workload provisioning, but a Deny effect in a demo environment blocks the very resources the demo needs to create.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "Deployed against a real Azure tenant and verified through the control plane rather than the plan file: the management group hierarchy, the subscription's placement under Workloads, the policy assignments at that scope, and both peering directions reporting Connected.",
          "Then destroyed clean, with the subscription automatically re-associating to the tenant root group. The whole environment carries no VMs, no Firewall, no Bastion, and no Gateway, so the cost of standing it up and tearing it down repeatedly is effectively nothing, which is what makes it usable as a reference rather than a one-time demo.",
        ],
      },
    ],
    stack: ["Azure Management Groups", "Azure Policy", "Hub-Spoke VNet", "VNet Peering", "NSG", "Terraform"],
    repo: "https://github.com/jordann6/azure-landing-zone",
    receipt: {
      rows: [
        { k: "Provision", v: "24 Terraform resources: 4-level management group tree, 3 policy definitions and assignments, hub plus 2 peered spokes" },
        { k: "Verify", v: "Hierarchy, subscription placement, policy assignments, and both peering directions confirmed via the Azure control plane" },
        { k: "Destroy", v: "Torn down clean; subscription auto-reassociated to the tenant root group" },
      ],
      total: { k: "Cost", v: "effectively zero, no VMs, Firewall, Bastion, or Gateway" },
    },
  },
  {
    slug: "aws-serverless-lakehouse",
    num: "23",
    title: "Serverless",
    titleOut: "Lakehouse",
    category: "AWS · Data Platform",
    lede: "A CSV lands in a raw zone, a crawler infers its schema, and Athena rewrites it as columnar Parquet in a curated zone. The interesting part is not the pipeline, it is the measurement: the same query against curated data scans 156 bytes where the raw version scans 2.09 megabytes.",
    meta: [
      { k: "Role", v: "Data Platform" },
      { k: "Cloud", v: "AWS" },
      { k: "Dataset", v: "50k rows" },
      { k: "Resources", v: "12 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "The argument for a curated zone is usually made in the abstract. Columnar storage is cheaper to scan, compression helps, everyone agrees, and nobody measures it on their own data, so the curated layer gets justified as a best practice rather than as a number.",
          "The goal here was to build the smallest honest version of the pattern and then instrument the claim, so the economic case for the curated zone is a measurement the validator reproduces rather than an assertion in a README.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "One S3 bucket split by prefix into three zones: raw for CSV exactly as produced upstream, curated for Snappy-compressed Parquet, and a scratch prefix for Athena query output expired after seven days by a lifecycle rule so it cannot quietly accumulate cost.",
          "A Glue crawler infers the raw schema into the Data Catalog, so there is no hand-written DDL tracking a shape the crawler can discover.",
          "Athena reads the raw table and writes the curated table with a CTAS statement, which makes the curated schema an explicit contract rather than an inferred one.",
          "A deterministic 50,000-row synthetic orders generator seeded at 42, so the demo produces the same dataset and therefore the same measured numbers on every run.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "The design rule is crawl what you do not control, declare what you do. The raw zone changes shape whenever an upstream system changes, so letting a crawler own its schema means the catalog tracks reality instead of drifting from a hand-maintained definition. The curated zone is the opposite case: its schema is a contract the transform defines, so CTAS states it explicitly.",
          "Splitting the zones by prefix rather than by bucket is a deliberate call for demo infrastructure: one lifecycle policy, one thing to empty at teardown, and a destroy that actually completes because the bucket empties itself.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "The validator runs five checks covering catalog registration, Parquet output, row reconciliation between zones, and the scan-cost claim itself. The same count and sum query scans 156 bytes against curated Parquet versus 2.09 megabytes against raw CSV, which is the entire economic argument for the curated zone expressed as a measurement rather than a principle.",
          "Nothing runs between demos. There is no NAT gateway, no cluster, and no warehouse endpoint, so the idle cost is storage for a small dataset and the full deploy-demo-destroy session lands well under a quarter.",
        ],
      },
    ],
    stack: ["S3", "Glue Data Catalog", "Glue Crawler", "Athena CTAS", "Parquet", "IAM", "Terraform"],
    repo: "https://github.com/jordann6/aws-serverless-lakehouse",
    receipt: {
      rows: [
        { k: "Provision", v: "12 Terraform resources: 3-zone S3 lake, Glue catalog and crawler, Athena workgroup, scoped IAM" },
        { k: "Demo", v: "50,000-row deterministic CSV landed, crawled, and rewritten to Snappy Parquet via CTAS" },
        { k: "Prove", v: "Same query scans 156 B curated vs 2.09 MB raw; 5 of 5 validator checks passed" },
        { k: "Destroy", v: "Bucket force-emptied, catalog, crawler, and workgroup removed, nothing left running" },
      ],
      total: { k: "Cost", v: "well under $0.25 for the full session" },
    },
  },
  {
    slug: "dbt-analytics-athena",
    num: "24",
    title: "dbt Analytics",
    titleOut: "Engineering",
    category: "AWS · Data Platform",
    lede: "The analytics engineering layer on top of a serverless lake: transformations are versioned code, twelve tests gate every build, and one command reconciles the warehouse to them. Including a test that fails the build if gold revenue stops matching silver to the cent.",
    meta: [
      { k: "Role", v: "Analytics Engineering" },
      { k: "Cloud", v: "AWS" },
      { k: "Tests", v: "12, gating every build" },
      { k: "Resources", v: "7 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Ad-hoc SQL against a lake produces numbers nobody can reproduce and nobody can defend. The transformation lives in someone's query history, its correctness is assumed, and a change that silently drops or double-counts rows surfaces as a dashboard that looks plausible and is wrong.",
          "The alternative worth demonstrating is that both the transformations and their correctness checks are versioned code, and that a single command brings the warehouse to that state or fails loudly.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "A dbt project on the dbt-athena adapter over bronze, silver, and gold layers, with Terraform provisioning the S3 lake, the Glue schema dbt materializes into, and the Athena workgroup.",
          "Bronze is a raw orders seed loaded into the catalog as-is. Silver is a view that types and cleans it: order dates cast to real dates, rows with non-positive quantity or price dropped, and a computed line total the marts can rely on.",
          "Gold is two Parquet marts a dashboard reads directly, revenue and counts by category and country, and one row per day with average order value.",
          "Twelve tests run on every build: uniqueness and not-null on the keys, accepted values on category and country, not-null on the gold revenue and count columns, and a singular reconciliation test.",
        ],
      },
      {
        num: "/03",
        heading: "Architecture",
        paragraphs: [
          "Staging is a cheap view over raw while the marts are materialized as Snappy Parquet, so downstream queries scan compressed columnar data instead of re-reading the seed on every dashboard load. That split is the whole reason to have a silver layer that is not itself materialized.",
          "The test that earns its place is the singular one: it asserts that total revenue in the gold category mart reconciles to total line total in silver to the cent. Schema tests catch a column going null; only a reconciliation test catches a join that silently duplicates rows, which is the failure mode that actually reaches dashboards. CI compiles the model DAG on every push, so a broken reference fails before it reaches a warehouse.",
        ],
      },
      {
        num: "/04",
        heading: "Outcome",
        paragraphs: [
          "A warehouse where the transformations are reviewable in a pull request and the correctness checks run as a gate rather than as a follow-up. A transform that drops or double-counts rows fails the build instead of shipping bad numbers.",
          "Deployed and demoed against real AWS on a deterministic seed, validated straight against Athena without dbt in the loop as an independent check, then destroyed. No warehouse endpoint, no cluster, no NAT, so nothing accrues while idle.",
        ],
      },
    ],
    stack: ["dbt", "dbt-athena", "Athena", "Glue Data Catalog", "S3", "Parquet", "GitHub Actions", "Terraform"],
    repo: "https://github.com/jordann6/aws-lakehouse-dbt",
    receipt: {
      rows: [
        { k: "Provision", v: "7 Terraform resources: S3 lake, Glue database, Athena workgroup" },
        { k: "Build", v: "Deterministic 5,000-row seed through bronze, silver view, and two Parquet gold marts" },
        { k: "Prove", v: "12 of 12 data tests passed, including silver-to-gold revenue reconciliation to the cent" },
        { k: "Destroy", v: "Bucket force-emptied, Glue schema and workgroup removed, nothing left running" },
      ],
      total: { k: "Cost", v: "well under $0.25 for the full session" },
    },
  },
  {
    slug: "azure-secrets-lifecycle",
    num: "28",
    title: "Azure Secrets",
    titleOut: "Lifecycle & Rotation",
    category: "Azure \u00b7 Security \u00b7 Platform",
    lede: "The same problem solved a second time on a different cloud, in Ruby on Rails, where the interesting part is not the port but the places Azure refuses to work the way AWS does. The platform proves its own least-privilege claim against the live cloud instead of asserting it in a README.",
    meta: [
      { k: "Role", v: "Cloud Security / Platform" },
      { k: "Cloud", v: "Azure" },
      { k: "Language", v: "Ruby on Rails 8" },
      { k: "Resources", v: "45 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Azure Policy and Defender for Cloud will both tell you a Key Vault secret has no expiry date. Neither tells you which workloads read it, which is the only question that matters when someone proposes rotating it. Without a consumer map the rational move for every individual team is to not rotate, and the fleet ages indefinitely.",
          "The second goal was harder than the first: port the idea, not the code, and refuse to paper over the places the two clouds genuinely differ. A find-and-replace of Secrets Manager for Key Vault would have produced something that looked finished and taught nothing.",
        ],
      },
      {
        num: "/02",
        heading: "Where Azure is better, and where it is worse",
        paragraphs: [
          "The consumer map is the clear win. On AWS the same question needs CloudTrail delivering to S3, a Glue table with partition projection, and an Athena workgroup before a single row is readable. Azure diagnostic settings put Key Vault audit events into a workspace that is already queryable, so the entire dependency analysis collapses to one KQL query against a typed table.",
          "The security model is the clear loss. AWS can express an explicit IAM deny on GetSecretValue; Azure has no equivalent outside deny assignments, which are only creatable through managed applications and Blueprints. The honest Azure answer is a role that never granted the permission: Key Vault Reader carries secrets/readMetadata/action and vaults/*/read but not getSecret/action. A custom Azure Policy then audits any role assignment that would widen it, because the control is now the absence of a grant rather than the presence of a deny.",
          "App Configuration is the weak spot and it is stated as one. App Configuration Data Reader is the narrowest built-in role and it does return values, so the guarantee there downgrades from the role making it impossible to the request never asking, enforced with $select and a redaction layer. The structural fix is the Key Vault reference pattern, and the seeded estate includes one so the difference is visible on the dashboard rather than buried in a README.",
        ],
      },
      {
        num: "/03",
        heading: "Readiness is not risk",
        paragraphs: [
          "A secret that is nine months old and read by nothing is dangerous to keep and trivial to rotate. A secret that is thirty days old and read by eleven principals nobody can name is the opposite. Collapsing both into one risk number is what produces backlogs nobody works, so readiness answers a single question: how safely could this be rotated today.",
          "The Azure scoring adds two dimensions the AWS version had no analogue for. Expiry state, because Key Vault objects carry an exp attribute that near-expiry automation keys off and CIS requires. And the vault authorization model, because on an access policy vault the resource names its own readers, while on an RBAC vault it does not, so if the audit log is silent too there is no evidence of the consumer set from either direction. That case is scored down explicitly rather than being allowed to look safe.",
        ],
      },
      {
        num: "/04",
        heading: "No stored credential, anywhere",
        paragraphs: [
          "A platform that reports on static credentials should not be holding one. Azure OpenAI runs with local authentication disabled, the storage account with shared key access disabled, and the container registry with the admin account off, so no API key exists in the deployment at all.",
          "The database was the interesting case. Keeping a Postgres password in Key Vault would have meant granting the application the exact data plane read permission the rest of the design spends its effort avoiding. Instead password authentication is disabled outright and the app authenticates with an Entra access token minted per connection, hooked into the adapter's client construction so a reconnect after a pool reap gets a fresh one.",
        ],
      },
      {
        num: "/05",
        heading: "Proving it instead of claiming it",
        paragraphs: [
          "A role definition in Terraform is evidence of intent, not of outcome. Roles get widened by someone debugging at 2am, inherited from a management group, or shadowed by a second assignment, and the README goes on claiming a guarantee that stopped being true.",
          "So the platform verifies itself. A dedicated job runs ten checks against the live cloud from inside the platform identity and asserts both directions: that metadata reads work, and that the things that must fail actually fail. It exits non-zero on any regression, so a widened role assignment fails the build rather than quietly invalidating the security story.",
        ],
        bullets: [
          "key_vault.list_secrets \u2014 PASS, 13 secrets listed, values absent from the payload",
          "key_vault.certificate_policy \u2014 PASS, the read that certificate auto-renew detection depends on",
          "key_vault.get_secret_value \u2014 PASS, DENIED with 403: Key Vault Reader carries no getSecret action",
          "app_config.list_no_value \u2014 PASS, 5 key values listed with the value field withheld by $select",
          "evidence.overwrite_denied \u2014 PASS, blocked with 409 by the time based immutability policy",
        ],
      },
      {
        num: "/06",
        heading: "What broke on contact with the cloud",
        paragraphs: [
          "Roughly a dozen things worked locally and failed in Azure, which is the point of deploying rather than declaring done. Listing an OpenAI model does not mean it can be deployed: the API returns models in a Deprecating lifecycle state that the deployment endpoint refuses, and quota can be batch-only, so the check is lifecycle status and GlobalStandard quota together.",
          "An IP allow list cannot gate a Container Apps consumption workload at all. The environment static IP is not the address Key Vault sees, and real egress comes from a shared regional pool that is neither exposed nor stable, so RBAC is the only control that holds without a VNet and a NAT gateway. The platform consequently reports its own vault as failing CIS Azure 8.7 on every scan, which is left visible rather than suppressed.",
          "The rest were the kind of thing no amount of local testing finds: the Logs Ingestion API authorizes against the data collection rule rather than the workspace and needs Monitoring Metrics Publisher scoped to it; bulk insert writes NULL rather than applying column defaults when a row omits a key, which took down a whole scan; diagnostic settings take minutes to become effective and audit events generated before that are lost permanently; and a bare if key inside jsonencode breaks the HCL2 parser so Checkov silently skipped an entire module rather than reporting anything.",
        ],
      },
      {
        num: "/07",
        heading: "Verified, then destroyed",
        paragraphs: [
          "Two full deploy, demo, destroy cycles against a live subscription. The scan swept 25 resources in 4.4 seconds with zero sweep errors across all four kinds, built consumer maps from real Key Vault audit rows, produced 71 findings across 8 control frameworks, and generated 5 rotation runbooks from the model rather than the deterministic fallback.",
          "Deleting an evidence artifact fails with BlobImmutableDueToPolicy, and all 71 findings are queryable in the Sentinel custom table by control. Everything was then torn down, with the subscription verified clean of every secops-prefixed resource, the Entra app registration removed, and the policy definition and assignment gone. The only survivor is the soft-deleted Key Vault that purge protection keeps by design, which bills nothing and expires on its own.",
        ],
      },
    ],
    stack: ["Ruby on Rails 8", "Container Apps", "Key Vault", "App Configuration", "Entra ID", "Log Analytics KQL", "Azure OpenAI", "Microsoft Sentinel", "PostgreSQL Flexible Server", "Blob immutability", "Terraform"],
    repo: "https://github.com/jordann6/azure-secrets-lifecycle",
    receipt: {
      rows: [
        { k: "Provision", v: "45 Terraform resources across 8 modules, plus a seeded estate of 13 secrets, 3 certificates, 5 App Configuration keys, and an Entra app credential" },
        { k: "Demo", v: "25 resources swept in 4.4s with zero sweep errors; consumer maps built from real Key Vault audit rows" },
        { k: "Proof", v: "10/10 posture checks including secret read DENIED 403 and evidence overwrite DENIED 409; 71 findings across 8 controls; 5 model-generated runbooks; 71 rows in Sentinel" },
        { k: "Destroy", v: "Full teardown across two cycles; subscription verified clean, Entra app and policy definition removed" },
      ],
      total: { k: "Cost", v: "about $3 for the full build-demo-destroy session" },
    },
  },
  {
    slug: "gcp-workload-identity-federation",
    num: "29",
    title: "Workload Identity",
    titleOut: "Federation (GCP)",
    category: "GCP · Platform · Security",
    lede: "CI that authenticates to Google Cloud with no service account key anywhere, and an org policy that makes creating one impossible even for a project owner. Four federation paths built side by side so the trade-offs are visible rather than asserted, deployed against a live organization and destroyed the same day.",
    meta: [
      { k: "Role", v: "Cloud / Platform Security" },
      { k: "Cloud", v: "GCP" },
      { k: "Paths", v: "4 (GitHub ×2, AWS ↔ GCP)" },
      { k: "Resources", v: "41 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "A service account key is a JSON file holding a private key that does not expire. It authenticates as its service account from anywhere on the internet, forever, until someone notices and revokes it. Leaked keys are found in public repositories within minutes and are a routine root cause of cloud incidents.",
          "The usual mitigations are procedural: do not commit keys, rotate them, scan for them. Every one of them depends on nobody making a mistake. Federation removes the key entirely, but it introduces a subtler failure: a federation pool configured without constraints is worse than a key, because it trusts every token its issuer signs, and GitHub's issuer signs one for every workflow run in every repository on GitHub.",
        ],
      },
      {
        num: "/02",
        heading: "Approach",
        bullets: [
          "GitHub Actions to GCP through direct resource access, where a principalSet holds IAM roles on the bucket, registry, and secret and no service account exists at all.",
          "The same token exchanged for a service account through roles/iam.workloadIdentityUser, built only so the two can be compared and the choice defended.",
          "AWS to GCP through a pool that verifies a signed GetCallerIdentity request against AWS STS, which is why that provider takes an account ID rather than an issuer URL.",
          "GCP to AWS through web identity federation, where AWS treats accounts.google.com as a built-in provider, so trust pins to the service account's numeric unique ID rather than its email.",
        ],
      },
      {
        num: "/03",
        heading: "The control is the attribute condition",
        paragraphs: [
          "Attribute mapping renames claims. It does not decide who gets in. The provider pins both repository and owner, so a token from any other repository is refused at the pool before any IAM binding is evaluated. Deny at the door, then scope inside it.",
          "Authority then splits across two attributes of the same pool: read binds on attribute.repository, write binds on attribute.ref. That is what lets a pull request from a fork read without being able to write, and it is why pinning the sub claim to a single value, which is what one Checkov rule wants, would have been a downgrade rather than a hardening. The waiver is written into both the code and the README with that reasoning.",
        ],
      },
      {
        num: "/04",
        heading: "Making the claim enforceable",
        paragraphs: [
          "Two org policy constraints, disableServiceAccountKeyCreation and disableServiceAccountKeyUpload, are applied to the workload project. With both enforced, nobody can create or upload a key there, including a project owner. That is the difference between \"we do not use keys\" and \"keys cannot exist here.\"",
          "Secret Manager and Artifact Registry share one customer-managed key, so disabling a single key version revokes both at once with no IAM edit and nothing deleted. State lives in a separate project no federated identity can reach, because state describes the shape of everything and CI never needs to read it.",
        ],
      },
      {
        num: "/05",
        heading: "What the first apply taught",
        bullets: [
          "resourcemanager.organizationAdmin does not include folders.create. It administers IAM policy; it does not create hierarchy.",
          "Org policy administration is a separate role again, orgpolicy.policyAdmin, and is also absent from organizationAdmin.",
          "User credentials with no quota project bill orgpolicy calls to Google's shared OAuth client project, failing with SERVICE_DISABLED on a project ID that looks alarming and is not yours. Fixed with billing_project and user_project_override on the provider.",
          "The Secret Manager service agent does not exist at the moment the KMS grant references it. It resolves on retry; the lag is real and undocumented in the obvious places.",
        ],
      },
      {
        num: "/06",
        heading: "Verified, then destroyed",
        paragraphs: [
          "The deployed provider's attribute condition was read back from the API and matched what was written. Both constraints reported enforce = True. Both projects had zero default networks. The secret was confirmed bound to the customer-managed key.",
          "The check that matters ran last: creating a service account key as project owner was refused with constraints/iam.disableServiceAccountKeyCreation named in the violation. Everything was then destroyed, leaving both projects in DELETE_REQUESTED with billing unlinked, the folder gone, and no residual buckets.",
        ],
      },
    ],
    stack: ["Workload Identity Federation", "Org Policy", "Secret Manager", "Cloud KMS", "Artifact Registry", "GitHub OIDC", "AWS STS", "Terraform"],
    repo: "https://github.com/jordann6/gcp-workload-identity-federation",
    receipt: {
      rows: [
        { k: "Provision", v: "19 bootstrap resources (folder, two projects, state and log buckets, audit configs), then 22 federation resources" },
        { k: "Proof", v: "Attribute condition confirmed on the live provider; both org policy constraints enforcing; zero default networks; CMEK binding confirmed via API" },
        { k: "Denied", v: "Service account key creation refused as project owner, constraint named in the violation" },
        { k: "Destroy", v: "22 then 20 resources destroyed; folder and buckets gone, both projects DELETE_REQUESTED with billing unlinked" },
      ],
      total: { k: "Cost", v: "under $0.05 for the full deploy-demo-destroy cycle" },
    },
  },
  {
    slug: "gcp-landing-zone",
    num: "30",
    title: "GCP",
    titleOut: "Landing Zone",
    category: "GCP · Platform · Governance",
    lede: "An organization built as code: resource hierarchy, nine org policy constraints enforced at the org root with a deliberate folder-level override, a Shared VPC with no public SSH path, and an audit sink that covers projects created after it exists.",
    meta: [
      { k: "Role", v: "Cloud / Platform" },
      { k: "Cloud", v: "GCP" },
      { k: "Constraints", v: "9 at the org root" },
      { k: "Resources", v: "52 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "A cloud organization decays in a predictable direction. Projects get created outside any hierarchy, each with a default VPC nobody chose and firewall rules nobody reviewed. Service account keys accumulate. Audit logs exist per project and nowhere centrally, so the question \"who read that\" has no answer. Spend is discovered monthly.",
          "None of this is caused by bad engineers. It is caused by the defaults being wrong and by every correct decision needing to be remade by each person who creates a project. A landing zone moves those decisions into the hierarchy, where inheritance does the enforcing.",
        ],
      },
      {
        num: "/02",
        heading: "The third version of the same idea",
        paragraphs: [
          "This is the same problem already solved with AWS Organizations and SCPs, and with an Azure Landing Zone and Azure Policy. The differences are the reason to build it a third time rather than the reason not to.",
          "An SCP is a deny boundary evaluated against IAM at request time: the call is authorized or it is not. Azure Policy evaluates resources and can deny, audit, or mutate through effects. GCP org policy constrains the shape of the configuration itself, so the API rejects a violating resource. The violation cannot exist rather than being disallowed to whoever asked.",
          "Exceptions run the opposite way too. An SCP deny cannot be un-denied further down the tree, so AWS exceptions mean moving an account to a different OU. GCP list constraints let a child policy widen an inherited one, which this build demonstrates on purpose: resource locations allow US at the org, and nonprod adds EU for a residency test without weakening anything elsewhere.",
        ],
      },
      {
        num: "/03",
        heading: "Placement is the policy",
        paragraphs: [
          "core holds platform-owned projects for network and logging. workloads splits into nonprod and prod. The two workload projects are byte-for-byte identical except for which folder they land in, which is the entire demonstration: they are governed differently without either one carrying policy code.",
          "Constraints attach at the organization rather than a folder, because a policy attached to a folder is bypassed by creating a project somewhere else. IAM inherits the same way, which makes folder design a security decision rather than an org-chart decision.",
        ],
      },
      {
        num: "/04",
        heading: "The constraint that ships disabled",
        paragraphs: [
          "iam.allowedPolicyMemberDomains is written and defaults to off, and the default is the point. It blocks binding allUsers, which breaks any public Cloud Run service. Enabling it without knowing that is how a landing zone quietly blocks a workload the organization intends to run, and the surprise surfaces weeks later as an unexplained permission error.",
          "Naming that trade-off in code is worth more than silently enforcing one side of it.",
        ],
      },
      {
        num: "/05",
        heading: "Network, telemetry, spend",
        bullets: [
          "One Shared VPC host project owns the network; workload projects attach as service projects and consume a subnet they do not own. Access is granted per subnet, not per project, which is the least-privilege form of the pattern.",
          "Firewall is explicit default-deny plus SSH from the IAP forwarding range only, so there is no public SSH path and no VM carries an external IP.",
          "An organization sink with include_children ships admin activity, data access, system event, and policy denial logs to a partitioned BigQuery dataset, covering projects created after the sink exists. Partition expiry bounds retention and cost together.",
          "Security Command Center Standard, which is free, streams active unmuted findings to Pub/Sub, and a budget alerts on actual spend at 50, 90, and 100 percent plus a forecast rule.",
          "One CMEK key covers the audit dataset and both topics, so a single disable revokes the org's entire audit trail and finding stream at once.",
        ],
      },
      {
        num: "/06",
        heading: "What a real organization taught",
        bullets: [
          "A new GCP organization is not greenfield. Google pre-applies a secure-by-default policy set, so three of the nine constraints already existed and the apply failed with 409 POLICY_ALREADY_EXISTS on each.",
          "organizationAdmin grants almost none of the operational org permissions. Four more roles were needed, each found by an apply failing on exactly one resource: folderAdmin, orgpolicy.policyAdmin, compute.xpnAdmin, and logging.configWriter.",
          "A self-serve billing account caps how many projects can be linked at once, and projects in DELETE_REQUESTED keep counting for 30 days, so the ceiling arrives sooner than a project list suggests.",
          "A resource's arguments may be unknown at plan time; its count may not. The Shared VPC attachment had to key off a boolean rather than a host project ID generated in the same apply.",
        ],
      },
      {
        num: "/07",
        heading: "Two corrections worth more than the build",
        paragraphs: [
          "The first was a test that proved nothing. Creating a network named default and expecting a denial is the obvious check for compute.skipDefaultNetworkCreation, and it succeeds. The constraint suppresses the default VPC at project creation; it says nothing about the name default afterwards. The check was passing by creating a network rather than by being denied, and the validation step was rewritten to confirm a freshly vended project has zero networks instead.",
          "The second was worse and more instructive. Importing the three pre-existing Google policies to resolve the 409s handed Terraform ownership of policies it never created, and destroy duly deleted them, leaving the organization less protected than before the landing zone was ever applied, with service account key creation newly permitted org-wide. They were restored by hand and the trap is documented in the teardown section. Adopting existing infrastructure is a two-way door only if you know which side you came in on.",
        ],
      },
      {
        num: "/08",
        heading: "Verified, then destroyed",
        paragraphs: [
          "Inheritance was proven the only way that counts: an effective-policy query returned US value groups only at prod, and US plus europe and EU at nonprod, from a child policy widening the inherited one rather than replacing it. The Shared VPC attachment resolved, and the org sink reported delivery to BigQuery with includeChildren true.",
          "Two controls proved themselves by refusing: a service account key creation denied with the constraint named, and a bucket in asia-northeast1 refused with a 412 naming gcp.resourceLocations. Everything was then destroyed, leaving zero folders, the seed project in DELETE_REQUESTED with billing unlinked, and the three borrowed org policies put back.",
        ],
      },
    ],
    stack: ["Org Policy", "Resource Manager", "Shared VPC", "Cloud Logging", "BigQuery", "Security Command Center", "Cloud KMS", "Pub/Sub", "Terraform"],
    repo: "https://github.com/jordann6/gcp-landing-zone",
    receipt: {
      rows: [
        { k: "Provision", v: "52 resources: 4 folders, 9 org policy constraints, 3 vended projects, Shared VPC with 2 firewall rules, org sink, BigQuery dataset, CMEK key, 2 topics, budget" },
        { k: "Proof", v: "Effective policy at prod resolves US only, at nonprod US plus EU; Shared VPC attachment resolved; org sink delivering with includeChildren true" },
        { k: "Denied", v: "Service account key creation refused; bucket in asia-northeast1 refused with 412 naming gcp.resourceLocations" },
        { k: "Not deployed", v: "SCC notification config, blocked on org permissions beyond notificationConfigEditor" },
        { k: "Destroy", v: "52 then 18 resources destroyed; zero folders, seed project DELETE_REQUESTED with billing unlinked, three pre-existing org policies restored by hand" },
      ],
      total: { k: "Cost", v: "under $0.20 for the full deploy-demo-destroy cycle" },
    },
  },
  {
    slug: "gcp-supply-chain-security",
    num: "31",
    title: "Supply Chain",
    titleOut: "Security (GCP)",
    category: "GCP · Platform · Security",
    lede: "A signature over a digest, not a check on where an image came from. Binary Authorization refuses any container Cloud Build did not sign after a clean scan, an org policy makes one project's images the only bootable ones, and both refusals were demonstrated live before the whole thing was destroyed.",
    meta: [
      { k: "Role", v: "Cloud / Platform Security" },
      { k: "Cloud", v: "GCP" },
      { k: "Projects", v: "2, split on the trust boundary" },
      { k: "Resources", v: "56 (Terraform)" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Most artifact controls check the wrong thing. They check where an image came from: this registry, that repository path, a tag matching a pattern. Every one of those is a string, and every one of them is satisfied by an attacker who can push to the registry, which is a much lower bar than compromising a build.",
          "The question worth answering is not whether an image came from the right place but whether the checks actually ran on these exact bytes. That is a question about a specific digest, and the only durable answer is a signature over it, made by something that could not have signed unless the checks passed.",
          "The same argument runs one layer down. A golden VM image is not a control. Baking a hardened image and leaving stock images bootable next to it means the hardening applies to the instances that opted into it, which is the instances that were never the problem.",
        ],
      },
      {
        num: "/02",
        heading: "The split is the control",
        paragraphs: [
          "Two projects, divided on the boundary the control actually runs across. The build project owns everything that produces evidence: the registry, the scanner, the Cloud KMS signing key, the attestor. The runtime project owns the thing that consumes it: the Binary Authorization policy and Cloud Run.",
          "If the signing key lived in the same project as the deployment policy, anyone who could edit the policy could also mint the signature that satisfies it, and the control would degrade into a label. Split, the runtime project's Binary Authorization service agent holds attestorsVerifier on the attestor and nothing more. Verifying and signing are different permissions, on different resources, in different projects, so bypassing the gate means compromising both.",
          "The key is asymmetric for the same reason. The private half never leaves KMS and the verifier only ever holds the public half, so the thing checking a signature cannot produce one. A symmetric secret would mean the verifier could forge exactly what it verifies.",
        ],
      },
      {
        num: "/03",
        heading: "Build, scan, sign, admit",
        bullets: [
          "Cloud Build builds the container, pushes it, resolves the tag to a digest, and works only on the digest from then on. A tag can be moved after a signature is made, so an attestation over a tag says nothing about what runs.",
          "The scan is on-demand rather than the automatic registry scan, because automatic scanning is asynchronous: a pipeline gating on it has to poll and guess how long \"not found yet\" means clean. On-demand is synchronous, so a clean result is a result rather than the absence of one.",
          "Signing happens only if nothing blocking came back. The gate is the step ordering, not a conditional: Cloud Build stops on the first failing step, so the signing step is unreachable when the scan fails and there is nothing inside it to bypass.",
          "Binary Authorization on Cloud Run then refuses any digest that signature does not cover. Enforcement sits in the platform's admission path, not in the pipeline, so it also refuses a deploy typed by hand at a terminal.",
          "Cloud Build runs as a dedicated service account rather than the legacy default, which carries roles/editor on its own project and would let a compromised build step rewrite the policy meant to constrain it.",
        ],
      },
      {
        num: "/04",
        heading: "Image trust as a project, not a name",
        paragraphs: [
          "Packer bakes a CIS-informed Ubuntu 22.04 image into an image family, and a second provisioner verifies the hardening separately from applying it, because a script that both applies and checks its own work tends to check the variable it just set. The bake also strips the SSH host keys and machine ID so every instance generates its own, since an image that ships one host key to a fleet defeats host verification for the entire fleet.",
          "Enforcement is compute.trustedImageProjects, which takes a list of projects whose images may be booted. AWS has no direct equivalent: restricting AMIs means an IAM condition on ec2:RunInstances matching owner or tags, a policy you write and can get wrong. On GCP the unit of trust is the container the images live in, so there is no naming rule to work around and nothing to tag correctly.",
          "The constraint is scoped to the runtime project rather than the organization, and that placement is a design decision rather than caution. At the org it would also cover the build project, where Packer has to boot a stock Canonical image in order to harden it, and the bake would deadlock on the policy it exists to satisfy.",
        ],
      },
      {
        num: "/05",
        heading: "Four acts, two of them refusals",
        paragraphs: [
          "An unsigned image was pushed to the trusted registry, by the same Cloud Build, in the same project, under a plausible tag. Every registry-name or repository-path check would have let it through. The deploy was refused: denied by attestor vulnerability-scan-passed, no attestations found that were valid and signed by a key trusted by the attestor.",
          "The same source then went through the pipeline, was scanned, signed, deployed, and answered on its URL. An instance created from debian-cloud was refused with the constraint named in the violation, and an instance from the hardened family booted.",
          "Two of the four acts expect a non-zero exit, so the demo script checks that the failure was the predicted one. A broken image, a missing permission, and an enforced policy all produce a failed deploy, and only one of them is the thing being demonstrated. Reporting the other two as a passing control would be the easiest possible way to ship a demo that proves nothing.",
        ],
      },
      {
        num: "/06",
        heading: "What the live run found",
        paragraphs: [
          "The scan gate blocked the project's own container on its first run. Two CRITICALs, both in the Go toolchain rather than in the application or the base image, fixed upstream in 1.24.13 and 1.25.9 while the build was on 1.23.12. Bumping the compiler was the correct response and lowering the threshold was the tempting one. That is also the argument for starting at CRITICAL only: the gate fired once, on something real, and was actionable in one line.",
          "One design intent did not survive contact. Requiring Google's built-by-cloud-build provenance attestor cannot work in a pipeline that deploys its own image, because Cloud Build writes that attestation when the build completes, so at the moment the deploy step runs it does not exist yet. That is an ordering property, not a misconfiguration, and closing it means splitting build and deploy into separate pipelines. The option is left wired up and switched off with the reason written down, rather than quietly deleted.",
          "Several failures were permission errors wearing a disguise. The build could attach an attestation to its note but not read one back, so its own verification poll returned an empty list forever and looked like a propagation delay that never resolved. A cross-project image read that lacks compute.imageUser reports the image as not found rather than forbidden, because the API will not confirm the existence of something the caller cannot see. And a Terraform init failed with \"bucket doesn't exist\" for a bucket that plainly existed, because application default credentials still billed the call to a project deleted by an earlier build.",
          "The image verification gate also caught a conflict between two of its own steps: the first bake failed because sshd -t needs a host key and the cleanup had already removed them. It refused to publish an image whose config had not been parsed, which is precisely the behavior the gate exists for.",
        ],
      },
      {
        num: "/07",
        heading: "Verified, then destroyed",
        paragraphs: [
          "terraform destroy does not fully clean this build, and each gap is a property of GCP rather than a bug in the config. Packer publishes images through the Compute API, so destroy has never heard of them. A KMS key cannot be deleted, only scheduled for destruction with a 24 hour minimum, so destroy drops it from state and leaves it standing. The Binary Authorization policy is a per-project singleton with no delete, only a reset to a permissive default, so a surviving project is left accepting anything. Cloud Run services created by the pipeline are not in state either.",
          "The teardown script handles all four in order and then deletes the projects, which resolves them together. All three projects finished in DELETE_REQUESTED with nothing billable left, for under a dollar across the whole deploy, demonstrate, and destroy cycle.",
        ],
      },
    ],
    stack: ["Binary Authorization", "Cloud Build", "Artifact Analysis", "Cloud KMS", "Artifact Registry", "Cloud Run", "Packer", "Org Policy", "Terraform"],
    repo: "https://github.com/jordann6/gcp-supply-chain-security",
    receipt: {
      rows: [
        { k: "Provision", v: "56 resources across 2 projects: Artifact Registry, KMS asymmetric signing key, Container Analysis note, attestor, Binary Authorization policy, dedicated build identity, 2 VPCs, hardened image family" },
        { k: "Proof", v: "Attested image scanned clean, signed, deployed to Cloud Run, and answering; hardened image booted from the trusted family" },
        { k: "Denied", v: "Unsigned image in the trusted registry refused at deploy with the attestor named; debian-cloud instance refused by compute.trustedImageProjects" },
        { k: "Gate fired", v: "Pipeline blocked its own container on 2 CRITICALs in the Go toolchain; fixed by bumping the compiler, not the threshold" },
        { k: "Not enabled", v: "built-by-cloud-build provenance attestor, which a self-deploying build cannot satisfy by construction" },
        { k: "Destroy", v: "Pipeline services, demo instances, Packer images, and container images removed, KMS versions scheduled for destruction, all 3 projects DELETE_REQUESTED" },
      ],
      total: { k: "Cost", v: "under $1 for the full deploy-demo-destroy cycle" },
    },
  },
  {
    slug: "gcp-zero-trust-access",
    num: "32",
    title: "Zero Trust",
    titleOut: "Access (GCP)",
    category: "GCP · Platform · Security",
    lede: "A valid credential is not access. A service account holding a real roles/storage.objectViewer on exactly one bucket reads the object from inside the perimeter and is refused from outside it, with IAM identical in both cases, demonstrated live before the whole thing was destroyed.",
    meta: [
      { k: "Role", v: "Cloud / Platform Security" },
      { k: "Cloud", v: "GCP" },
      { k: "Perimeter", v: "1 project in, state deliberately out" },
      { k: "Mode", v: "Dry run first, then enforced" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "IAM answers one question: may this principal perform this action on this resource. It answers it well, and it is not sufficient, because the question it cannot ask is whether the request should be happening at all.",
          "A stolen credential is a valid credential. That is the whole difficulty. Every control reasoning only about who is asking will approve it, because by construction the answer to who is asking is someone entitled to ask. The credential was scoped correctly and the role was granted deliberately, and none of that helps.",
          "The network perimeter used to be the second question. It stopped working when the resources became APIs on the public internet, because the boundary no longer corresponds to anything: a Cloud Storage bucket has no inside. So the second question has to be rebuilt at the API.",
        ],
      },
      {
        num: "/02",
        heading: "Three controls, three layers",
        bullets: [
          "Access Context Manager defines what a trusted request looks like, as a named object rather than as policy text. An IAM condition references the access level by name, so changing the definition of trusted is one edit instead of an audit of every policy that inlined the equivalent condition.",
          "Identity-Aware Proxy evaluates it at the front door, per request, before the application is reached. It is enabled directly on the Cloud Run service, which protects the run.app endpoint without provisioning a load balancer, a certificate, and a domain in front of a container that scales to zero.",
          "VPC Service Controls evaluates it at the data, and refuses to let bytes cross the boundary regardless of what IAM says. The perimeter is an object that contains projects, so a resource created inside one is protected from the moment it exists.",
          "The instance inside the perimeter has no external IP, no NAT, and no SSH key. The only inbound path is the IAP TCP tunnel, gated on a separate role, with OS Login binding SSH to IAM and project-wide keys blocked so there is no alternate path.",
        ],
      },
      {
        num: "/03",
        heading: "Why the perimeter is the part worth building on GCP",
        paragraphs: [
          "AWS has pieces that overlap: aws:SourceIp and aws:SourceVpce conditions on a bucket policy, VPC endpoint policies, and SCPs with a data perimeter condition set. Assembled carefully they approximate it. The difference is where the rule lives and what it defaults to. On AWS the boundary is conditions written into each resource's policy, so a bucket created without them sits outside the perimeter and nothing announces that. On GCP the default for a new resource is protected rather than exposed, and that inversion is most of the value.",
          "Azure has no comparable construct. Private Link and service endpoints restrict network paths to a resource, which is a different and weaker claim than restricting data movement across a boundary.",
          "Worth stating plainly: VPC Service Controls is hard to operate at scale, and the parts this does not exercise are the parts that make it hard, including perimeter bridges, ingress and egress rules for real cross-project traffic, and the long dry-run period a large organization needs. What is here is correct and it is small.",
        ],
      },
      {
        num: "/04",
        heading: "Two access levels, because they fail differently",
        paragraphs: [
          "The trusted level combines identity AND network and gates the application. The demo revokes it deliberately by pointing the trusted range at TEST-NET-1, which produces a refusal without touching the IAM binding: the role is still held, the condition on it simply stops being satisfied.",
          "A second management level, identity only with no network condition, gates perimeter ingress. That is a deliberate weakening and it is documented as one. If perimeter ingress depended on the trusted level too, revoking it mid-demo would cut Terraform off from the state describing the perimeter, and the apply meant to restore it could not run. It is the standard break-glass shape, on the reasoning that the ability to remove a control has to survive that control being wrong.",
          "State lives in a seed project outside the perimeter for the same reason. The general rule: the control plane that can remove a control must never sit inside it.",
          "The honest limitation is the device policy. The half of an access level that matters most in production depends on endpoint verification reporting posture from enrolled managed devices, which needs Cloud Identity Premium. It is written out and commented rather than deleted, because an IP range standing in for a trusted device is the weakest link here and naming it beats letting the config imply otherwise.",
        ],
      },
      {
        num: "/05",
        heading: "What the live run found",
        paragraphs: [
          "Dry run first, and it paid immediately. Within minutes of the instance booting it logged the VM guest agent calling an API absent from the VPC allowlist, something nothing in the design suggested existed. Enforcing straight away would have half-broken the guest environment, and the symptom would have surfaced later, somewhere else, looking nothing like a perimeter problem.",
          "Enforcement is not atomic, and the deny path lands first. The exfiltration attempt was correctly refused within a minute, while the read from inside, which should have been allowed, failed for another four with VPC network mapping unavailable. Nothing was misconfigured: the association between the perimeter and the VPC network propagates behind the restriction itself.",
          "The subtler one took a while to read correctly. Under enforcement Terraform could not manage the bucket while plain gcloud as the same user could, which points straight at the ingress rule. It was not the ingress rule. The violation reason was RESOURCES_NOT_IN_SAME_SERVICE_PERIMETER rather than NO_MATCHING_ACCESS_LEVEL, and those are different refusals. user_project_override attaches a quota project to every provider call, that project was the seed, and the seed sits outside the perimeter by design. A call naming a resource inside and a project outside is refused no matter who is asking, and no ingress rule can admit it. The fix is a second provider whose quota project is inside the perimeter, used only by the restricted resources.",
          "Two refusals that look identical from outside, both a 403 reading Request is prohibited by organization's policy, distinguished only by one line in the audit log. Debugging a perimeter by guessing at the policy is slower than reading the violation reason.",
        ],
      },
      {
        num: "/06",
        heading: "Outcome",
        paragraphs: [
          "Demonstrated live. An anonymous request to the Cloud Run URL was terminated at IAP with a redirect to Google sign-in, so the container was never invoked. The analyst service account, impersonated rather than keyed, was refused on both Cloud Storage and BigQuery with VPC Service Controls violation identifiers that correlate to the audit log. The same identity then read the same object cleanly from the in-perimeter instance over the IAP tunnel. IAM was identical in both directions; only the origin differed.",
          "Torn down the same night. The organization-scoped objects are the trap: a perimeter survives the deletion of every project inside it, access levels survive the perimeter, and an access policy cannot be deleted while it holds either, so the teardown removes them in that order and verifies each is gone. Both projects reached DELETE_REQUESTED, the access policy was deleted, and the temporary organization role the build required was revoked.",
        ],
      },
    ],
    stack: ["VPC Service Controls", "Access Context Manager", "Identity-Aware Proxy", "Cloud Run", "Compute Engine", "OS Login", "Private Google Access", "IAM Conditions", "Cloud DNS", "Terraform"],
    repo: "https://github.com/jordann6/gcp-zero-trust-access",
    receipt: {
      rows: [
        { k: "Provision", v: "2 projects: service perimeter over Cloud Storage and BigQuery, 2 access levels, IAP on Cloud Run, VPC with no external IP and no NAT, restricted VIP DNS, instance reachable only by IAP tunnel" },
        { k: "Proof", v: "Analyst service account read the protected object from inside the perimeter over the IAP tunnel, with OS Login and no SSH key on the instance" },
        { k: "Denied", v: "Same service account, same roles/storage.objectViewer, refused from outside on both Cloud Storage and BigQuery with VPC-SC violation IDs; anonymous request terminated at IAP before the container" },
        { k: "Dry run caught", v: "VM guest agent calling an API missing from the VPC allowlist, which enforcement would have broken silently" },
        { k: "Live fix", v: "Quota project outside the perimeter refused calls to resources inside it; resolved with a second provider, not a looser policy" },
        { k: "Destroy", v: "Perimeter, then access levels, then projects, then the access policy; both projects DELETE_REQUESTED and the temporary org role revoked" },
      ],
      total: { k: "Cost", v: "under $1 for the full deploy-demo-destroy cycle" },
    },
  },
  {
    slug: "gcp-gke-config-sync",
    num: "33",
    title: "GKE with",
    titleOut: "Config Sync (GCP)",
    category: "GCP · Platform · Kubernetes",
    lede: "A GitOps reconciler and an admission controller both claim to enforce configuration, and they promise different things. The same deletion of the same object is corrected after the fact by one and refused outright by the other, and the difference between them is a single boolean.",
    meta: [
      { k: "Role", v: "Platform / Kubernetes" },
      { k: "Cloud", v: "GCP" },
      { k: "Cluster", v: "Zonal GKE, private nodes, 2 x e2-standard-2" },
      { k: "Resources", v: "33 (Terraform)" },
      { k: "Cost", v: "About $1 for build, demo, and teardown" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Every cluster accumulates configuration nobody can account for. Not through carelessness, but because kubectl apply is how a cluster is operated, and a command run at 6pm to unblock a deploy leaves nothing behind that says it happened. Six months later there is a RoleBinding matching no file, and the only way to learn whether it is load bearing is to delete it and see who complains.",
          "Putting the manifests in Git is necessary and not sufficient. Git being the intended source of truth does nothing to stop the API server accepting writes from somewhere else. A repository describing what the cluster should look like, sitting next to a cluster that does not look like it, is worse than no repository, because now there is a document people trust.",
        ],
      },
      {
        num: "/02",
        heading: "Two guarantees, not one",
        paragraphs: [
          "Two mechanisms close that gap and they are not the same mechanism. Reconciliation runs a controller that polls the repository, diffs it against live state, and corrects the difference: drift is possible and temporary, the guarantee is eventual, and there is a window. Admission control runs a webhook in front of the API server that refuses writes: drift is not corrected because it never happens, and the cost is that the webhook now sits in the path of every write, including the ones needed during an incident.",
          "The demonstration is the same kubectl delete run twice. With drift prevention off, the ResourceQuota is genuinely gone and returns about five seconds later. With it on, the identical command from the identical account is rejected by the Config Sync admission webhook and never reaches etcd. Nothing changed but one boolean.",
          "The five seconds is the honest part. For that interval the quota did not exist, and any pod admitted in the gap was admitted without it. That is acceptable for a quota and unacceptable for some other things, and knowing which guarantee is in force is the point.",
        ],
      },
      {
        num: "/03",
        heading: "What Terraform owns, and what it does not",
        bullets: [
          "Terraform builds the project, network, cluster, node pool, and registry, and enables Config Sync and Policy Controller as fleet features. It manages no object inside the cluster.",
          "Everything under config/ is reconciled from Git: namespaces with Pod Security labels, tenant RBAC scoped with a Role rather than a ClusterRole, a ResourceQuota paired with the LimitRange that keeps it from breaking the namespace, and default-deny NetworkPolicies with DNS allowed back immediately.",
          "That split is the reason a bad namespace change is a git revert and one sync interval rather than a terraform apply. Two lifecycles, two blast radii.",
          "There is no credential anywhere. The repository is public over HTTPS with secret_type set to none, so the reconciler holds nothing and rotates nothing, and Workload Identity covers the other direction so pods reach Google APIs by token exchange rather than a mounted key.",
          "Cloud NAT is the one resource that looks removable and is not. Private nodes reach Google APIs through Private Google Access, but they cannot reach github.com, and the whole build is a reconciler polling github.com. Removing it does not slow the sync, it stops it.",
        ],
      },
      {
        num: "/04",
        heading: "Constraints, and the ratchet that makes them safe",
        paragraphs: [
          "Policy Controller installs roughly seventy maintained ConstraintTemplates. Installing the library enforces nothing: a template is a CRD definition plus Rego, and nothing applies until a constraint instantiates it. Three do here, and one of them is deliberately not enforcing.",
          "Two are set to deny. The third, a hand-written ConstraintTemplate requiring image digests rather than tags, is set to dryrun so it admits everything and records violations. Reading those violations answers the question that cannot be answered any other way, which is what turning the rule on would actually break. It finds the sample app, which is running right now on a tagged image and would stop being schedulable the moment the rule moved to deny.",
          "Every constraint scopes by an explicit include list rather than by excluding system namespaces. Exclusion looks like the safe direction and is not: a namespace appearing next month is silently in scope, and a constraint that blocks a GKE-managed system pod on a cluster where the webhook is what prevents you from fixing it is a bad afternoon.",
        ],
      },
      {
        num: "/05",
        heading: "What the live run found",
        bullets: [
          "The privileged-pod test was refused by Pod Security Admission, not by the constraint it named. PSA is built into the API server and runs ahead of every validating webhook, so the namespace label answered and Gatekeeper was never consulted. The consequence matters more than the fix: deleting that constraint entirely would not change the output, so that test could never have proven Policy Controller works. A separate test on image registries does, because PSA has no vocabulary for registries.",
          "Reconciliation took about five seconds rather than the fifteen-second poll interval. Config Sync holds a watch on the objects it manages, so a deletion is observed rather than waited for, and the poll interval bounds noticing a change in Git rather than a change in the cluster.",
          "The apply failed fifteen minutes in, after the cluster was already built, because anthosconfigmanagement and anthospolicycontroller are separate APIs from gkehub and were missing from the enable list. They still carry the anthos name even though the tier they were named for no longer exists.",
          "A missing gke-gcloud-auth-plugin presented as a broken cluster. Every kubectl call failed with an exec error that a deliberately tolerant wait loop swallowed, producing ten minutes of waiting and then a report that Config Sync never synced, against a cluster that was entirely healthy.",
          "terraform init reported that the state bucket did not exist. The bucket was fine; Application Default Credentials were still pointing their quota project at a project deleted in an earlier build, so the call 404d on the wrong object. gcloud storage ls succeeded throughout, because the CLI uses different credentials than ADC.",
        ],
      },
      {
        num: "/06",
        heading: "Outcome",
        paragraphs: [
          "Six acts passed live against a real cluster: the reported commit matching the branch head exactly, drift reverted, the same drift refused, the admission ordering made explicit, an unapproved registry rejected at write time rather than as an ImagePullBackOff two minutes later, and the dry-run constraint reporting what enforcing it would break. Then thirty-three resources destroyed with billing detached and no orphaned fleet membership.",
          "Both features are included in base GKE at no cost since September 2025, when Google dissolved the GKE Enterprise tier. That inverted the usual advice: the open source install is now the worse option rather than the cheaper one, because kpt-config-sync publishes no release assets and the manifest bucket its own documentation points at no longer serves ordinary callers.",
        ],
      },
    ],
    stack: [
      "GKE",
      "Config Sync",
      "Policy Controller",
      "Gatekeeper",
      "OPA Rego",
      "Workload Identity",
      "Cloud NAT",
      "NetworkPolicy",
      "Pod Security Admission",
      "Artifact Registry",
      "Terraform",
    ],
    repo: "https://github.com/jordann6/gcp-gke-config-sync",
    receipt: {
      rows: [
        { k: "Provision", v: "33 resources: zonal GKE with private nodes and Workload Identity, 2 x e2-standard-2 node pool, VPC with Cloud NAT, Artifact Registry, fleet membership with Config Sync and Policy Controller enabled" },
        { k: "Reconciled", v: "14 objects applied from Git, with the cluster reporting the exact commit SHA of the branch head" },
        { k: "Corrected", v: "ResourceQuota deleted by hand and restored in about 5 seconds with drift prevention off" },
        { k: "Refused", v: "The identical delete rejected by the Config Sync admission webhook with drift prevention on, and a Docker Hub image rejected at write time by the registry constraint" },
        { k: "Dry run caught", v: "The running sample app pulling an image by tag, which promoting the digest constraint to deny would have made unschedulable" },
        { k: "Live fix", v: "anthosconfigmanagement and anthospolicycontroller missing from the API list, failing the apply 15 minutes in after the cluster was already built" },
        { k: "Corrected claim", v: "The privileged-pod test is answered by Pod Security Admission, not by the constraint it named, so it could never have proven Policy Controller works" },
        { k: "Teardown", v: "33 destroyed, project DELETE_REQUESTED with billing detached, no orphaned fleet membership" },
      ],
      total: { k: "Total cost", v: "About $1" },
    },
  },
  {
    slug: "hpc-slurm-cluster",
    num: "34",
    title: "HPC Slurm",
    titleOut: "Cluster (AWS)",
    category: "AWS · HPC · Platform",
    lede: "The same binary, the same grid, the same rank count, run over two interconnects. Time blocked on halo exchange fell from 17.5 percent to 0.8 percent while wall clock got worse, and the checksums matched bit for bit, which is what makes the comparison a measurement rather than a claim.",
    meta: [
      { k: "Role", v: "Platform / HPC" },
      { k: "Cloud", v: "AWS" },
      { k: "Cluster", v: "ParallelCluster 3.15.1, two queues, MinCount 0" },
      { k: "Resources", v: "40 (Terraform) + cluster stack" },
      { k: "Cost", v: "About $5 for build, demo, and teardown" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "Every HPC vendor page asserts that a low-latency fabric is faster, and almost none of them show the comparison in a form that survives inspection. The usual demonstration times a bandwidth benchmark on the fast hardware and reports the number, which measures the hardware rather than the effect of the fabric on work anyone would run.",
          "A comparison that means something has to hold everything else still. Same source, same compiler flags, same grid, same iteration count, same number of ranks and the same layout of ranks across nodes, with the only difference being the transport underneath. Anything else and the result is a statement about instance types.",
        ],
      },
      {
        num: "/02",
        heading: "Why a stencil, and why the checksum matters",
        paragraphs: [
          "The workload solves the 2D heat equation by Jacobi iteration with a 1D row decomposition. Every iteration, each rank exchanges boundary rows with its neighbours before it can compute the next step, and that halo exchange is what puts interconnect latency into wall clock time. An MPI_Bcast benchmark never touches it, which is why hello-world MPI proves nothing about a fabric.",
          "It uses MPI_Sendrecv rather than a send followed by a receive. With blocking sends in lockstep, every rank posts its send at the same moment and the program deadlocks as soon as the message exceeds the eager threshold and the transport stops buffering it for you. That is a real bug this shape of code invites, and it only appears at scale or at size.",
          "The gate that guards all of it runs on a laptop with no cluster: a domain-decomposed stencil must produce the same checksum regardless of rank count. If the halo exchange is wrong, ranks compute against stale boundary rows and the answer drifts with rank count while every job still exits zero. Verified identical at 1, 2, 4, and 8 ranks, compiled with -Werror.",
        ],
      },
      {
        num: "/03",
        heading: "What Terraform owns, and what it does not",
        bullets: [
          "Terraform owns the VPC, FSx for Lustre and its S3 data repository associations, IAM, the slurmdbd accounting database, and flow logs. ParallelCluster owns only the cluster.",
          "Letting ParallelCluster create its own network and filesystem would put them outside Terraform state, which is exactly how an orphaned NAT gateway and 1.2 TiB of Lustre survive a teardown and keep billing.",
          "Teardown therefore has a strict order. The cluster owns compute instances and ENIs inside the VPC that Terraform created, so destroying the VPC first strands them and the destroy hangs on dependencies Terraform cannot see. The Makefile deletes the cluster, waits for it to actually be gone, and only then destroys the substrate.",
          "Both queues sit at MinCount 0. An idle cluster is a head node and nothing else, and the EFA nodes bill only while a job holds them.",
          "Nothing has a public IP or an open port 22. The head node is private and reached over SSM, and the demo drives it with send-command rather than an interactive session, so it needs no TTY, no key material, and no separately installed session-manager-plugin.",
        ],
      },
      {
        num: "/04",
        heading: "The measurement",
        paragraphs: [
          "Over ordinary ENA on c6i.large, the job spent 3.290 seconds of an 18.768 second run blocked on halo exchange, a communication fraction of 17.5 percent. Over EFA on c5n.9xlarge, the same binary spent 0.176 seconds of a 21.023 second run, a communication fraction of 0.8 percent. Communication time fell by roughly nineteen times.",
          "Wall clock got worse, from 18.8 to 21.0 seconds, because a c5n core is older and slower than a c6i core. Reporting a speedup on wall time here would have reported the CPU and called it the fabric, and reporting it as a slowdown would be just as wrong. The share of time spent waiting on the network is the only figure that isolates what changed.",
          "Both runs returned a checksum of 1.073498e+07, identical to the digit, so the two are demonstrably the same computation rather than two different jobs that happen to be named the same thing. The EFA job also refuses to start if fi_info finds no EFA device, because libfabric will otherwise fall back to TCP silently and the run merely looks disappointing instead of broken.",
        ],
      },
      {
        num: "/05",
        heading: "What the first real run found",
        paragraphs: [
          "Nothing in the repository had ever run against AWS. The first deploy found eleven defects, and the useful ones are the defects that a review pass cannot produce, because they only exist where the code meets the service.",
        ],
        bullets: [
          "Jobs died with WTERMSIG 53 before executing a single line. Slurm could not create the batch output file: the submit directory inherited from the SSM agent is not writable by ec2-user, and /scratch/results arrives root-owned 0755 from the data repository association while jobs run as ec2-user. The signal number says nothing about either.",
          "FI_EFA_USE_DEVICE_RDMA=1 is widely repeated advice and it aborts the process on c5n, whose first-generation EFA has no rdma-read capability. Only p4d and later support it. Left unset, libfabric picks the best protocol the hardware actually has.",
          "AccountingStorageEnforce defaults to none. Accounting still records everything and sacct returns full history, so a QoS ceiling configured under that default looks correct and enforces nothing. The oversized job ran.",
          "Enforcement alone still is not refusal. With limits on but no DenyOnLimit flag, Slurm accepts a job that violates the ceiling and parks it PENDING on QOSMaxWallDurationPerJobLimit indefinitely, which is worse than rejecting it because the submitter gets no error and waits on a job that can never start.",
          "The accounting hierarchy the demo narrated was never created by anything. The script existed, said run once after the cluster is up, and was referenced by no Makefile target, no script, and no config, so every job landed in pcdefault and the fair-share split did not exist.",
          "FSx creates data repository associations one at a time per filesystem, so the second one does not start its clock until the first finishes. The pair took 19 minutes against a provider default timeout of 10, which failed the apply after the filesystem was already built.",
          "The association path was written without the trailing slash that FSx normalizes to and returns, so every single apply saw drift and force-replaced both associations.",
          "demo.sh was committed non-executable, so make demo failed on a clean clone with Permission denied before any of the above could be discovered.",
        ],
      },
      {
        num: "/06",
        heading: "Outcome",
        paragraphs: [
          "All six acts passed live: an idle cluster holding only a head node, a queued job provisioning real EC2 capacity and giving it back, the Lustre association making S3 a POSIX directory whose HSM state flips from released to exists on first read, the fabric comparison, accounting with a fair-share split and a ceiling that now refuses rather than parks, and idle compute reclaimed automatically five minutes after the queue drained.",
          "Then 40 resources destroyed, verified empty rather than assumed: no Terraform state, no instances, no filesystem, no database, no CloudFormation stack, no leftover elastic IP. The eleven fixes are one commit, and the README, the Makefile timings, and the architecture diagram were corrected afterward from what the run actually did rather than from what the design intended.",
        ],
      },
    ],
    stack: [
      "AWS ParallelCluster",
      "Slurm",
      "EFA",
      "FSx for Lustre",
      "Open MPI",
      "libfabric",
      "Systems Manager",
      "RDS",
      "S3",
      "Terraform",
    ],
    repo: "https://github.com/jordann6/hpc-slurm-cluster",
    receipt: {
      rows: [
        { k: "Provision", v: "40 Terraform resources plus the cluster stack: VPC, 1.2 TiB FSx Lustre with two S3 data repository associations, slurmdbd on RDS, private head node reached over SSM" },
        { k: "Scaled", v: "Both queues at MinCount 0, compute provisioned on demand and reclaimed 5 minutes after the queue drained" },
        { k: "Measured", v: "Communication fraction 17.5% over ENA against 0.8% over EFA, same binary and grid and rank count, checksum 1.073498e+07 on both" },
        { k: "Honest result", v: "Wall clock got worse, 18.8s to 21.0s, because c5n cores are slower than c6i, which is why the comparison is reported on communication fraction" },
        { k: "Refused", v: "An oversized job rejected at submit with QOSMaxWallDurationPerJobLimit, after the QoS was given DenyOnLimit" },
        { k: "Live fixes", v: "11 defects found on first contact with AWS, including jobs dying on WTERMSIG 53 from an unwritable output path and EFA aborting on FI_EFA_USE_DEVICE_RDMA" },
        { k: "Corrected claim", v: "AccountingStorageEnforce defaults to none, so the QoS ceiling was decoration and the demo's own narration was wrong until it was enforced" },
        { k: "Teardown", v: "40 destroyed, then state, instances, FSx, RDS, CloudFormation, and EIPs each verified empty" },
      ],
      total: { k: "Total cost", v: "About $5" },
    },
  },
  {
    slug: "gpu-platform",
    num: "35",
    title: "GPU Scheduling",
    titleOut: "and FinOps (AWS)",
    category: "AWS \u00b7 GPU \u00b7 Platform \u00b7 FinOps",
    lede: "The gauge on every GPU dashboard reported a card 100 percent utilized. Occupancy on the same card at the same moment was 45.82 percent, and of the $0.031017 that interval cost, $0.016805 bought no computation. Measuring that gap is the whole point of the project, and it had never once worked, because the metric it depends on is not one the exporter ships by default.",
    meta: [
      { k: "Role", v: "Platform / FinOps" },
      { k: "Cloud", v: "AWS" },
      { k: "Cluster", v: "EKS 1.31, Karpenter GPU NodePool, spot" },
      { k: "Resources", v: "111 across three apply stages" },
      { k: "Cost", v: "About $8 for build, demo, and teardown" },
    ],
    blocks: [
      {
        num: "/01",
        heading: "Problem",
        paragraphs: [
          "GPU fleets are the most expensive compute most organizations rent, and the standard measure of whether that money is working is a utilization percentage that does not mean what its name suggests. DCGM_FI_DEV_GPU_UTIL reports the fraction of time at least one kernel was resident on the device. It says nothing about how much of the device was working.",
          "A single small kernel looping on one streaming multiprocessor pins that gauge at 100 percent while the rest of the card sits idle. Fleets therefore look saturated and are mostly wasted, and every dashboard built on that number agrees with itself. The question worth answering is not whether the cards are busy, it is whether the spend bought any computation.",
        ],
      },
      {
        num: "/02",
        heading: "Why the scheduling half has to exist first",
        paragraphs: [
          "Cost attribution on an idle cluster is arithmetic. To measure anything you need real multi-tenant contention, so Karpenter provisions GPU nodes from zero on demand and gives them back, and Kueue admits work against a per-tenant nominal quota rather than letting the scheduler oversubscribe hardware that cannot be oversubscribed.",
          "The quota has to agree with the hardware or the whole thing is theatre. G and VT service quotas are counted in vCPUs and are zero by default on a fresh account in every region. The granted eight vCPUs buy either two g4dn.xlarge at one card each or one g4dn.2xlarge at one card, so the NodePool pins vCPU size as well as GPU count. Without that pin Karpenter is free to take the larger instance on price, spend the entire budget on a single GPU, and leave Kueue admitting two workloads for hardware that can only ever run one.",
          "Preemption is the part that separates a queue from a list. A high-priority job evicts a low-priority one and the victim returns to the queue rather than dying, which is only observable against a queue that is actually full, and is the reason the demo refills the queue itself rather than assuming the previous act left work running.",
        ],
      },
      {
        num: "/03",
        heading: "The metric that was never there",
        paragraphs: [
          "The collector queries DCGM_FI_PROF_SM_ACTIVE, the profiling counter for the fraction of streaming multiprocessors with at least one warp resident. That is the number that distinguishes a genuinely loaded card from one holding a single trivial kernel, and choosing it over the driver gauge is the central design decision of the project.",
          "It is not in dcgm-exporter's default metric set. The exporter ships GR_ENGINE_ACTIVE, DRAM_ACTIVE and PIPE_TENSOR_ACTIVE, and not SM_ACTIVE. So the collector queried a series that did not exist, logged that it had no samples yet once a minute, wrote no cost records, and left the reaper with nothing to decide on. Nothing errored. The log line reads exactly like a node that has not finished starting, which is what makes it survive a casual look at a running cluster.",
          "The fix is a metrics ConfigMap supplied by Terraform rather than a change to what the collector measures, because the collector was right. The first attempt at that file failed loudly on a comma inside a description field, which is the failure mode you want: the original defect was invisible for as long as anyone cared to watch, and the replacement crashed the pod in seconds.",
        ],
      },
      {
        num: "/04",
        heading: "The measurement",
        paragraphs: [
          "One sample of a g6e.xlarge spot node running a real CUDA load, taken from the cost table rather than from a dashboard: DCGM_FI_DEV_GPU_UTIL 100 percent, DCGM_FI_PROF_SM_ACTIVE 45.82 percent, interval cost $0.031017, of which $0.016805 is attributed to idle silicon. Both numbers are recorded on every sample so the gap is visible in the data rather than asserted here.",
          "Rates come from the Pricing API for on-demand and spot price history for spot, and quantity from observed instance-seconds. Cost Explorer cannot do this job: it reports at daily granularity and lags 8 to 24 hours, so a three-hour GPU demo never appears in it while the demo is running, and accelerators go idle for minutes at a time, which is far below the smallest unit it can see.",
          "The wasted figure is deliberately a linear function of occupancy, and it is a ranking, not an accounting figure. You rent the whole card either way; fractional occupancy does not map to fractional dollars in any rigorous sense. It orders nodes by how much of their cost is not doing work, which is the decision the reaper needs and the one a finance report cannot make.",
        ],
      },
      {
        num: "/05",
        heading: "Twenty defects, and the half that mattered more",
        paragraphs: [
          "Nothing in the repository had ever run against AWS. Ten defects made deployment outright impossible: the kubectl provider validates its configuration at plan time rather than deferring like the kubernetes and helm providers, so a fresh apply died before creating anything; a for_each iterated one resource to build another, which requires keys that cannot be known until apply; the Kueue chart pinned a version registry.k8s.io has since pruned; and every GPU workload ran a profiling tool that refuses to start unless its build CUDA version matches the driver's, exiting 253 on the current NVIDIA AMI without doing any work.",
          "Two were quiet in a way worth naming. Targeting the EKS module in a staged apply does not pull in the NAT gateway or the private route tables, because the cluster does not depend on them, so nodes booted with no egress, never registered, and the node group sat in CREATING for the full timeout with an empty health issues list. And AWSServiceRoleForEC2Spot does not exist on a fresh account, where Karpenter does not raise an error but silently launches on-demand instead, which voids both the spot savings the project measures and the interruption demo entirely.",
          "The other half were worse, because they were the tests. Every demo act asserted something adjacent to its claim rather than the claim itself. Act one waited for a node to reach Ready and never looked at the workload, so it passed against a cluster where the node came up, advertised its card, and every job on it died instantly. Act three filtered events for a reason string Kueue no longer emits, so its table was always empty. Act four compared a node that had no GPU and passed in one second with an after state identical to its before. Act six printed twenty lines of a collector saying it had no data and called that a demonstration.",
          "The last one is the one that would have cost money. make destroy never passed a required variable, so it deleted the GPU node claims, died, and left an EKS cluster and its GPU nodes running while printing what looks like an ordinary teardown hiccup.",
        ],
      },
      {
        num: "/06",
        heading: "Outcome",
        paragraphs: [
          "All six acts pass against real hardware, and each now fails if the thing it claims is not happening. Cold start to a Ready spot GPU node in 47 seconds with the workload running 41 seconds later, quota admitting two of twelve with both running concurrently across tenants and the rest queued, a real preemption with the victim requeued, time-slicing taking one physical card to four schedulable replicas, and a FIS-driven spot interruption that Karpenter cordoned in 14 seconds through the interruption queue rather than a hard kill.",
          "Then destroyed and verified empty rather than assumed: no clusters, instances, VPCs, NAT gateways, elastic IPs, queues or experiment templates. A leaked VPC-CNI interface from a terminated node held the subnet and had to be removed by hand, which is now documented along with a resume path for a teardown that dies partway, since the Kubernetes providers cannot configure themselves once the cluster has left state.",
        ],
      },
    ],
    stack: [
      "Amazon EKS",
      "Karpenter",
      "Kueue",
      "NVIDIA GPU Operator",
      "DCGM",
      "Prometheus",
      "EC2 Spot",
      "Fault Injection Simulator",
      "DynamoDB",
      "Terraform",
    ],
    repo: "https://github.com/jordann6/gpu-platform",
    receipt: {
      rows: [
        { k: "Provisioned", v: "111 resources across three apply stages: VPC with NAT, EKS 1.31, Karpenter GPU NodePool on spot, GPU Operator, Kueue, Prometheus, FinOps collector on DynamoDB" },
        { k: "Scaled", v: "Spot GPU node from zero to Ready in 47s, workload running 41s later, reclaimed automatically when the queue drained" },
        { k: "Measured", v: "GPU_UTIL 100% against SM_ACTIVE 45.82% on the same card at the same moment, $0.016805 of $0.031017 attributed to idle silicon" },
        { k: "Queued", v: "2 of 12 admitted to quota with both running concurrently across two tenants, the rest queued rather than oversubscribed" },
        { k: "Preempted", v: "A high-priority job evicted a low-priority one, which requeued rather than dying" },
        { k: "Interrupted", v: "A real FIS spot interruption cordoned in 14s via CordonAndDrain through Karpenter's interruption queue, not a TerminateInstances call" },
        { k: "Live fixes", v: "20 defects on first contact with AWS: 10 blocked deployment, 10 were demo acts passing while proving nothing" },
        { k: "Corrected claim", v: "SM_ACTIVE is not in dcgm-exporter's default metric set, so the cost attribution this project is built on had never recorded a single sample" },
        { k: "Teardown", v: "Destroyed and verified empty; a leaked VPC-CNI ENI held the subnet and is now documented with a resume path" },
      ],
      total: { k: "Total cost", v: "About $8" },
    },
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
