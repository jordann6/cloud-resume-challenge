data "aws_route53_zone" "primary" {
  zone_id = var.hosted_zone_id
}

# Bucket-ACL owner grant for the CloudFront log bucket.
data "aws_canonical_user_id" "current" {}