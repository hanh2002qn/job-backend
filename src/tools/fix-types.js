const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const sourceFiles = project.getSourceFiles('src/modules/**/*.controller.ts');

let totalFixed = 0;

for (const sourceFile of sourceFiles) {
  let fileChanged = false;
  const classes = sourceFile.getClasses();

  for (const cls of classes) {
    const methods = cls.getMethods();

    for (const method of methods) {
      // Check if it's a route handler (has @Get, @Post, etc.)
      const decorators = method.getDecorators();
      const isRouteHandler = decorators.some((d) => {
        const name = d.getName();
        return ['Get', 'Post', 'Put', 'Delete', 'Patch', 'All', 'Options'].includes(name);
      });

      if (!isRouteHandler) continue;

      // If it already has an explicit return type, skip
      if (method.getReturnTypeNode()) continue;

      const type = method.getReturnType();
      let typeText = type.getText(method);

      // We only care about adding return types if they are not "any" or "unknown"
      // or if they are "any", replace with something more specific if possible.
      // But typically, the inferred type from the service contains "import("...").Entity".
      if (typeText === 'any' || typeText === 'unknown') {
        // Could not infer anything better. Set as Promise<any> just to have an explicit type,
        // but preferably ignore. Wait, Swagger needs explicit types.
        // Let's at least explicit it.
        typeText = 'Promise<any>';
      }

      // Handle raw `Promise<import(".../entity").Entity>`
      // and nested imports like `Promise<import("...").Entity[]>`
      const importRegex = /import\("([^"]+)"\)\.([a-zA-Z0-9_]+)/g;

      let match;
      while ((match = importRegex.exec(typeText)) !== null) {
        const importPath = match[1];
        const className = match[2];

        // Add import to file if it doesn't exist
        const defaultImports = sourceFile
          .getImportDeclarations()
          .flatMap((d) => d.getNamedImports().map((ni) => ni.getName()));
        if (!defaultImports.includes(className)) {
          // Find a relative path.
          // The inferred importPath is absolute or relative? ts-morph usually yields absolute path without extension or relative to root.
          // Let's just use the absolute path and let ts-morph fix it, or try to import it.
          // But wait, the inferred path is absolute. We need to convert it to relative.
          const path = require('path');
          const fileDir = path.dirname(sourceFile.getFilePath());
          let relPath = path.relative(fileDir, importPath);
          if (!relPath.startsWith('.')) relPath = './' + relPath;
          relPath = relPath.replace(/\.ts$/, '');

          sourceFile.addImportDeclaration({
            moduleSpecifier: relPath,
            namedImports: [className],
          });
          fileChanged = true;
        }
      }

      // Remove the import("...") part from the type text
      const cleanTypeText = typeText.replace(/import\("([^"]+)"\)\./g, '');

      try {
        method.setReturnType(cleanTypeText);
        fileChanged = true;
        totalFixed++;
        console.log(`[${sourceFile.getBaseName()}] Fixed ${method.getName()} -> ${cleanTypeText}`);
      } catch (e) {
        console.error(`Failed to set return type for ${method.getName()}`, e);
      }
    }
  }

  if (fileChanged) {
    sourceFile.saveSync();
  }
}

console.log(`Successfully added explicit return types to ${totalFixed} endpoints.`);
