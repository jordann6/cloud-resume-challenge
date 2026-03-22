resource "aws_s3_bucket" "resume_site" {
  bucket = var.bucket_name

  tags = merge(
    var.tags,
    {
      Name = var.bucket_name
    }
  )
}

resource "aws_s3_bucket_public_access_block" "resume_site" {
  bucket = aws_s3_bucket.resume_site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
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
