// Run Once for Each Item. Upstream node is Find task (full HTTP response).
// The earlier Code node MUST be named Validate task.
const t = $('Validate task').item.json;
const rows = $json.body;
if (!Array.isArray(rows)) throw new Error('Task lookup is not an array');
if (rows.length > 1) throw new Error('Duplicate dedupeKey; repair lab data');
const old = rows[0];
const rank = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
const body = {
  ...t, evidence: {...(old?.evidence || {}), ...(t.evidence || {})},
  status: 'open', lastSeenAt: t.observedAt,
  createdAt: old ? old.createdAt : t.observedAt
};
// A previously closed task reopens only because a detector found it again.
const notify = !old || old.status === 'closed' || rank[t.priority] > rank[old.priority];
return { json: { existingId: old ? old.id : null, body, notify } };
