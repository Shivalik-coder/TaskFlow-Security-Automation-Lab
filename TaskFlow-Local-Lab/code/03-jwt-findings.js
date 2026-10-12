// Run Once for All Items. No key material is read or generated.
const now=Date.now(), out=[];
$input.all().forEach((item,i)=>{
 const k=item.json;
 if(!k.useForSigning)return;
 const created=Date.parse(k.createdAt), policy=Number(k.rotationPolicyDays);
 const bad=!Number.isFinite(created)||created>now||(!Number.isFinite(policy)||!(policy>0));
 const age=(now-created)/86400000;
 if(!bad&&age<=policy)return;
 const ruleId=bad?'jwt-data-quality':'jwt-rotation';
 out.push({json:{dedupeKey:ruleId+':'+k.id,ruleId,assetId:k.id,
  title:'Review signing key: '+k.id,priority:'HIGH',owner:k.owner||'Unassigned',
  reason:bad?'Invalid key age or rotation policy':'Signing key exceeds lab age policy',
  observedAt:new Date(now).toISOString(),requestId:'rotate-'+k.id,
  evidence:{ageDays:bad?null:age,rotationPolicyDays:policy}},pairedItem:{item:i}});
});
return out;
