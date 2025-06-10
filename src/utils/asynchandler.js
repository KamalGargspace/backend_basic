const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }






























//wrapper function to handle async errors in express routes using try and catch
// const asyncHandler = (fn)=>(req,res,next)=>{
//     try{
//           await fn(req,res,next);
//     }
//     catch(err){
//         res.status(err.code||500).json({
//             success: false,
//             message: err.message || 'Internal Server Error',
            
//         })
//     }
// }