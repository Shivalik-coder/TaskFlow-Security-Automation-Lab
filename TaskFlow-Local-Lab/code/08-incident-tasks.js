// Run Once for All Items, after Get affected inventory (full HTTP response).
// The earlier validation node MUST be named Validate incident.
const p=$('Validate incident').first().json;
const assets=$input.first().json.body;
if(!Array.isArray(assets))throw new Error('Inventory response is not an array');
return [...new Set(p.affectedAssetIds)].map(id=>{
 const a=assets.find(x=>x.id===id);
 return {json:{dedupeKey:'incident:'+p.eventId+':'+id,ruleId:'incident',assetId:id,
  title:'Investigate '+p.eventId+': '+(a?a.service:id),priority:p.severity.toUpperCase(),
  owner:a&&a.owner?a.owner:'Security',reason:a?p.reason:'Unknown affected asset; validate scope before remediation',
  observedAt:new Date().toISOString(),eventId:p.eventId,
  evidence:{simulated:true,inventoryMatched:!!a,advisoryId:p.advisoryId||null}}};
});
