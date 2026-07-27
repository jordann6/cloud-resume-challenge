resource "aws_acm_certificate" "resume_cert" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.domain_name}-acm"
    }
  )
}

# DNS validation for every name on the cert. allow_overwrite because the apex
# validation CNAME already exists in the zone from the original cert.
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.resume_cert.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id         = data.aws_route53_zone.primary.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.value]
  ttl             = 60
  allow_overwrite = true
}

# Blocks the CloudFront update until the cert is actually ISSUED; attaching a
# PENDING_VALIDATION cert to the distribution fails.
resource "aws_acm_certificate_validation" "resume_cert" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.resume_cert.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
