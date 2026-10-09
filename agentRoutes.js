'use strict';
const express=require('express');
function createAgentRouter(agent) { const router=express.Router(); router.post('/chat',async(req,res,next)=>{try{res.json(await agent.run(req.body||{}, {apiKey:req.get('x-api-key')||''}));}catch(e){next(e);}}); return router; }
module.exports={createAgentRouter};
