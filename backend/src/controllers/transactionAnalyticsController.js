// Project Atlas — Engine 013
// Named component: transactionAnalyticsController

import {
  getTransactionSummary,
  getTransactionServiceBreakdown,
  getTransactionAnalytics
} from "../services/transactionAnalyticsService.js";

function sendError(res,error){
  if(error.statusCode) return res.status(error.statusCode).json({
    success:false,error:{code:error.statusCode===404?"NOT_FOUND":"BUSINESS_RULE",message:error.message}
  });
  console.error("Transaction analytics operation failed:",error);
  return res.status(500).json({success:false,error:{code:"INTERNAL_ERROR",message:"Transaction analytics could not be generated."}});
}

export async function getTransactionSummaryReport(req,res){
  try{return res.json({success:true,data:await getTransactionSummary(req.params.sessionId)});}
  catch(e){return sendError(res,e);}
}
export async function getTransactionServiceBreakdownReport(req,res){
  try{return res.json({success:true,data:await getTransactionServiceBreakdown(req.params.sessionId)});}
  catch(e){return sendError(res,e);}
}
export async function getTransactionAnalyticsReport(req,res){
  try{return res.json({success:true,data:await getTransactionAnalytics(req.params.sessionId)});}
  catch(e){return sendError(res,e);}
}
