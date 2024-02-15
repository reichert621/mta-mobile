import React from "react";
import { StyleSheet, View, Text, Dimensions, Pressable } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInLeft,
  FadeOut,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DELETE_THRESHOLD = -SCREEN_WIDTH * 0.3;

const SlideToDelete = ({
  initialHeight,
  children,
  onDelete,
}: {
  initialHeight: number;
  children: React.ReactNode;
  onDelete: () => void;
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(initialHeight); // TODO: figure out best approach here
  const opacity = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // console.log("onUpdate!", event);
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      // console.log("onEnd!", translateX);

      if (translateX.value < DELETE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH);
        itemHeight.value = withTiming(0);
        opacity.value = withTiming(0, undefined, (isFinished) => {
          if (isFinished) {
            runOnJS(onDelete)();
          }
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: itemHeight.value,
    opacity: opacity.value,
  }));

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.6, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: opacity,
    };
  });

  return (
    <View>
      <Animated.View
        className="absolute top-0 right-0 bottom-0 w-full bg-red-500 justify-center items-center"
        style={[deleteButtonAnimatedStyle]}
      >
        <Text className="text-red-50 font-semibold">Remove</Text>
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[{ width: SCREEN_WIDTH }, animatedStyle]}
          entering={FadeIn}
          // exiting={FadeOut}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default SlideToDelete;
