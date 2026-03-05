import { OnboardingScreen } from "./types";

export const USER_ONBOARDING_KEY = "user.onboarding_completed" as const;

export const ONBOARDING_SCREENS: OnboardingScreen[] = [
    {
        id: 1,
        headline: "Your Journey\nBegins Here",
        subtext:
            "Safarnama turns every trip into a living story — plan, explore, and remember.",
        accentColor: "#F4A261",
        bgFrom: "#0D1B2A",
        bgTo: "#1B2838",
    },
    {
        id: 2,
        headline: "Travel\nTogether",
        subtext:
            "Create public or private trips, invite your crew, and plan every detail in one place.",
        accentColor: "#48CAE4",
        bgFrom: "#03045E",
        bgTo: "#0077B6",
    },
    {
        id: 3,
        headline: "Split Costs,\nNot Friendships",
        subtext:
            "Track shared expenses and split trip funds fairly — no awkward money talks.",
        accentColor: "#52B788",
        bgFrom: "#081C15",
        bgTo: "#1B4332",
    },
    {
        id: 4,
        headline: "Publish Your\nAdventures",
        subtext:
            "Write travel blogs, share photos, and inspire millions of wanderers worldwide.",
        accentColor: "#E76F51",
        bgFrom: "#370617",
        bgTo: "#6A040F",
    },
    {
        id: 5,
        headline: "Join a Living\nCommunity",
        subtext:
            "Comment, react, and discover hidden gems — a world of travelers waiting for you.",
        accentColor: "#B5838D",
        bgFrom: "#1A1A2E",
        bgTo: "#16213E",
    },
    {
        id: 6,
        headline: "Every Mile\nTells a Story",
        subtext:
            "Interactive maps, real-time updates, and an experience that moves as fast as you do.",
        accentColor: "#FFD166",
        bgFrom: "#212121",
        bgTo: "#3D2B1F",
    },
];
