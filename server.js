const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const app=express(); const server=http.createServer(app); const io=new Server(server);
const PORT=process.env.PORT||3000;
const DB=path.join(__dirname,'data.json');
function load(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return {users:[]}}}
function save(db){fs.writeFileSync(DB,JSON.stringify(db,null,2))}
function hash(p,s){return crypto.scryptSync(p,s,64).toString('hex')}
function verify(p,rec){return hash(p,Buffer.from(rec.salt,'hex'))===rec.hash}
function code(){let db=load(); let c; do{c='FM-'+crypto.randomBytes(3).toString('hex').toUpperCase()}while(db.users.some(u=>u.code===c)); return c}
app.use(express.json()); app.use(express.static(__dirname));
app.post('/api/register',(req,res)=>{let {name,email,password}=req.body||{}; name=(name||'').trim(); email=(email||'').trim().toLowerCase(); if(!name||!email||!password||password.length<4)return res.status(400).json({error:'Name, email and password (4+ characters) are required.'}); let db=load(); if(db.users.some(u=>u.email===email))return res.status(409).json({error:'Email already registered.'}); let salt=crypto.randomBytes(16); let u={id:crypto.randomUUID(),name,email,code:code(),salt:salt.toString('hex'),hash:hash(password,salt)}; db.users.push(u);save(db);res.json({user:{id:u.id,name:u.name,code:u.code}})});
app.post('/api/login',(req,res)=>{let {email,password}=req.body||{}; let db=load(),u=db.users.find(x=>x.email===(email||'').trim().toLowerCase()); if(!u||!verify(password||'',u))return res.status(401).json({error:'Invalid login details.'});res.json({user:{id:u.id,name:u.name,code:u.code}})});
app.get('/api/search/:code',(req,res)=>{let db=load(),u=db.users.find(x=>x.code.toUpperCase()===req.params.code.toUpperCase()); if(!u)return res.status(404).json({error:'User not found.'});res.json({user:{id:u.id,name:u.name,code:u.code}})});
const online=new Map();
io.on('connection',socket=>{
 socket.on('online',({userId,name})=>{socket.userId=userId;socket.name=name;online.set(userId,socket.id);socket.broadcast.emit('presence',{userId,online:true,name})});
 socket.on('chat:send',({to,text,from,name})=>{let sid=online.get(to); if(sid)io.to(sid).emit('chat:message',{from,name,text,ts:Date.now()}); socket.emit('chat:message',{from,name,text,own:true,ts:Date.now()})});
 socket.on('ai:ask',({to,question,from,name})=>{const q=(question||'').toLowerCase(); let answer='میں آپ دونوں کی بات سننے کے لیے حاضر ہوں۔ آپ مجھ سے کوئی سوال پوچھ سکتے ہیں۔'; if(q.includes('love')||q.includes('محبت'))answer='محبت میں سب سے خوبصورت چیز ایک دوسرے کی عزت، اعتماد اور خیال رکھنا ہے۔'; else if(q.includes('hello')||q.includes('سلام'))answer='وعلیکم السلام! میں آپ دونوں کا AI دوست ہوں۔'; else if(q.includes('نام')||q.includes('name'))answer='میرا نام آپ کے ایپ کا AI دوست ہے۔'; const payload={from:'AI',name:'AI Assistant',text:answer,question,ts:Date.now()}; socket.emit('ai:message',payload); if(to){const sid=online.get(to); if(sid)io.to(sid).emit('ai:message',payload)}});
 socket.on('call:invite',d=>{const sid=online.get(d.to);if(sid)io.to(sid).emit('call:invite',d)});
 socket.on('call:accept',d=>{const sid=online.get(d.to);if(sid)io.to(sid).emit('call:accept',d)});
 socket.on('call:reject',d=>{const sid=online.get(d.to);if(sid)io.to(sid).emit('call:reject',d)});
 socket.on('webrtc',d=>{const sid=online.get(d.to);if(sid)io.to(sid).emit('webrtc',{...d,from:socket.userId})});
 socket.on('disconnect',()=>{if(socket.userId){online.delete(socket.userId);socket.broadcast.emit('presence',{userId:socket.userId,online:false})}})
});
server.listen(PORT,()=>console.log(`Farhan & Muskan app: http://localhost:${PORT}`));
