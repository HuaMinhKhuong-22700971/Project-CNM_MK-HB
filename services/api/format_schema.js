const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const modelMap = {
  'addresses': 'Address',
  'ai_chats': 'AiChat',
  'ai_messages': 'AiMessage',
  'attribute_values': 'AttributeValue',
  'attributes': 'Attribute',
  'brands': 'Brand',
  'cart_items': 'CartItem',
  'carts': 'Cart',
  'categories': 'Category',
  'compatibility_rules': 'CompatibilityRule',
  'order_items': 'OrderItem',
  'orders': 'Order',
  'pc_build_items': 'PcBuildItem',
  'pc_builds': 'PcBuild',
  'product_skus': 'ProductSku',
  'product_variants': 'ProductVariant',
  'products': 'Product',
  'roles': 'Role',
  'shipments': 'Shipment',
  'sku_attributes': 'SkuAttribute',
  'ticket_messages': 'TicketMessage',
  'tickets': 'Ticket',
  'users': 'User',
  'warranties': 'WarrantyItem'
};

const lines = schema.split('\n');
const newLines = [];
let currentModel = null;
let currentTableName = null;

// Ensure output is defined properly at top level
let hasModifiedGenerator = false;

lines.forEach(line => {
    // Inject output path into generator block
    if (line.match(/^\s*provider\s*=\s*"prisma-client-js"/)) {
        newLines.push(line);
        if (!hasModifiedGenerator) {
             newLines.push('  output   = "../src/generated/client"');
             hasModifiedGenerator = true;
        }
        return;
    }

    const modelMatch = line.match(/^model\s+([a-z_]+)\s*\{/i);
    if (modelMatch) {
        currentTableName = modelMatch[1].toLowerCase();
        
        currentModel = modelMap[currentTableName] || currentTableName;
        newLines.push(`model ${currentModel} {`);
        return;
    }

    if (currentModel) {
        if (line.trim().startsWith('@@map(')) return;

        if (line.trim() === '}') {
            newLines.push(`  @@map("${currentTableName}")`);
            newLines.push('}');
            currentModel = null;
            return;
        }

        let parts = line.split('@'); // Split at any attributes (e.g., @id, @relation)
        
        // Ensure we only replace table names in the definition part, ignoring string mappings
        Object.keys(modelMap).sort((a, b) => b.length - a.length).forEach(snakeName => {
            const pascalName = modelMap[snakeName];
            const regex = new RegExp(`\\b${snakeName}\\b`, 'g');
            // Safe replacement only before the first `@` attribute
            parts[0] = parts[0].replace(regex, pascalName);
        });

        // We only modify parts[0], and we leave @map, @relation, etc intact!
        newLines.push(parts.join('@'));
    } else {
        newLines.push(line);
    }
});

fs.writeFileSync(schemaPath, newLines.join('\n'));
console.log('Schema flawlessly formatted to PascalCase!');
