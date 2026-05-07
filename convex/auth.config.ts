/**
 * Convex Auth client-side configuration.
 *
 * This file configures the JWT provider so that the Convex backend
 * can verify authentication tokens from this deployment.
 *
 * Required by @convex-dev/auth — must be default-exported.
 *
 * CONVEX_SITE_URL is automatically set by Convex for each deployment
 * (e.g. "https://xxx.convex.cloud"). No need to set it manually.
 *
 * See: https://labs.convex.dev/auth/setup/manual#configure-authconfigts
 */
export default {
  providers: [
    {
      // @ts-ignore - process types might not be available
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
