'use strict';
function notFound(req,res,next){const error=new Error(`Route not found: ${req.method} ${req.originalUrl}`);error.status=404;next(error);}
function errorHandler(error,req,res,next){if(res.headersSent)return next(error);const status=Number.isInteger(error.status)?error.status:500;if(status>=500)console.error(error);res.status(status).json({error:status>=500?'Internal server error':error.message, ...(process.env.NODE_ENV==='development'&&status>=500?{details:error.message}:{})});}
module.exports={notFound,errorHandler};
