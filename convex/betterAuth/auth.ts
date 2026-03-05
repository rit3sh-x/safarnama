import { expo } from "@better-auth/expo";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { organization, username } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import { ROLE_MAP, ROLES } from "./roles";
import schema from "./schema";

const siteUrl = process.env.SITE_URL!;
const mobileScheme = process.env.MOBILE_SCHEME!;
const isProd = process.env.NODE_ENV === "production";

export const authComponent = createClient<DataModel, typeof schema>(
    components.betterAuth,
    {
        local: { schema },
        verbose: false,
    }
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
    return {
        appName: "Safarnama",
        trustedOrigins: async (request) => {
            const base = [siteUrl, mobileScheme];
            const origin = request?.headers?.get("expo-origin") ?? "";
            if (isProd && origin.startsWith("exp://")) {
                return [...base, origin];
            }
            return base;
        },
        database: authComponent.adapter(ctx),
        emailAndPassword: {
            enabled: true,
            autoSignIn: true,
            requireEmailVerification: false,
        },
        advanced: {
            cookiePrefix: "safarnama",
        },
        onAPIError: {
            onError(error, ctx) {
                console.error("🚫 BETTER AUTH API ERROR:", error, ctx);
            },
        },
        account: {
            accountLinking: {
                enabled: true,
                trustedProviders: ["google", "email-password"],
            },
        },
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                mapProfileToUser(profile) {
                    return {
                        email: profile.email,
                        name: profile.name,
                        image: profile.picture,
                        emailVerified: profile.email_verified,
                    };
                },
            },
        },
        plugins: [
            expo(),
            convex({
                authConfig,
                jwksRotateOnTokenGenerationError: true,
            }),
            username({
                maxUsernameLength: 20,
                minUsernameLength: 3,
            }),
            organization({
                teams: {
                    enabled: false,
                },
                roles: ROLE_MAP,
                creatorRole: ROLES.OWNER,
                organizationHooks: {
                    beforeAddMember: async ({ member }) => {
                        return {
                            data: {
                                ...member,
                                role: ROLES.MEMBER,
                            },
                        };
                    },
                    beforeCreateInvitation: async ({ invitation }) => {
                        return {
                            data: {
                                ...invitation,
                                role: ROLES.MEMBER,
                            },
                        };
                    },
                },
            }),
        ],
    } satisfies BetterAuthOptions;
};

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth(createAuthOptions(ctx));
};

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
