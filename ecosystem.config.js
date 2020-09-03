module.exports = { 
    apps: [{ 
        name: "blasebot",
        script: "bot/main.js", 
        error_file: "logs/err.log", 
        out_file: "logs/out.log", 
        log_file: "logs/combined.log", 
        time: true }] };