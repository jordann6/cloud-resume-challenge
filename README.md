# Cloud Resume Challenge — [jordandesigns.io](https://jordandesigns.io)

Portfolio site built as an implementation of Forrest Brazeal's Cloud Resume Challenge. Serverless architecture on AWS with automated deployments, real-time visitor tracking, and all infrastructure defined in Terraform.

## Architecture

**Frontend:** HTML, CSS, and JavaScript served from S3 through CloudFront with TLS enforcement and custom domain via Route 53.

**Backend:** Visitor counter powered by API Gateway (REST), Lambda (Python), and DynamoDB. Counter displays on success and hides silently on failure.

**CI/CD:** GitHub Actions pipeline syncs to S3 and invalidates CloudFront cache on every push to main.

**Infrastructure as Code:** All AWS resources provisioned and managed with Terraform.

## Project Structure

```
cloud-resume-challenge/
├── index.html              # Portfolio site
├── main.css                # Styling
├── index.js                # Visitor counter logic
├── assets/                 # Cert badges, diagrams
├── backend/
│   ├── lambda_function.py  # Visitor counter Lambda
│   └── uptime_checker.py   # Uptime monitor Lambda
├── infrastructure/
│   └── terraform/          # All IaC definitions
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
└── README.md
```

## Deployment

Push to `main` triggers the full pipeline:

1. GitHub Actions checks out the repo
2. Syncs site files to S3 with cache headers
3. Invalidates CloudFront distribution to serve latest content

## Tech Stack

S3, CloudFront, Route 53, Lambda, API Gateway, DynamoDB, Terraform, GitHub Actions

## Contact

**Email:** jordandn6@outlook.com
**GitHub:** [github.com/jordann6](https://github.com/jordann6)
**LinkedIn:** [linkedin.com/in/jordan-nelson-aa0828165](https://linkedin.com/in/jordan-nelson-aa0828165)
**Portfolio:** [jordandesigns.io](https://jordandesigns.io)
