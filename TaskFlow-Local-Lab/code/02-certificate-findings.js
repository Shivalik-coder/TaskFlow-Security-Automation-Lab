// Run Once for All Items; input items are individual certificates.
const now = Date.now(), day = 86400000, out = [];
function utcMs(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(s)) return NaN;
  const ms = Date.parse(s);
  if (!Number.isFinite(ms)) return NaN;
  return new Date(ms).toISOString().replace('.000Z','Z') === s.replace('.000Z','Z') ? ms : NaN;
}
$input.all().forEach((item,i) => {
  const c = item.json, expiry = utcMs(c.expiresAt);
  const remaining = (expiry-now)/day;
  let priority, ruleId, reason;
  if (!Number.isFinite(expiry)) {
    priority='HIGH'; ruleId='certificate-data-quality';
    reason='expiresAt is missing or is not a valid UTC ISO timestamp';
  } else if (remaining >= 30) { return; }
  else {
    ruleId='certificate-expiry';
    priority=remaining<7?'CRITICAL':remaining<14?'HIGH':'MEDIUM';
    reason=remaining<=0?'Certificate is expired':
      'Certificate expires in '+Math.ceil(remaining)+' displayed day(s)';
  }
  out.push({json:{dedupeKey:ruleId+':'+c.id, ruleId, assetId:c.id,
    title:'Review certificate: '+c.name, priority,
    owner:c.owner||'Unassigned', reason, observedAt:new Date(now).toISOString(),
    evidence:{expiresAt:c.expiresAt,daysRemaining:Number.isFinite(remaining)?remaining:null}},
    pairedItem:{item:i}});
});
return out;
