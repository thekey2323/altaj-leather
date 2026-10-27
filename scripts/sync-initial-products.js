const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
let initialDataContent = fs.readFileSync('lib/db/initialData.ts', 'utf8');

// Replace export const INITIAL_PRODUCTS: Product[] = [...];
const startTag = 'export const INITIAL_PRODUCTS: Product[] = [';
const startIndex = initialDataContent.indexOf(startTag);

if (startIndex !== -1) {
  // Find matching closing bracket
  let depth = 0;
  let endIndex = -1;
  const fromStart = initialDataContent.substring(startIndex + startTag.length - 1);
  for (let i = 0; i < fromStart.length; i++) {
    if (fromStart[i] === '[') depth++;
    if (fromStart[i] === ']') {
      depth--;
      if (depth === 0) {
        endIndex = startIndex + startTag.length - 1 + i + 1; // including ];
        if (fromStart[i + 1] === ';') endIndex++;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    const newDeclaration = `export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(prods, null, 2)};`;
    const updated = initialDataContent.substring(0, startIndex) + newDeclaration + initialDataContent.substring(endIndex);
    fs.writeFileSync('lib/db/initialData.ts', updated, 'utf8');
    console.log('Successfully updated INITIAL_PRODUCTS in lib/db/initialData.ts!');
  } else {
    console.error('Could not find closing bracket of INITIAL_PRODUCTS');
  }
} else {
  console.error('Could not find INITIAL_PRODUCTS start tag');
}
