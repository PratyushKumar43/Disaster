#!/usr/bin/env node

const concurrently = require('concurrently');
const path = require('path');

// Configuration for running both backend and frontend
const commands = [
  {
    command: 'npm run dev',
    name: 'backend',
    cwd: path.join(__dirname, 'backend'),
    prefixColor: 'blue'
  },
  {
    command: 'npm run dev',
    name: 'frontend',
    cwd: path.join(__dirname, 'Frontend'),
    prefixColor: 'green'
  }
];

// Options for concurrently
const options = {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  successCondition: 'first'
};

console.log('🚀 Starting DisasterIQ Development Environment...');
console.log('📦 Backend will run on http://localhost:5000');
console.log('🌐 Frontend will run on http://localhost:3000');
console.log('📝 Press Ctrl+C to stop both servers');
console.log('');

// Run both commands concurrently
concurrently(commands, options)
  .then(
    () => {
      console.log('✅ All processes completed successfully!');
    },
    (error) => {
      console.error('❌ One or more processes failed:', error);
      process.exit(1);
    }
  )
  .catch((error) => {
    console.error('❌ Error running processes:', error);
    process.exit(1);
  });