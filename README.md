Cloud Resume Challenge – JordanDesigns.io

The Cloud Resume Challenge showcases a person's ability to turn their resume into a live website using modern cloud technologies. JordanDesigns.io is my implementation of this challenge, originally created by Forrest Brazeal. With the help of his book, documentation, and YouTube videos, I built and deployed this project to sharpen my skills in cloud architecture, DevOps, and automation.

Features

Frontend: Responsive resume site built using HTML, CSS, and JavaScript
Hosting: Static site hosted on AWS S3 with custom domain via Route 53 and global delivery using CloudFront
Backend: Real-time visitor counter implemented using AWS Lambda, API Gateway (REST), and DynamoDB
CI/CD: Continuous deployment pipeline configured with GitHub Actions for automatic S3 updates on push
Infrastructure as Code: All resources managed and provisioned using Terraform
Architecture Diagram

Project Structure

cloud-resume-challenge/
│
├── index.html # Resume website (HTML)
├── style.css # Styling (CSS)
├── script.js # JavaScript for visitor counter
├── lambda_function.py # AWS Lambda function (Python)
├── main.tf # Terraform configuration
├── variables.tf # Terraform variables
├── .github/workflows/ci.yml # GitHub Actions workflow
└── README.md # Project documentation
Deployment Overview

Frontend
Developed in HTML/CSS/JavaScript
Deployed to AWS S3 with public website hosting enabled
Domain registered and managed with Route 53
Served securely via CloudFront
Backend
Visitor counter hits API Gateway (REST)
Triggers AWS Lambda written in Python
Lambda updates and returns visitor count from DynamoDB
CI/CD
GitHub Actions workflow auto-deploys on push to main
Syncs files to the S3 bucket using s3-sync-action
Infrastructure
All cloud resources are provisioned with Terraform in a reproducible and version-controlled setup
Contact

Email: jordandn6@outlook.com
GitHub: github.com/jordann6
LinkedIn: linkedin.com/in/jordan-nelson-aa0828165
