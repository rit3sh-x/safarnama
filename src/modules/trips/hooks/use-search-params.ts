import { useAtom } from "jotai";
import { useCallback } from "react";
import { searchAtom } from "../atoms";

export const useSearchParams = () => {
    const [search, setSearch] = useAtom(searchAtom);

    const resetSearch = useCallback(() => {
        setSearch(undefined);
    }, [setSearch]);

    return {
        search,
        setSearch,
        resetSearch,
    };
};
