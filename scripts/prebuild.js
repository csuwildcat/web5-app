
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const docPath = path.join(process.cwd(), 'node_modules/@tbd54566975/web5/README.md');
const outputPath = path.join(process.cwd(), 'public', 'docs.html');

fs.readFile(docPath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading markdown file: ${docPath}`, err);
    process.exit(1);
  }

  const result = md.render(data);

  fs.writeFile(outputPath, result, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing HTML file: ${outputPath}`, err);
      process.exit(1);
    }

    console.log(`Markdown converted to HTML successfully: ${outputPath}`);
  });
});