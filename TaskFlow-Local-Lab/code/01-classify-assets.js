// Run Once for All Items; place after Split collection.
const publicKey = /RSA|ECDSA|ECDH|ECC|ED25519|ED448|X25519|X448|^(RS|PS|ES)(256|384|512)$/;
const notPublicKey = /^(AES|SHA|HMAC)/;
const pqcName = /ML-KEM|ML-DSA|SLH-DSA/;
const now = new Date().toISOString();
return $input.all().map((item,i) => {
  const a = item.json;
  const alg = String(a.algorithm || '').trim().toUpperCase();
  let assessmentStatus, quantumRisk, finding = null;
  if (publicKey.test(alg)) {
    assessmentStatus = 'PQC assessment required'; quantumRisk = true;
  } else if (notPublicKey.test(alg)) {
    assessmentStatus = 'Separate symmetric/hash assessment'; quantumRisk = null;
  } else if (pqcName.test(alg)) {
    assessmentStatus = 'PQC-labelled; verify implementation evidence'; quantumRisk = null;
  } else {
    assessmentStatus = 'Unknown algorithm; investigate'; quantumRisk = null;
  }
  if (quantumRisk === true || assessmentStatus.startsWith('Unknown')) {
    finding = {
      dedupeKey: 'crypto-review:' + a.id, ruleId: 'crypto-review',
      assetId: a.id, title: 'Review ' + a.service + ' cryptography',
      priority: 'MEDIUM', owner: a.owner || 'Unassigned',
      reason: assessmentStatus + ' (' + (alg || 'missing') + ')',
      observedAt: now
    };
  }
  return { json: {...a, assessmentStatus, quantumRisk, lastSeenAt: now, finding},
    pairedItem: {item:i} };
});
