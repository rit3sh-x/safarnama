import { createAuthClient } from "better-auth/react";
import {
    usernameClient,
    customSessionClient,
    organizationClient,
} from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { Auth } from "@backend/types";

export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
    plugins: [
        expoClient({
            scheme: Constants.expoConfig?.scheme as string,
            storagePrefix: Constants.expoConfig?.scheme as string,
            storage: SecureStore,
            cookiePrefix: "safarnama",
        }),
        convexClient(),
        customSessionClient<Auth>(),
        usernameClient(),
        organizationClient(),
    ],
});
