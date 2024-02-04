import { Text, View } from "react-native";

import { useFavorites } from "@/utils/hooks";
import { FavoriteRoute } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";

/**
 * TODO: Display upcoming train times based on the user's favorite routes.
 * (e.g. "DeKalb Station -> Q train in 5 mins, B in 7 mins, D in 8 mins, etc")
 *
 * Implementation notes:
 * - user favorite routes are currently just hardcoded and stored locally in AsyncStorage
 * - will use existing MTA APIs (hooks already implemented in @/utils/api)
 * - will use polling to make sure train times are up to date
 * - if time allows, will start implementing UI where user can add/remove favorites (in new tab screen)
 */

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
