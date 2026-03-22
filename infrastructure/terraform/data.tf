data "aws_route53_zone" "primary" {
  zone_id = var.hosted_zone_id
}