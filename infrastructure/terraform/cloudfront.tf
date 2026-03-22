resource "aws_cloudfront_distribution" "resume_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_All"

  origin {
    domain_name = "${var.bucket_name}.s3-website-us-east-1.amazonaws.com"
    origin_id   = "${var.bucket_name}.s3.us-east-1.amazonaws.com"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.bucket_name}.s3.us-east-1.amazonaws.com"
    viewer_protocol_policy = "allow-all"
    compress               = true
    cache_policy_id        = var.cache_policy_id
  }


  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.resume_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
