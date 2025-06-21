provider "aws" {
  region = var.aws_region
}
resource "aws_dynamodb_table" "visitor_count" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = var.tags
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_dynamodb_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy_attachment" "lambda_dynamo_access" {
  name       = "attach-lambda-dynamo-policy"
  roles      = [aws_iam_role.lambda_exec_role.name]
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_lambda_function" "visitor_counter" {
  function_name = "VisitorCounter"
  runtime       = "python3.11"
  handler       = "lambda_function.lambda_handler"
  role          = aws_iam_role.lambda_exec_role.arn
  filename      = "${path.module}/../../backend/lambda_function.zip"

  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }
}


resource "aws_apigatewayv2_api" "visitor_api" {
  name          = "visitor-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                  = aws_apigatewayv2_api.visitor_api.id
  integration_type        = "AWS_PROXY"
  integration_uri         = aws_lambda_function.visitor_counter.invoke_arn
  integration_method      = "POST"
  payload_format_version  = "2.0"
}

resource "aws_apigatewayv2_route" "visitor_route" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "GET /count"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.visitor_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_apigw_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor_counter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor_api.execution_arn}/*/*"
}


output "api_endpoint" {
  value = aws_apigatewayv2_api.visitor_api.api_endpoint
}
