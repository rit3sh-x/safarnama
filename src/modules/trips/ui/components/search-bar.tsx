import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { SearchIcon, XIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSearchParams } from "../../hooks/use-search-params";

export const SearchBar = () => {
    const { search, setSearch } = useSearchParams();
    const { value, onChange, clear } = useDebouncedSearch(
        search ?? "",
        setSearch
    );

    return (
        <View className="flex-row items-center w-full px-4 rounded-full bg-muted-foreground/10 h-11">
            <Icon as={SearchIcon} className="size-4 text-muted-foreground" />
            <Input
                className="flex-1 bg-transparent h-full px-2"
                placeholder="Search"
                value={value}
                onChangeText={onChange}
                underlineColorAndroid="transparent"
                style={{ borderWidth: 0, outline: "none" }}
            />
            {value.length > 0 && (
                <Pressable onPress={clear} hitSlop={8}>
                    <Icon
                        as={XIcon}
                        className="size-4 rounded-full text-muted-foreground"
                    />
                </Pressable>
            )}
        </View>
    );
};
