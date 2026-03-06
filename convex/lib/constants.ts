import { roleValidator } from "../betterAuth/schema";

export const PAGINATION = {
    MESSAGES_PAGE_SIZE: 50,
    MEMBERS_PAGE_SIZE: 30,
    TRIPS_PAGE_SIZE: 20,
} as const;

export const Owner = roleValidator.members[0];
export const Member = roleValidator.members[1];

export const MAX_FILE_SIZE = 1 * 1024 * 1024;