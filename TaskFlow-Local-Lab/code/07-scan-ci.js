// Run Once for All Items. Only run on the valid=true branch.
const p=$input.first().json;
// This is a policy-controlled local simulation, not payload-controlled policy.
const enforce=false;
const pattern=/\b(RSA(?:-\d+)?|RS256|PS256|ES256|ECDSA|ECDHE|Ed25519|X25519)\b/gi;
const findings=[];
for(const file of p.files){
 const matches=[...new Set((file.content.match(pattern)||[]).map(s=>s.toUpperCase()))];
 for(const algorithm of matches) findings.push({
  dedupeKey:'ci:'+p.repository+':'+p.headSha+':'+file.path+':'+algorithm,
  ruleId:'ci-crypto-review',assetId:p.repository+':'+file.path,
  title:'Review '+algorithm+' in '+file.path,priority:'MEDIUM',owner:'Security',
  reason:'Pattern match in supplied mock source text; confirm actual use and approved exceptions',
  observedAt:new Date().toISOString(),evidence:{headSha:p.headSha,algorithm,path:file.path}
 });
}
return [{json:{...p,findings,decision:findings.length?(enforce?'simulated-block':'review-required'):'no-pattern-found',
 checkId:'ci-'+p.pullRequest+'-'+p.headSha,mode:enforce?'enforce':'review'}}];
