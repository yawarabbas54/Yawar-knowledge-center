'use strict';
const express=require('express'); const helmet=require('helmet'); const path=require('node:path');
const config=require('./config'); const {ArticleService}=require('./services/articleService'); const {JsonStore}=require('./services/jsonStore');
const {AiService}=require('./services/aiService'); const {KnowledgeService}=require('./services/knowledgeService'); const {TaskService}=require('./services/taskService'); const {AgentService}=require('./services/agentService');
const {createArticleRouter}=require('./routes/articleRoutes'); const {createAgentRouter}=require('./routes/agentRoutes'); const {createKnowledgeRouter}=require('./routes/knowledgeRoutes'); const {createTaskRouter}=require('./routes/taskRoutes'); const {createCallRouter}=require('./routes/callRoutes');
const {notFound,errorHandler}=require('./middleware/errorHandler');
function createApp({service=new ArticleService()}={}) {
 const app=express(); app.disable('x-powered-by');
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'", "'unsafe-inline'"],connectSrc:["'self'"],imgSrc:["'self'",'data:'],mediaSrc:["'self'",'blob:'],upgradeInsecureRequests:null}}}));
 app.use(express.json({limit:'100kb'}));
 const store=new JsonStore(config.dataDir), ai=new AiService(), knowledge=new KnowledgeService(store), tasks=new TaskService(store), agent=new AgentService({ai,knowledge,tasks});
 app.get('/health',(req,res)=>res.json({status:'ok',uptime:process.uptime(),aiConfigured:ai.isConfigured(),version:'2.0.0'}));
 app.get('/api/status',(req,res)=>res.json({name:'Yawar Knowledge Center',version:'2.0.0',features:{chat:true,knowledge:true,tasks:true,calculator:true,browserVoice:true,calls:Boolean(config.twilioAccountSid&&config.twilioAuthToken&&config.twilioFromNumber)},aiConfigured:ai.isConfigured()}));
 app.use('/api/agent',createAgentRouter(agent)); app.use('/api/knowledge',createKnowledgeRouter(knowledge)); app.use('/api/tasks',createTaskRouter(tasks)); app.use('/api/calls',createCallRouter()); app.use('/api/articles',createArticleRouter(service));
 app.use(express.static(path.join(__dirname,'..','public'),{extensions:['html']}));
 app.use(notFound); app.use(errorHandler); return app;
}
module.exports={createApp};
