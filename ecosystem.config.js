module.exports = {
  apps: [
    {
      name: 'tug_of_war',
      script: '.venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 3250',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      max_memory_restart: '300M',
      kill_timeout: 3000,
    },
  ],
};
