resource "aws_s3_bucket" "resume_site" {
  bucket = var.bucket_name

  tags = merge(
    var.tags,
    {
      Name = var.bucket_name
    }
  )
}

# CloudFront standard access logs. Kept 90 days, then expired, so the bucket
# stays effectively free while still answering "who hit the site and what did
# the edge return?"
resource "aws_s3_bucket" "cdn_logs" {
  bucket = "${var.bucket_name}-cdn-logs"

  tags = merge(
    var.tags,
    {
      Name = "${var.bucket_name}-cdn-logs"
    }
  )
}

resource "aws_s3_bucket_public_access_block" "cdn_logs" {
  bucket = aws_s3_bucket.cdn_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront's log delivery writes with an ACL grant, so this bucket (unlike
# the site bucket) has to keep ACLs enabled.
resource "aws_s3_bucket_ownership_controls" "cdn_logs" {
  bucket = aws_s3_bucket.cdn_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "cdn_logs" {
  bucket     = aws_s3_bucket.cdn_logs.id
  depends_on = [aws_s3_bucket_ownership_controls.cdn_logs]

  access_control_policy {
    # awslogsdelivery, the canonical account CloudFront delivers logs from.
    grant {
      grantee {
        type = "CanonicalUser"
        id   = "c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0"
      }
      permission = "FULL_CONTROL"
    }

    grant {
      grantee {
        type = "CanonicalUser"
        id   = data.aws_canonical_user_id.current.id
      }
      permission = "FULL_CONTROL"
    }

    owner {
      id = data.aws_canonical_user_id.current.id
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cdn_logs" {
  bucket = aws_s3_bucket.cdn_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "cdn_logs" {
  bucket = aws_s3_bucket.cdn_logs.id

  rule {
    id     = "expire-logs"
    status = "Enabled"

    filter {}

    expiration {
      days = 90
    }
  }
}

resource "aws_s3_bucket_public_access_block" "resume_site" {
  bucket = aws_s3_bucket.resume_site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "resume_site" {
  bucket     = aws_s3_bucket.resume_site.id
  depends_on = [aws_s3_bucket_public_access_block.resume_site]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowCloudFrontServicePrincipal"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.resume_site.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.resume_cdn.arn
        }
      }
    }]
  })
}

resource "aws_s3_bucket_versioning" "resume_site" {
  bucket = aws_s3_bucket.resume_site.id

  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "resume_site" {
  bucket = aws_s3_bucket.resume_site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
