const errorHandler = (err, req, res, next) => {
    console.log(err.message);
    console.log(err.stack);
    // const statusCode = res.statusCode ? res.statusCode : 500;
    const statusCode = 500; // Forcing a bad status code. Need to figure out why errors from database give 200 code
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { errorHandler };