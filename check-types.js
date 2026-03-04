const ts = require('typescript');
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let files = [];
walkDir('./src/modules', (filePath) => {
  if (filePath.endsWith('.controller.ts')) {
    files.push(filePath);
  }
});

let count = 0;
files.forEach((file) => {
  const src = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member)) {
          // Check if it has routing decorator
          const hasRoutingDecorator = (ts.getDecorators(member) || []).some((d) => {
            const exp = d.expression;
            if (ts.isCallExpression(exp) && ts.isIdentifier(exp.expression)) {
              return ['Get', 'Post', 'Put', 'Delete', 'Patch'].includes(exp.expression.text);
            }
            return false;
          });

          if (hasRoutingDecorator) {
            if (!member.type) {
              console.log(`${file}: ${member.name.getText()}`);
              count++;
            }
          }
        }
      });
    }
  });
});
console.log(`Total missing return types: ${count}`);
