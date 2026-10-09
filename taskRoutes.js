'use strict';
const express=require('express'); const {requireApiKey}=require('../middleware/auth');
function createTaskRouter(service) { const r=express.Router();
 r.get('/',requireApiKey,async(req,res,next)=>{try{res.json({tasks:await service.list()});}catch(e){next(e);}});
 r.post('/',requireApiKey,async(req,res,next)=>{try{res.status(201).json({task:await service.create(req.body||{})});}catch(e){next(e);}});
 r.patch('/:id',requireApiKey,async(req,res,next)=>{try{res.json({task:await service.update(req.params.id,req.body?.status)});}catch(e){next(e);}}); return r;
} module.exports={createTaskRouter};
