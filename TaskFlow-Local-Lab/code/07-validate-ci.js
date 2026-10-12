// Run Once for All Items; immediately after the n8n Webhook node.
const p=$input.first().json.body;
const valid=!!p&&p.repository==='taskflow'&&Number.isInteger(p.pullRequest)&&
 p.pullRequest>0&&typeof p.eventId==='string'&&/^LAB-CI-[a-zA-Z0-9-]+$/.test(p.eventId)&&
 typeof p.headSha==='string'&&/^[a-f0-9]{40}$/.test(p.headSha)&&
 Array.isArray(p.files)&&p.files.length>0&&p.files.length<=20&&p.files.every(f=>
  f&&typeof f.path==='string'&&f.path.length<=240&&typeof f.content==='string'&&f.content.length<=50000);
return [{json:valid?{...p,valid:true}:{valid:false,error:'Invalid lab CI payload'}}];
