
import raven from "raven";

export default (app) => {
  if (process.env.NODE_ENV === "production") {
    // The request handler must be the first item
    app.use(raven.middleware.express.requestHandler(process.env.SENTRY));
  }
};

export const errors = (app) => {
  // The error handler must be before any other error middleware
  if (process.env.NODE_ENV === "production") {
    app.use(raven.middleware.express.errorHandler(process.env.SENTRY));
  }
}
