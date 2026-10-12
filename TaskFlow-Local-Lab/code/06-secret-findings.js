// Run Once for All Items. The records contain metadata, never API key values.
const now=Date.now(),out=[];
$input.all().forEach((item,i)=>{
 const s=item.json,last=Date.parse(s.lastRotated),policy=Number(s.rotationPolicyDays);
 const bad=!Number.isFinite(last)||last>now||(!Number.isFinite(policy)||!(policy>0)), age=(now-last)/86400000;
 if(!bad&&age<=policy)return;
 const ruleId=bad?'secret-data-quality':'secret-rotation';
 out.push({json:{dedupeKey:ruleId+':'+s.id,ruleId,assetId:s.id,
  title:'Review secret metadata: '+s.name,priority:'HIGH',owner:s.owner||'Unassigned',
  reason:bad?'Invalid rotation timestamp or policy':'Secret is overdue under the lab rotation policy',
  requestId:'rotate-'+s.id,observedAt:new Date(now).toISOString(),
  evidence:{ageDays:bad?null:age,rotationPolicyDays:policy}},pairedItem:{item:i}});
});
return out;
