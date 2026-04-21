import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = '/nighttube';
const outDir = 'out';

// Function to recursively find HTML files
function findHtmlFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findHtmlFiles(fullPath, files);
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to fix asset paths in HTML content
function fixAssetPaths(content) {
  // Fix CSS, JS, and other asset paths that start with /_next
  return content.replace(/href="\/(_next[^"]*)"/g, `href="${basePath}/$1"`)
                .replace(/src="\/(_next[^"]*)"/g, `src="${basePath}/$1"`);
}

// Find and fix all HTML files
const htmlFiles = findHtmlFiles(outDir);

for (const file of htmlFiles) {
  console.log(`Fixing paths in ${file}`);
  const content = fs.readFileSync(file, 'utf8');
  const fixedContent = fixAssetPaths(content);
  fs.writeFileSync(file, fixedContent);
}

console.log('Asset paths fixed for GitHub Pages subpath deployment');