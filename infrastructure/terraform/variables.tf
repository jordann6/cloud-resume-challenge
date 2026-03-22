variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "table_name" {
  description = "The name of the DynamoDB table"
  type        = string
  default     = "VisitorCount"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)

  default = {
    Project     = "Cloud Resume Challenge"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "jordandesigns.io"
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone name"
  type        = string
  default     = "jordandesigns.io"
}

variable "bucket_name" {
  description = "S3 bucket name for frontend site"
  type        = string
  default     = "jordandesigns.io"
}

variable "default_root_object" {
  description = "Default root object for CloudFront"
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}
variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for jordandesigns.io"
  type        = string
}
variable "cache_policy_id" {
  description = "CloudFront cache policy used for the resume site"
  type        = string
}
