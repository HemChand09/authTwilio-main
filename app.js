const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./util/appError");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(cors());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/user", userRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`Cant't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
