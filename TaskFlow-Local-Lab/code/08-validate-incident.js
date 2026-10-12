// Run Once for All Items; immediately after the authenticated Webhook node.
const p=$input.first().json.body;
const valid=!!p&&typeof p.eventId==='string'&&/^LAB-INC-[a-zA-Z0-9-]+$/.test(p.eventId)&&
 p.simulated===true&&['high','critical'].includes(p.severity)&&
 Array.isArray(p.affectedAssetIds)&&p.affectedAssetIds.length>0&&p.affectedAssetIds.length<=20&&
 p.affectedAssetIds.every(id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id))&&
 typeof p.reason==='string'&&p.reason.length>0&&p.reason.length<=1000;
return [{json:valid?{...p,valid:true}:{valid:false,error:'Invalid simulated incident payload'}}];
