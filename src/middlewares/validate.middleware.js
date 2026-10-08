import { ApiError } from "../utils/ApiError.js";

const formatIssues = (issues) =>
  issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const payload = req[source] ?? {};
    const result = schema.safeParse(payload);

    if (!result.success) {
      return next(
        ApiError.badRequest("Validation failed", formatIssues(result.error.issues))
      );
    }

    if (source === "body") req.body = result.data;
    else if (source === "query") req.validatedQuery = result.data;
    else if (source === "params") req.validatedParams = result.data;

    next();
  };