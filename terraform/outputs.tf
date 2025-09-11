output "instance_public_ip" {
  value = aws_instance.earnings_tracker_app.public_ip
  description = "Public IP address of the EC2 instance"
}

output "instance_public_dns" {
  value = aws_instance.earnings_tracker_app.public_dns
  description = "Public DNS name of the EC2 instance"
}

output "route53_nameservers" {
  value       = aws_route53_zone.studiopaulinka.name_servers
  description = "Route53 nameservers - configure these in OVH.pl for studiopaulinka.pl domain"
}

output "hosted_zone_id" {
  value       = aws_route53_zone.studiopaulinka.zone_id
  description = "Route53 hosted zone ID"
}

output "moje_subdomain_fqdn" {
  value       = aws_route53_record.moje_subdomain.fqdn
  description = "Fully qualified domain name for moje.studiopaulinka.pl"
}
