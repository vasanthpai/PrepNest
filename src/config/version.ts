import packageJson from "../../package.json";

/** The app version from package.json, bumped on every release (shown in the footer and /api/health). */
export const APP_VERSION: string = packageJson.version;
