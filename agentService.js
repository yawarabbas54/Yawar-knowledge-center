'use strict';
const { calculate } = require('../tools/calculator');
const config = require('../config');
const { timingSafeEqual } = require('node:crypto');
class AgentService {
  constructor({ ai, knowledge, tasks }) { this.ai=ai; this.knowledge=knowledge; this.tasks=tasks; }
  async run({ message, history = [] }, context = {}) {
    if (typeof message !== 'string' || !message.trim() || message.length > 8000) throw Object.assign(new Error('Message must contain 1–8000 characters.'), { status: 400 });
    const text=message.trim();
    const calc = text.match(/^(?:calculate|compute|what is)\s+(.+?)[?!.]*$/i);
    if (calc && /[\d][\d\s()+\-*/%.]*$/.test(calc[1])) {
      try { return { reply: `The result is ${calculate(calc[1].replace(/[?!.]+$/,''))}.`, tool: 'calculator' }; }
      catch (e) { return { reply: `I couldn't calculate that: ${e.message}`, tool: 'calculator' }; }
    }
    const searchMatch = text.match(/^(?:search|find)\s+(?:my\s+)?knowledge(?:\s+for)?\s*[:]?\s*(.+)$/i);
    if (searchMatch) {
      const results=await this.knowledge.search(searchMatch[1]);
      return { reply: results.length ? `I found ${results.length} matching item(s):\n\n${results.map((x,i)=>`${i+1}. ${x.title}\n${x.content.slice(0,450)}${x.content.length>450?'…':''}`).join('\n\n')}` : 'No matching knowledge items found yet. Add documents in the Knowledge section first.', tool: 'knowledge-search', results: results.map(({id,title,score})=>({id,title,score})) };
    }
    const historySafe = Array.isArray(history) ? history.filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content==='string').slice(-10).map(m=>({role:m.role,content:m.content.slice(0,4000)})) : [];
    const messages=[{role:'system',content:'You are Yawar Knowledge Center, a helpful and honest AI agent. Use available tools when useful. Never claim an external action succeeded unless a tool confirms it. Ask for confirmation before consequential external actions. Do not attempt to bypass tool permissions.'}, ...historySafe, {role:'user',content:text}];
    const tools=[
      {type:'function',function:{name:'calculator',description:'Evaluate a basic arithmetic expression safely.',parameters:{type:'object',properties:{expression:{type:'string',description:'Arithmetic using numbers, parentheses, +, -, *, /, %'}},required:['expression'],additionalProperties:false}}},
      {type:'function',function:{name:'search_knowledge',description:'Search the user’s saved knowledge notes.',parameters:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false}}},
      {type:'function',function:{name:'create_task',description:'Create a task in the task manager. Only create it when the user clearly asks to add or remember a task.',parameters:{type:'object',properties:{title:{type:'string'},description:{type:'string'}},required:['title'],additionalProperties:false}}}
    ];
    const executeTool=async(name,args)=>{
      if(name==='calculator') return {result:calculate(String(args.expression||''))};
      if(name==='search_knowledge') return {results:(await this.knowledge.search(args.query)).map(({id,title,content,score})=>({id,title,content:content.slice(0,2500),score}))};
      if(name==='create_task') {
        if (config.apiKey) { const supplied=Buffer.from(String(context.apiKey||'')); const expected=Buffer.from(config.apiKey); if(supplied.length!==expected.length || !timingSafeEqual(supplied,expected)) throw new Error('Task creation requires an authenticated API key.'); }
        return {task:await this.tasks.create({title:args.title,description:args.description||''})};
      }
      throw new Error(`Tool is not available: ${name}`);
    };
    const result=await this.ai.chatWithTools(messages,tools,executeTool,4);
    return { reply: result.content, provider: result.provider, model: result.model, configured: result.configured, toolCalls: result.toolCalls || [] };
  }
}
module.exports = { AgentService };
