import { Text, View } from "react-native";

import { useFavorites } from "@/utils/hooks";
import { FavoriteRoute } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";

const TrainSchedules = ({ routes }: { routes: FavoriteRoute[] }) => {
  return <View>{/* TODO: implement me! */}</View>;
};

export default function HomeScreen() {
  const { favorites = [], isLoading, error } = useFavorites();

  return (
    <SafeScrollView className="bg-white">
      <View className="mt-8 mb-4 px-4">
        <Text className="font-bold text-zinc-900 text-4xl">Trains</Text>
        <View className="h-px bg-zinc-200 my-2" />
      </View>
    </SafeScrollView>
  );
}
