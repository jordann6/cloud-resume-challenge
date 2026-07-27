# Replaces the AWS Managed-SecurityHeadersPolicy: same header set, plus a CSP.
# The static export ships React's inline bootstrap payload and Next injects
# inline <style>, so 'unsafe-inline' is required on script-src and style-src;
# a nonce is not available without a request-time render.
resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "resume-security-headers"
  comment = "Managed security headers plus a site-specific CSP"

  security_headers_config {
    content_security_policy {
      override = true
      content_security_policy = join("; ", [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self' 'unsafe-inline' https://assets.calendly.com",
        "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
        "font-src 'self' data:",
        "img-src 'self' data: https://*.calendly.com",
        "connect-src 'self' https://673vy98pwa.execute-api.us-east-1.amazonaws.com https://calendly.com",
        "frame-src https://calendly.com",
        "upgrade-insecure-requests",
      ])
    }

    strict_transport_security {
      override                   = true
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = false
    }

    content_type_options {
      override = true
    }

    frame_options {
      override     = true
      frame_option = "DENY"
    }

    referrer_policy {
      override        = true
      referrer_policy = "strict-origin-when-cross-origin"
    }

    xss_protection {
      override   = true
      protection = true
      mode_block = true
    }
  }
}

resource "aws_cloudfront_origin_access_control" "resume" {
  name                              = "resume-oac"
  description                       = "OAC for resume site S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Rewrites directory-style URIs (e.g. /work/slug/) to their index.html so the
# Next.js static export's nested pages resolve over the private-bucket OAC origin,
# which (unlike the S3 website endpoint) does not do directory indexing.
resource "aws_cloudfront_function" "rewrite_index" {
  name    = "resume-rewrite-index"
  runtime = "cloudfront-js-2.0"
  comment = "Append index.html for directory-style URIs"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var request = event.request;
      var host = request.headers.host ? request.headers.host.value : '';

      // One canonical hostname: www 301s to the apex, query string intact.
      if (host.toLowerCase() === 'www.${var.domain_name}') {
        var qs = '';
        for (var k in request.querystring) {
          qs += (qs ? '&' : '?') + k;
          if (request.querystring[k].value) {
            qs += '=' + request.querystring[k].value;
          }
        }
        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            location: { value: 'https://${var.domain_name}' + request.uri + qs }
          }
        };
      }

      var uri = request.uri;
      if (uri.endsWith('/')) {
        request.uri += 'index.html';
      } else if (!uri.includes('.')) {
        request.uri += '/index.html';
      }
      return request;
    }
  EOT
}

resource "aws_cloudfront_distribution" "resume_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]
  price_class         = var.price_class

  origin {
    domain_name              = aws_s3_bucket.resume_site.bucket_regional_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.resume.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-origin"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = var.cache_policy_id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_index.arn
    }
  }

  # The OAC origin answers a missing key with 403, not 404, so both map to the
  # static export's 404.html. Without this, bad paths render CloudFront's raw
  # AccessDenied XML.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  logging_config {
    bucket          = aws_s3_bucket.cdn_logs.bucket_domain_name
    prefix          = "cloudfront/"
    include_cookies = false
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.resume_cert.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
