'use strict';
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');let failures=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()&&entry.name!=='node_modules'&&entry.name!=='.git')walk(full);else if(entry.isFile()&&entry.name.endsWith('.js')){try{new Function(fs.readFileSync(full,'utf8'));console.log('OK',path.relative(root,full))}catch(e){failures++;console.error('FAIL',path.relative(root,full),e.message)}}}}
walk(path.join(root,'src'));walk(path.join(root,'public'));walk(path.join(root,'tests'));if(failures)process.exitCode=1;else console.log('JavaScript syntax checks passed.');
