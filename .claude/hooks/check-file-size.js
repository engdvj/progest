// Hook PreToolUse — bloqueia edição de arquivos acima do limite de linhas.
// Roda antes de cada Edit/Write. exit 2 bloqueia e passa o erro ao Claude.
const fs = require('fs');
const path = require('path');

const LIMITS = [
  { pattern: '.route.ts',    limit: 100 },
  { pattern: '.handler.ts',  limit: 100 },
  { pattern: '.provider.ts', limit: 150 },
  { pattern: '.service.ts',  limit: 200 },
  { pattern: '.module.ts',   limit: 80  },
  { pattern: '.test.ts',     limit: 350 },
  { pattern: '.ts',          limit: 250 },
  { pattern: '.js',          limit: 250 },
];

function getLimit(filePath) {
  const basename = path.basename(filePath);
  for (const { pattern, limit } of LIMITS) {
    if (basename.endsWith(pattern)) return limit;
  }
  return 300;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const filePath = data?.tool_input?.file_path;
  if (!filePath || !fs.existsSync(filePath)) process.exit(0);

  const ext = path.extname(filePath);
  if (!['.ts', '.js'].includes(ext)) process.exit(0);

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;
  const limit = getLimit(filePath);

  if (lines > limit) {
    process.stderr.write(
      `BLOQUEADO: ${path.basename(filePath)} tem ${lines} linhas (limite: ${limit}).\n` +
      `Proponha uma extração de módulos antes de editar. Consulte o CLAUDE.md.\n`
    );
    process.exit(2);
  }

  process.exit(0);
}

main();
