import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'docs', '.vitepress', 'data', 'terminologyData.json');
const outputDir = path.join(root, 'docs', 'terminology');
const terms = JSON.parse(await readFile(dataPath, 'utf8'));

await mkdir(outputDir, { recursive: true });

for (const term of terms) {
  const filePath = path.join(outputDir, `${term.slug}.md`);
  const content = `---\ntitle: ${JSON.stringify(term.term)}\ndescription: ${JSON.stringify(`${term.term}の用語説明`)}\n---\n\n# ${term.term}\n\n<TermPage slug="${term.slug}" />\n`;

  let current = '';
  try {
    current = await readFile(filePath, 'utf8');
  } catch {
    // The page does not exist yet.
  }

  if (current !== content) {
    await writeFile(filePath, content, 'utf8');
  }
}
