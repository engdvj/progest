#!/usr/bin/env node
// Hook PostToolUse/Bash — detecta git commit e incrementa o contador de conclusões.
// Não produz saída — só atualiza .claude/hooks/.commit-count.

const fs = require('fs');
const path = require('path');

const COUNTER_FILE = path.join(__dirname, '.commit-count');

function readCount() {
  try { return parseInt(fs.readFileSync(COUNTER_FILE, 'utf8').trim(), 10) || 0; }
  catch { return 0; }
}

function writeCount(n) {
  fs.writeFileSync(COUNTER_FILE, String(n), 'utf8');
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const command = data?.tool_input?.command ?? '';
    // Detecta git commit real (não --amend, não git status etc.)
    if (/git\s+commit\b/.test(command) && !command.includes('--dry-run')) {
      writeCount(readCount() + 1);
    }
  } catch {
    // JSON inválido ou stdin vazio — ignora
  }
  process.exit(0);
});
