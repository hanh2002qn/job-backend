const fs = require('fs');
const path = require('path');

const swaggerData = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

const outDir = path.join(__dirname, 'docs', 'frontend-integration');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to resolve $ref
function resolveRef(ref) {
  if (!ref) return null;
  const parts = ref.split('/');
  let current = swaggerData;
  for (let i = 1; i < parts.length; i++) {
    current = current[parts[i]];
    if (!current) return null;
  }
  return current;
}

// Helper to get type from schema
function getType(schema) {
  if (!schema) return 'any';
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref);
    if (resolved && resolved.enum) {
      return `enum (${resolved.enum.join(' | ')})`;
    }
    return schema.$ref.split('/').pop();
  }
  if (schema.type === 'array' && schema.items) {
    return `Array<${getType(schema.items)}>`;
  }
  return schema.type || 'any';
}

function generateSchemaTable(schemaOrRef, depth = 0) {
  if (depth > 3) return `> Max nesting depth reached\n`;
  let schema = schemaOrRef;
  if (schema.$ref) {
    schema = resolveRef(schema.$ref);
  }

  if (!schema) return `> Unknown Schema\n`;

  if (schema.type === 'array') {
    return generateSchemaTable(schema.items, depth);
  }

  if (schema.type !== 'object' && !schema.properties && !schema.allOf) {
    return `Type: \`${getType(schema)}\`\n`;
  }

  let props = schema.properties || {};
  let requiredFields = schema.required || [];

  if (schema.allOf) {
    schema.allOf.forEach((part) => {
      let resolvedPart = part.$ref ? resolveRef(part.$ref) : part;
      if (resolvedPart && resolvedPart.properties) {
        props = { ...props, ...resolvedPart.properties };
      }
      if (resolvedPart && resolvedPart.required) {
        requiredFields = [...requiredFields, ...resolvedPart.required];
      }
    });
  }

  if (Object.keys(props).length === 0) {
    return `\`Any Object\`\n`;
  }

  let table = `| Field | Type | Required | Description |\n`;
  table += `| --- | --- | --- | --- |\n`;

  for (const [key, value] of Object.entries(props)) {
    const isRequired = requiredFields.includes(key);
    let typeStr = getType(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let desc = value.description ? value.description.replace(/\n/g, ' ') : '';

    table += `| \`${key}\` | \`${typeStr}\` | ${isRequired ? '✅' : '❌'} | ${desc} |\n`;
  }

  return table;
}

// Group operations by tag
const tagsMap = {};

Object.entries(swaggerData.paths).forEach(([url, methods]) => {
  Object.entries(methods).forEach(([method, operation]) => {
    const tags = operation.tags || ['General'];
    tags.forEach((tag) => {
      if (!tagsMap[tag]) {
        tagsMap[tag] = [];
      }
      tagsMap[tag].push({ url, method: method.toUpperCase(), operation });
    });
  });
});

for (const [tag, operations] of Object.entries(tagsMap)) {
  const filename = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
  const filepath = path.join(outDir, filename);

  let md = `# Integration Guide: ${tag} Module\n\n`;
  md += `This document provides frontend integration details for the **${tag}** module.\n\n`;

  md += `## Endpoints\n\n`;

  operations.forEach(({ url, method, operation }) => {
    md += `### ${operation.summary || 'Endpoint'} \n`;
    md += `> **${method}** \`${url}\`\n\n`;

    if (operation.description) {
      md += `${operation.description}\n\n`;
    }

    if (operation.security && operation.security.length > 0) {
      md += `🛡️ **Requires Authentication**: Yes (Bearer Token)\n\n`;
    }

    // Parameters (Path, Query)
    if (operation.parameters && operation.parameters.length > 0) {
      md += `#### Parameters (Path / Query)\n`;
      md += `| Name | In | Required | Type | Description |\n`;
      md += `| --- | --- | --- | --- | --- |\n`;
      operation.parameters.forEach((p) => {
        md += `| \`${p.name}\` | \`${p.in}\` | ${p.required ? '✅' : '❌'} | \`${getType(p.schema)}\` | ${p.description || ''} |\n`;
      });
      md += `\n`;
    }

    // Request Body
    if (operation.requestBody) {
      md += `#### Request Body\n`;
      if (operation.requestBody.description) {
        md += `${operation.requestBody.description}\n\n`;
      }
      const content = operation.requestBody.content;
      if (content && content['application/json']) {
        const schema = content['application/json'].schema;
        md += generateSchemaTable(schema) + `\n`;
      } else if (content && content['multipart/form-data']) {
        md += `**Content-Type**: \`multipart/form-data\`\n\n`;
        md += generateSchemaTable(content['multipart/form-data'].schema) + `\n`;
      }
    }

    // Responses
    md += `#### Responses\n`;
    if (operation.responses) {
      Object.entries(operation.responses).forEach(([code, res]) => {
        md += `**${code}**: ${res.description || ''}\n`;
        const content = res.content;
        if (content && content['application/json']) {
          const schema = content['application/json'].schema;
          md += `\n` + generateSchemaTable(schema) + `\n\n`;
        }
      });
    }

    md += `\n---\n\n`;
  });

  fs.writeFileSync(filepath, md);
  console.log('Created: ' + filepath);
}

console.log('Done generating detailed docs for ' + Object.keys(tagsMap).length + ' modules.');
