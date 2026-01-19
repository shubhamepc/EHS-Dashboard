# Production Security Checklist for EHS System

## Pre-Deployment

### Environment & Secrets
- [ ] All secrets moved to `.env` file
- [ ] `.env` file added to `.gitignore`
- [ ] JWT_SECRET is strong (min 32 characters, generated with `openssl rand -base64 32`)
- [ ] Database credentials are unique and strong
- [ ] SMTP credentials configured
- [ ] `.env.example` created without sensitive values

### Dependencies
- [ ] All npm packages updated to latest stable versions
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Remove unused dependencies
- [ ] Production dependencies only (`npm install --production`)

### Code Security
- [ ] SQL injection protection verified (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Input validation on all endpoints
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] Authentication middleware on protected routes
- [ ] Password hashing with bcrypt (min 8 rounds)

## Server Configuration

### SSL/TLS
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] HTTPS redirect configured
- [ ] TLS 1.2+ only
- [ ] HSTS header enabled
- [ ] Certificate auto-renewal configured

### Nginx
- [ ] Reverse proxy configured
- [ ] Rate limiting enabled
- [ ] Client body size limited (10MB)
- [ ] Gzip compression enabled
- [ ] Security headers configured:
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Referrer-Policy
  - [ ] Content-Security-Policy
- [ ] Access logs enabled
- [ ] Error logs enabled

### Firewall
- [ ] UFW/iptables configured
- [ ] Only necessary ports open (80, 443, 22)
- [ ] SSH port changed from default (optional)
- [ ] Fail2ban installed and configured

### Application
- [ ] NODE_ENV=production
- [ ] PM2 configured for auto-restart
- [ ] PM2 startup script enabled
- [ ] Log rotation configured
- [ ] Upload directory outside web root
- [ ] Proper file permissions (755 for dirs, 644 for files)
- [ ] Application runs as non-root user (www-data)

## Database

### SQLite Security
- [ ] Database file permissions: 640
- [ ] Database owner: www-data
- [ ] Database outside web root
- [ ] Foreign keys enabled
- [ ] WAL mode enabled for concurrency
- [ ] Daily backups configured
- [ ] Backup retention policy set (30 days)
- [ ] Backup integrity verification

### Backup Strategy
- [ ] Automated daily backups (cron)
- [ ] Off-site backup storage configured
- [ ] Backup restoration tested
- [ ] Backup encryption (optional)

## Monitoring & Logging

### Logging
- [ ] Winston logger configured
- [ ] Daily log rotation enabled
- [ ] Error logs separate from access logs
- [ ] Log retention policy (14-30 days)
- [ ] Sensitive data not logged (passwords, tokens)

### Monitoring
- [ ] PM2 monitoring enabled
- [ ] Server resource monitoring (CPU, RAM, Disk)
- [ ] Uptime monitoring configured
- [ ] Error alerting configured
- [ ] Log aggregation (optional: ELK stack)

### Audit
- [ ] Audit logs enabled for all critical actions
- [ ] User activity tracked
- [ ] Failed login attempts logged
- [ ] Admin actions logged

## Network Security

### CORS
- [ ] CORS configured for specific origins only
- [ ] Credentials allowed only for trusted origins
- [ ] Preflight requests handled

### API Security
- [ ] Rate limiting per IP
- [ ] Authentication rate limiting (stricter)
- [ ] Request size limits
- [ ] Timeout configurations
- [ ] API versioning

## File Security

### Uploads
- [ ] File type validation (whitelist)
- [ ] File size limits enforced
- [ ] Filename sanitization
- [ ] Virus scanning (optional: ClamAV)
- [ ] Upload directory not executable
- [ ] Direct access to uploads prevented

## Compliance

### Data Protection
- [ ] GDPR compliance reviewed
- [ ] Data retention policy defined
- [ ] User data deletion process
- [ ] Privacy policy updated
- [ ] Cookie consent implemented

### Access Control
- [ ] Role-based access control (RBAC)
- [ ] Principle of least privilege
- [ ] Admin accounts limited
- [ ] Password policy enforced
- [ ] Session timeout configured

## Post-Deployment

### Testing
- [ ] SSL Labs test (A+ rating)
- [ ] Security headers test
- [ ] Penetration testing
- [ ] Load testing
- [ ] Backup restoration test

### Documentation
- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] Security incident response plan
- [ ] Disaster recovery plan
- [ ] Admin runbook created

### Maintenance
- [ ] Update schedule defined
- [ ] Security patch process
- [ ] Dependency update process
- [ ] Log review schedule
- [ ] Backup verification schedule

## Emergency Contacts

- System Administrator: _______________
- Security Lead: _______________
- Database Admin: _______________
- On-call Engineer: _______________

## Incident Response

1. Identify and contain the incident
2. Notify security team
3. Preserve evidence (logs, backups)
4. Investigate root cause
5. Remediate vulnerability
6. Document incident
7. Review and improve processes

---

**Last Updated:** 2026-01-16
**Reviewed By:** _____________
**Next Review Date:** _____________
