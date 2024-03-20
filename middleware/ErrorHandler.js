
// This is where I hanldle all the errors (the ones I dont throw have a status code of 500)
function errorHandler (err, req, res, next){
   
    let status = err.status || 500;
    let message = err.message || 'Something went wrong!';

    // handeling if unique constraint is violated in the db
    if(err.code == "23505") {
        const match = err.detail.match(/\((.*?)\)=/);
        const fieldName = match ? match[1] : "unknown";

        status= 400
        message = `The value provided for the '${fieldName}' field is already in use.`
    }
    
    console.log({message, status})
    res.status(status).json(message)
}

export default errorHandler