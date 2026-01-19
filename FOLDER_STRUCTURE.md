# Production Folder Structure

```
/var/www/ehs-system/
├── backend/
│   ├── config/
│   │   └── db_sqlite.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── auditController.js
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── reportController.js
│   │   ├── settingsController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── reminderCron.js
│   ├── utils/
│   │   ├── auditLogger.js
│   │   ├── emailService.js
│   │   └── logger.js
│   ├── .env                    # SECRET - Not in git
│   ├── .env.example
│   ├── ecosystem.config.js
│   ├── ehs.sqlite             # Database file
│   ├── package.json
│   ├── server.js
│   └── setup_sqlite.js
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── .next/                 # Build output
│   ├── next.config.js
│   └── package.json
│
└── scripts/
    ├── backup.sh
    └── deploy.sh

/var/www/ehs-uploads/          # Uploads (outside web root)
├── <timestamp>-<filename>

/var/log/ehs-system/           # Application logs
├── combined-2026-01-16.log
├── error-2026-01-16.log
├── pm2-error.log
└── pm2-out.log

/var/backups/ehs-system/       # Database backups
├── ehs_backup_20260116_020000.sqlite.gz
├── ehs_backup_20260117_020000.sqlite.gz
└── ...

/etc/nginx/
├── sites-available/
│   └── ehs-system
└── sites-enabled/
    └── ehs-system -> ../sites-available/ehs-system

/etc/letsencrypt/
└── live/
    └── ehs.shubhamepc.com/
        ├── fullchain.pem
        └── privkey.pem
```

## File Permissions

```bash
# Application files
chown -R www-data:www-data /var/www/ehs-system
chmod 755 /var/www/ehs-system
chmod 644 /var/www/ehs-system/backend/.env

# Database
chmod 640 /var/www/ehs-system/backend/ehs.sqlite
chown www-data:www-data /var/www/ehs-system/backend/ehs.sqlite

# Uploads
chmod 755 /var/www/ehs-uploads
chown -R www-data:www-data /var/www/ehs-uploads

# Logs
chmod 755 /var/log/ehs-system
chown -R www-data:www-data /var/log/ehs-system

# Backups
chmod 700 /var/backups/ehs-system
chown -R root:root /var/backups/ehs-system
```
