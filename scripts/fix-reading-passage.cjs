const fs = require('fs');

function transform(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.match(/stem: `\$\{(P_[A-Z0-9_]+)\}/g) || [];
  const before = matches.length;

  // In the raw .ts file, template literals like `${P_VARNAME}\n\n{question}`
  // have literal backslash+n sequences. The regex below matches:
  //   stem: `${P_VARNAME}\n\n{question}`
  // and replaces with:
  //   stem: `{question}`,
  //   readingPassage: P_VARNAME
  // (the trailing comma for readingPassage comes from the original line's comma after the backtick)
  content = content.replace(
    /stem: `\$\{(P_[A-Z0-9_]+)\}\\n\\n([^`]*)`/g,
    (_, varName, question) => `stem: \`${question}\`,\n    readingPassage: ${varName}`
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`${filePath}: replaced ${before} stem(s)`);
}

transform('c:/Users/yasuy/Documents/githup/coursev_web_frontend/src/infrastructure/api/icfesLC2022Bank.ts');
transform('c:/Users/yasuy/Documents/githup/coursev_web_frontend/src/infrastructure/api/icfesLCBank.ts');
