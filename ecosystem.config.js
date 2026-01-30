module.exports = {
  apps: [
    {
      name: 'pturtor',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/clawd/pturtor',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://pturtor:pturtor@localhost:5432/pturtor',
        NEXTAUTH_URL: 'http://52.221.194.126',
        NEXTAUTH_SECRET: 'pturtor-super-secret-key-2024-change-this',
      },
      error_file: '/home/ubuntu/.pm2/logs/pturtor-error.log',
      out_file: '/home/ubuntu/.pm2/logs/pturtor-out.log',
      log_file: '/home/ubuntu/.pm2/logs/pturtor-combined.log',
      time: true,
    },
  ],
}
