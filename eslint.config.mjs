import nextVitals from "eslint-config-next/core-web-vitals";

// .teams/ holds scratch worktrees (with their own build output); it is not part of the app.
const config = [{ ignores: [".teams/**"] }, ...nextVitals];

export default config;
