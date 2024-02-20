import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
  interpolate,
} from "react-native-reanimated";

export function useScaleAnimation({
  config = { damping: 10, stiffness: 100 },
  range = [1, 0.95],
}: {
  config?: WithSpringConfig;
  range?: [number, number];
}): [any, { onPressIn: () => void; onPressOut: () => void }] {
  const scale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const value = interpolate(
      scale.value,
      [0, 1], // Input range: corresponds to scale.value range
      range
    );

    return {
      transform: [{ scale: value }],
    };
  });

  const onPressIn = () => {
    // withSpring to animate the scale value on press in
    scale.value = withSpring(1, config);
  };

  const onPressOut = () => {
    // withSpring to animate the scale value back to 0 on press out
    scale.value = withSpring(0, config);
  };

  // Return the animated style and press handlers
  return [animatedStyle, { onPressIn, onPressOut }];
}
