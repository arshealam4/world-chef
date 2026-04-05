import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../../data');

export function loadJSON(file) {
  return JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
}
