# Route53 Hosted Zone for studiopaulinka.pl
resource "aws_route53_zone" "studiopaulinka" {
  name = "studiopaulinka.pl"

  tags = {
    Name        = "studiopaulinka.pl"
    Environment = "production"
    Project     = "earnings-tracker"
  }
}

# A record for moje.studiopaulinka.pl pointing to EC2 instance
resource "aws_route53_record" "moje_subdomain" {
  zone_id = aws_route53_zone.studiopaulinka.zone_id
  name    = "moje.studiopaulinka.pl"
  type    = "A"
  ttl     = 300
  records = [aws_instance.earnings_tracker_app.public_ip]
}

# WWW subdomain (optional)
resource "aws_route53_record" "www_subdomain" {
  zone_id = aws_route53_zone.studiopaulinka.zone_id
  name    = "www.moje.studiopaulinka.pl"
  type    = "CNAME"
  ttl     = 300
  records = ["moje.studiopaulinka.pl"]
}
