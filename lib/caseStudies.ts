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
    slug: "multi-region-failover",
    num: "03",
    title: "Multi-Region",
    titleOut: "Failover Manager",
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
    num: "21",
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
    num: "22",
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
    num: "24",
    title: "AWS Incident",
    titleOut: "Responder",
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
    titleOut: "Orchestrator",
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
    num: "33",
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
    num: "40",
    title: "GPU Index",
    titleOut: "API",
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
    num: "41",
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
    num: "32",
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
    num: "23",
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
    num: "37",
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
    num: "38",
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
    num: "42",
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
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
