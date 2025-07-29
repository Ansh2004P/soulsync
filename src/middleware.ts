// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware() {
    return null;
  },
  {
    publicRoutes: [],
    unauthorizedRedirectUrl: "/",
    unauthorizedErrorMessage: "You must be logged in to access this page.",
  }
);
