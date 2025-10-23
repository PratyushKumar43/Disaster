const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function startDevelopment() {
    colorLog('🚀 Starting DisasterIQ Development Environment...', 'green');
    colorLog('📦 Backend will run on http://localhost:5000', 'yellow');
    colorLog('🌐 Frontend will run on http://localhost:3000', 'yellow');
    console.log('');

    const projectRoot = __dirname;
    const backendPath = path.join(projectRoot, 'backend');
    const frontendPath = path.join(projectRoot, 'Frontend');

    // Determine npm command based on OS
    const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

    // Start backend
    colorLog('🔧 Starting Backend Server...', 'cyan');
    const backendProcess = spawn(npmCmd, ['run', 'dev'], {
        cwd: backendPath,
        stdio: 'pipe'
    });

    // Start frontend
    colorLog('⚛️ Starting Frontend Server...', 'magenta');
    const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
        cwd: frontendPath,
        stdio: 'pipe'
    });

    // Handle backend output
    backendProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            colorLog(`[BACKEND] ${output}`, 'blue');
        }
    });

    backendProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            colorLog(`[BACKEND ERROR] ${output}`, 'red');
        }
    });

    // Handle frontend output
    frontendProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            colorLog(`[FRONTEND] ${output}`, 'green');
        }
    });

    frontendProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            colorLog(`[FRONTEND ERROR] ${output}`, 'red');
        }
    });

    // Handle process errors
    backendProcess.on('error', (err) => {
        colorLog(`❌ Backend process error: ${err.message}`, 'red');
    });

    frontendProcess.on('error', (err) => {
        colorLog(`❌ Frontend process error: ${err.message}`, 'red');
    });

    // Handle process exits
    backendProcess.on('exit', (code) => {
        colorLog(`🔴 Backend process exited with code ${code}`, 'red');
    });

    frontendProcess.on('exit', (code) => {
        colorLog(`🔴 Frontend process exited with code ${code}`, 'red');
    });

    // Cleanup function
    const cleanup = () => {
        console.log('');
        colorLog('🛑 Stopping servers...', 'red');
        
        backendProcess.kill('SIGTERM');
        frontendProcess.kill('SIGTERM');
        
        setTimeout(() => {
            backendProcess.kill('SIGKILL');
            frontendProcess.kill('SIGKILL');
        }, 5000);
        
        colorLog('✅ Servers stopped successfully!', 'green');
        process.exit(0);
    };

    // Handle termination signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

    colorLog('✅ Both servers are starting...', 'green');
    colorLog('📝 Press Ctrl+C to stop both servers', 'red');
    console.log('');
}

// Start the development environment
startDevelopment();