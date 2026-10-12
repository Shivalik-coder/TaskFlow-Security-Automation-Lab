// Run Once for Each Item. Input is one proposed task, not an array.
const t = $json;
for (const k of ['dedupeKey','ruleId','assetId','title','owner','reason']) {
  if (typeof t[k] !== 'string' || !t[k].trim()) {
    throw new Error('Missing task field: ' + k);
  }
}
if (!['LOW','MEDIUM','HIGH','CRITICAL'].includes(t.priority)) {
  throw new Error('Invalid priority');
}
return { json: { ...t, observedAt: t.observedAt || new Date().toISOString() } };
