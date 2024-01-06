// This is where I hanldle all the errors (the ones I dont throw have a status code of 500)
function errorHandler (err, req, res, next){
    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';
    console.log(err)
    res.status(status).json(message)
}

export default errorHandler