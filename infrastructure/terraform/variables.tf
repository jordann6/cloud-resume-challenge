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
  }
}
