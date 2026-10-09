'use strict';
const express=require('express'); const config=require('../config'); const {requireApiKey}=require('../middleware/auth');
function createCallRouter(){const r=express.Router();
 r.get('/status',(req,res)=>res.json({configured:Boolean(config.twilioAccountSid&&config.twilioAuthToken&&config.twilioFromNumber),provider:'Twilio',note:'Outbound calls require provider credentials, recipient consent, and applicable legal compliance.'}));
 r.post('/outbound',requireApiKey,async(req,res,next)=>{try{
  if(!config.twilioAccountSid||!config.twilioAuthToken||!config.twilioFromNumber) return res.status(503).json({error:'Calling is not configured. Set Twilio environment variables first.'});
  const {to, message, confirmed}=req.body||{};
  if(confirmed!==true) return res.status(400).json({error:'Set confirmed=true only after verifying the recipient has agreed to receive this call.'});
  if(typeof to!=='string'||!/^\+[1-9]\d{7,14}$/.test(to)) return res.status(400).json({error:'Recipient must be an E.164 phone number.'});
  if(typeof message!=='string'||!message.trim()||message.length>1200) return res.status(400).json({error:'A call message of 1–1200 characters is required.'});
  if(!config.publicBaseUrl.startsWith('https://')) return res.status(503).json({error:'Set PUBLIC_BASE_URL to your public HTTPS server URL to enable calls.'});
  const form=new URLSearchParams({To:to,From:config.twilioFromNumber,Twiml:`<Response><Say>${message.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}</Say></Response>`});
  const auth=Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
  const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Calls.json`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:form});
  const data=await response.json(); if(!response.ok) return res.status(502).json({error:data.message||'Telephony provider rejected the call.'});
  res.status(202).json({accepted:true,callSid:data.sid,status:data.status});
 }catch(e){next(e);}}); return r; }
module.exports={createCallRouter};
