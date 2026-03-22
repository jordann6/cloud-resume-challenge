resource "aws_route53_record" "site_alias_a" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.resume_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.resume_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}
