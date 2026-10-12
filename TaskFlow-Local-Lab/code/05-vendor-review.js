// Run Once for All Items. All source records are mock vendor data.
const now=Date.now(), allowed=['ready','testing','unknown','blocked'];
return $input.all().map((item,i)=>{
 const v={...item.json,pqcStatus:String(item.json.pqcStatus||'').trim().toLowerCase()}, due=Date.parse(v.nextReview), reasons=[];
 const changed=v.lastObservedStatus!==null&&v.lastObservedStatus!==undefined&&v.lastObservedStatus!==v.pqcStatus;
 if(!allowed.includes(v.pqcStatus))reasons.push('Unrecognized status');
 if(['unknown','blocked'].includes(v.pqcStatus))reasons.push('Status requires human review');
 if(!Number.isFinite(due)||due<=now)reasons.push('Evidence review is due or date invalid');
 if(changed)reasons.push('Mock status changed: '+v.lastObservedStatus+' to '+v.pqcStatus);
 const finding=reasons.length?{dedupeKey:'vendor-review:'+v.id,ruleId:'vendor-review',
  assetId:v.id,title:'Review vendor evidence: '+v.vendor,priority:'MEDIUM',
  owner:v.owner||'Unassigned',reason:reasons.join('; '),
  observedAt:new Date(now).toISOString()}:null;
 return {json:{...v,changed,finding,lastCheckedAt:new Date(now).toISOString(),
  lastObservedStatus:v.pqcStatus},pairedItem:{item:i}};
});
