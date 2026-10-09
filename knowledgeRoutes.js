'use strict';
const express=require('express'); const {requireApiKey}=require('../middleware/auth');
function createKnowledgeRouter(service) { const r=express.Router();
 r.get('/',async(req,res,next)=>{try{res.json({items:await service.list()});}catch(e){next(e);}});
 r.get('/search',async(req,res,next)=>{try{res.json({items:await service.search(req.query.q)});}catch(e){next(e);}});
 r.post('/',requireApiKey,async(req,res,next)=>{try{res.status(201).json({item:await service.add(req.body||{})});}catch(e){next(e);}}); return r;
} module.exports={createKnowledgeRouter};
