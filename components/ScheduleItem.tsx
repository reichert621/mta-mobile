import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import React from "react";
import dayjs from "dayjs";

import { FavoriteStation, cn, getColorByRoute } from "@/utils";

const ScheduleItem = ({
  className,
  time,
  route,
  onPress,
}: {
  className?: string;
  time: string;
  route: string;
  onPress?: () => void;
}) => {
  const formatted = dayjs(time).format("h:mm a");
  const mins = dayjs(time).diff(dayjs(), "minutes");
  const secs = dayjs(time).diff(dayjs(), "seconds");
  const [bg, text] = getColorByRoute(route);

  const [n, setN] = React.useState(0);

  React.useEffect(() => {
    if (mins < 1) {
      const i = setInterval(() => setN((n) => n + 1), 1000);

      return () => clearInterval(i);
    }
  }, [mins]);

  return (
    <Pressable
      className={cn(
        "flex mb-1 flex-row items-center justify-between",
        className,
        secs < 0 && "opacity-60"
      )}
      onPress={onPress}
    >
      <View className="flex flex-row items-center gap-3">
        <View
          className={`${bg} h-9 w-9 items-center justify-center rounded-full`}
        >
          <Text className={`${text} text-sm font-bold`}>{route}</Text>
        </View>
        {secs < 15 ? (
          <Text className="text-red-700 dark:text-red-300 font-medium text-base">
            Arriving soon
          </Text>
        ) : mins < 1 ? (
          <Text className="text-red-700 dark:text-red-300 font-medium text-base">
            {Math.abs(secs)} {Math.abs(secs) === 1 ? "second" : "seconds"}{" "}
            {secs < 0 ? "ago" : "away"}
          </Text>
        ) : (
          <Text className="text-zinc-700 dark:text-zinc-300 font-medium text-base">
            {Math.abs(mins)} {Math.abs(mins) === 1 ? "min" : "mins"}{" "}
            {secs < 0 ? "ago" : "away"}
          </Text>
        )}
      </View>

      <View>
        <Text className="text-zinc-400 text-base">{formatted}</Text>
      </View>
    </Pressable>
  );
};

export default ScheduleItem;
