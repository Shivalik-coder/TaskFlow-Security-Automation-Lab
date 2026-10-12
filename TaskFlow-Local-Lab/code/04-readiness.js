// JavaScript / Run Once for All Items.
const stages = ['inventory','roadmap','testEnvironment','hybridTest','production'];
const next = [
  'Identify cryptographic assets, scope and owner',
  'Document the vendor roadmap or internal migration decision',
  'Prepare a non-production test environment',
  'Run hybrid/PQC compatibility, performance and rollback tests',
  'Prepare an approved production change and verification plan'
];
return $input.all().map((item, i) => {
  const s = item.json, evidence = s.evidence || {};
  let score = 0;
  for (const field of stages) {
    if (typeof evidence[field] !== 'string' || !evidence[field].trim()) break;
    score++;
  }
  if (s.simulated === true) score = Math.min(score, 4);
  const blockers = Array.isArray(s.blockers) ? s.blockers : [];
  const readinessStatus = blockers.length ? 'Blocked' : score === 5 ? 'Migrated' :
    score === 0 ? 'Unknown' :
    s.vendorControlled && score < 4 ? 'Vendor-dependent' :
    score >= 3 ? 'Testing' : 'Inventoried';
  const finding = score < 5 || blockers.length ? {
    dedupeKey: 'readiness:' + s.id, ruleId: 'readiness', assetId: s.id,
    title: 'Plan next PQC step: ' + s.service,
    priority: 'MEDIUM', owner: s.owner || 'Security',
    reason: blockers.length ? blockers.join('; ') : next[score],
    observedAt: new Date().toISOString()
  } : null;
  return {json: {...s, score, readinessStatus, finding,
    assessedAt: new Date().toISOString()}, pairedItem: {item: i}};
});
