import { httpRouter } from "convex/server";
import { auth } from "./auth";

/**
 * Convex HTTP router.
 * @convex-dev/auth requires specific HTTP endpoints for its internal
 * sign-in / sign-out flow — registered here via auth.addHttpRoutes().
 */
const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
