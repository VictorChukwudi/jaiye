// const notFound = (req, res, next) => {
//   const error = new Error(`Not Found -- ${req.originalUrl}`);
//   res.status(404);
//   next(error);
// };

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // const status = err.statusCode;
  console.log(err);
  res.status(statusCode);
  res.json({
    status: "error",
    msg: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { /*notFound*/ errorHandler };
