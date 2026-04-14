#!/usr/bin/env node
// Hook Stop — a cada 5 commits feitos, lembra Claude de revisar e atualizar as memórias.
// Lê .claude/hooks/.commit-count; na 5ª conclusão reseta e injeta o lembrete (exit 2).

const fs = require('fs');
const path = require('path');

const THRESHOLD = 5;
const COUNTER_FILE = path.join(__dirname, '.commit-count');

function readCount() {
  try { return parseInt(fs.readFileSync(COUNTER_FILE, 'utf8').trim(), 10) || 0; }
  catch { return 0; }
}

function writeCount(n) {
  fs.writeFileSync(COUNTER_FILE, String(n), 'utf8');
}

const count = readCount();

if (count >= THRESHOLD) {
  writeCount(0);
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `[memory-reminder] ${count} conclusões registradas. Antes de encerrar: verifique se há decisões, feedbacks ou regras novas desta sessão para registrar em .claude/memory/ e CLAUDE.md. Se houver, atualize os arquivos relevantes e faça commit. Se não houver nada novo, responda normalmente ao usuário.`,
  }));
  process.exit(2);
} else {
  process.exit(0);
}
