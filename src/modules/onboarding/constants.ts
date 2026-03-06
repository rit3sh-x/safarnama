import { OnboardingScreen } from "./types";

export const USER_ONBOARDING_KEY = "user.onboarding_completed" as const;

export const ONBOARDING_SCREENS: OnboardingScreen[] = [
    {
        id: 1,
        headline: "Your Journey\nBegins Here",
        subtext:
            "Safarnama turns every trip into a living story — plan, explore, and remember.",
        headlineColor: "#0B2545",
        subtextColor: "#E6D8B8",
    },
    {
        id: 2,
        headline: "Travel\nTogether",
        subtext:
            "Create public or private trips, invite your crew, and plan every detail in one place.",
        headlineColor: "#0B2545",
        subtextColor: "#E6D8B8",
    },
    {
        id: 3,
        headline: "Split Costs,\nNot Friendships",
        subtext:
            "Track shared expenses and split trip funds fairly — no awkward money talks.",
        headlineColor: "#0B2545",
        subtextColor: "#E6D8B8",
    },
    {
        id: 4,
        headline: "Publish Your\nAdventures",
        subtext:
            "Write travel blogs, share photos, and inspire millions of wanderers worldwide.",
        headlineColor: "#0B2545",
        subtextColor: "#E6D8B8",
    },
    {
        id: 5,
        headline: "Join a Living\nCommunity",
        subtext:
            "Comment, react, and discover hidden gems — a world of travelers waiting for you.",
        headlineColor: "#0B2545",
        subtextColor: "#E6D8B8",
    },
    {
        id: 6,
        headline: "Every Mile\nTells a Story",
        subtext:
            "Interactive maps, real-time updates, and an experience that moves as fast as you do.",
        headlineColor: "#0B2545",
        subtextColor: "#E6D8B8",
    },
] as const;
