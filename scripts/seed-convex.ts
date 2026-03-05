import dotenv from "dotenv";
import { execSync } from "node:child_process";

const KEYS = [
    "BETTER_AUTH_SECRET",
    "MOBILE_SCHEME",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
];

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const isProd = process.argv.slice(2).includes("--prod");
const envFlag = isProd ? "--prod" : "";

if isProd) {
  execSync(
      `npx convex env set NODE_ENV "production" ${envFlag}`,
      { stdio: "inherit" }
  );
}

console.log(`🚀 Importing secrets to ${isProd ? "PRODUCTION" : "DEVELOPMENT"}...`);

for (const key of KEYS) {
    const value = process.env[key]!;
    if (!value) {
        console.warn(`⚠️ Skipping ${key}: Not found in .env files`);
        continue;
    }

    try {
        execSync(
            `npx convex env set ${key} "${value.replace(/"/g, '\\"')}" ${envFlag}`,
            { stdio: "inherit" }
        );
    } catch {
        console.error(`❌ Failed to set ${key}`);
    }
}
