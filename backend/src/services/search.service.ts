import { Client } from "@elastic/elasticsearch";
import { env } from "../config/env";
const client=new Client({node:env.ELASTICSEARCH_URL});
const INDEX="emails";
export const ensureEmailIndex=async()=>{if(!(await client.indices.exists({index:INDEX}))) await client.indices.create({index:INDEX,mappings:{properties:{id:{type:"keyword"},userId:{type:"keyword"},recipient:{type:"text"},subject:{type:"text"},body:{type:"text"},status:{type:"keyword"},scheduledAt:{type:"date"},sentAt:{type:"date"}}}});};
export const indexEmail=async(doc:Record<string,unknown>)=>{await client.index({index:INDEX,id:String(doc.id),document:doc,refresh:"wait_for"});};
export const updateEmailIndex=async(id:string,doc:Record<string,unknown>)=>{try{await client.update({index:INDEX,id,doc,refresh:"wait_for"});}catch(e){console.error("Elasticsearch update failed",e);}};
export const searchEmails=async(userId:string,q:string)=>{const r=await client.search({index:INDEX,query:{bool:{filter:[{term:{userId}}],must:[{multi_match:{query:q,fields:["recipient^2","subject^2","body"]}}]}}});return r.hits.hits.map(h=>h._source);};
