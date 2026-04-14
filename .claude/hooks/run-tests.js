// Hook PostToolUse (async) — roda o teste relacionado ao arquivo editado.
// Não bloqueia; apenas reporta resultado no contexto da sessão.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findBackendRoot(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const marker = 'botzap/backend/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) return null;
  return filePath.substring(0, idx + marker.length - 1);
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const filePath = data?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  if (!['.ts', '.js'].includes(ext)) process.exit(0);

  const backendRoot = findBackendRoot(filePath);
  if (!backendRoot) process.exit(0);

  // Se o arquivo editado já é um teste, roda ele diretamente.
  // Senão, tenta encontrar o teste correspondente.
  let testFile = filePath;
  if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, ext);
    const candidate = path.join(dir, '__tests__', `${base}.test${ext}`);
    if (!fs.existsSync(candidate)) process.exit(0);
    testFile = candidate;
  }

  try {
    execSync(`npm test -- "${testFile}"`, {
      stdio: 'inherit',
      timeout: 30000,
      cwd: backendRoot,
    });
  } catch {
    // Falha reportada pelo vitest no stdout — não precisa fazer nada aqui
  }

  process.exit(0);
}

main();
