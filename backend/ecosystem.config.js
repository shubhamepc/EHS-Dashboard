module.exports = {
    apps: [
        {
            name: 'ehs-backend',
            script: './server.js',
            instances: 2,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            error_file: '/var/log/ehs-system/pm2-error.log',
            out_file: '/var/log/ehs-system/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_memory_restart: '1G',
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'uploads'],
            max_restarts: 10,
            min_uptime: '10s',
            listen_timeout: 10000,
            kill_timeout: 5000,
            wait_ready: true,
            shutdown_with_message: true
        }
    ]
};
