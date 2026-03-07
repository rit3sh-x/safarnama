import { atom } from "jotai";
import { NavOption } from "./types";

export const searchAtom = atom<string | undefined>(undefined);
export const navOptionsAtom = atom<NavOption>("trips");
