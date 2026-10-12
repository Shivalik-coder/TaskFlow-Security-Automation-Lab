// n8n Code node: JavaScript, Run Once for All Items.
// Upstream HTTP Request: JSON response + Include Response Headers and Status ON.
const rows = $input.first().json.body;
if (!Array.isArray(rows)) throw new Error('Expected an array in response.body');
return rows.map(row => ({ json: row, pairedItem: { item: 0 } }));
