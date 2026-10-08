import { parse } from "csv-parse/sync";
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const parseEmailLeads=(content:string)=>{const set=new Set<string>();try{const rows=parse(content,{skip_empty_lines:true,relax_column_count:true,trim:true});for(const row of rows)for(const cell of row){const v=String(cell).trim().toLowerCase();if(EMAIL.test(v))set.add(v);}}catch{for(const line of content.split(/\r?\n/)){const v=line.trim().toLowerCase();if(EMAIL.test(v))set.add(v);}}return [...set];};
