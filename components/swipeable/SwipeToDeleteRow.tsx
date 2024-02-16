import { Ionicons } from "@expo/vector-icons";
import React, { Component, PropsWithChildren } from "react";
import { Animated, StyleSheet, Text, View, I18nManager } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import colors from "tailwindcss/colors";

export const SwipeToDeleteRow = ({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) => {
  const updateRef = React.useRef<any>();

  // const handleDelete = () => {
  //   onDelete();
  //   updateRef.current?.close();
  // };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => {
    // TODO: investigate different settings here
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <View
        style={{
          width: 80,
          // flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
        }}
      >
        <Animated.View
          style={{ flex: 1, transform: [{ translateX: translateX }] }}
        >
          <RectButton
            style={[styles.rightAction, { backgroundColor: colors.red[500] }]}
            onPress={onDelete}
          >
            <Ionicons size={20} name="trash" color={colors.red[50]} />
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={updateRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={80}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        console.log(`Opening swipeable from the ${direction}`);
      }}
      onSwipeableClose={(direction) => {
        console.log(`Closing swipeable to the ${direction}`);
      }}
    >
      {children}
    </Swipeable>
  );
};

export default SwipeToDeleteRow;

// export default class SwipeableRow extends Component<
//   PropsWithChildren<unknown> & { onDelete: () => void }
// > {
//   private renderRightActions = (
//     progress: Animated.AnimatedInterpolation<number>,
//     _dragAnimatedValue: Animated.AnimatedInterpolation<number>
//   ) => {
//     const trans = progress.interpolate({
//       inputRange: [0, 1],
//       outputRange: [64, 0],
//     });

//     return (
//       <View
//         style={{
//           width: 64,
//           flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
//         }}
//       >
//         <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
//           <RectButton
//             style={[styles.rightAction, { backgroundColor: colors.red[500] }]}
//             onPress={() => this.props.onDelete()}
//           >
//             <Ionicons size={20} name="trash" color={colors.red[50]} />
//           </RectButton>
//         </Animated.View>
//       </View>
//     );
//   };

//   private swipeableRow?: Swipeable;

//   private updateRef = (ref: Swipeable) => {
//     this.swipeableRow = ref;
//   };
//   private close = () => {
//     this.swipeableRow?.close();
//   };
//   render() {
//     const { children } = this.props;

//     return (
//       <Swipeable
//         ref={this.updateRef}
//         friction={2}
//         enableTrackpadTwoFingerGesture
//         leftThreshold={30}
//         rightThreshold={40}
//         // renderLeftActions={this.renderLeftActions}
//         renderRightActions={this.renderRightActions}
//         onSwipeableOpen={(direction) => {
//           console.log(`Opening swipeable from the ${direction}`);
//         }}
//         onSwipeableClose={(direction) => {
//           console.log(`Closing swipeable to the ${direction}`);
//         }}
//       >
//         {children}
//       </Swipeable>
//     );
//   }
// }

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: "#497AFC",
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
