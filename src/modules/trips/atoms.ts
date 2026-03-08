import { atom } from "jotai";
import { NavOption } from "./types";

export const searchMapAtom = atom<Record<NavOption, string | undefined>>({
    trips: undefined,
    invites: undefined,
    public_trips: undefined,
});
export const navOptionsAtom = atom<NavOption>("trips");
