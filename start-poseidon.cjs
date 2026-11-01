const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process');
const root=__dirname, base=path.dirname(root),url='http://127.0.0.1:5174/';
function check(){return new Promise(resolve=>{const req=http.get(url,r=>{let s='';r.on('data',c=>s+=c);r.on('end',()=>resolve(s.includes('src/main.js')||s.includes('FFT')||s.includes('Poseidon')))});req.on('error',()=>resolve(false));req.setTimeout(1500,()=>{req.destroy();resolve(false)})})}
async function main(){
 if(!await check()){
  const lock=path.join(base,'launch.lock');let fd;
  try{fd=fs.openSync(lock,'wx')}catch{if(Date.now()-fs.statSync(lock).mtimeMs>60000){fs.unlinkSync(lock);return main()}for(let i=0;i<30&&!await check();i++)await new Promise(r=>setTimeout(r,500));if(!await check())throw Error('Another launch failed; see vite-error.log');}
  if(fd!==undefined){try{const out=fs.openSync(path.join(base,'vite.log'),'a'),err=fs.openSync(path.join(base,'vite-error.log'),'a');const child=cp.spawn(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1'],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',out,err]});fs.writeFileSync(path.join(base,'service.json'),JSON.stringify({pid:child.pid,root}));child.unref();for(let i=0;i<60&&!await check();i++)await new Promise(r=>setTimeout(r,500));if(!await check())throw Error('Server failed; see vite-error.log')}finally{fs.closeSync(fd);fs.unlinkSync(lock)}}
 }
 const edge='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
 cp.spawn(edge,['--new-window',url],{detached:true,windowsHide:true,stdio:'ignore'}).unref();
}
main().catch(e=>{fs.appendFileSync(path.join(base,'launcher-error.log'),new Date().toISOString()+' '+e.stack+'\n');process.exitCode=1});
