import React from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

export function useAppState(onChange: (status: AppStateStatus) => void) {
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);
}

export function useOnlineManager() {
  React.useEffect(() => {
    // React Query already supports on reconnect auto refetch in web browser
    if (Platform.OS !== "web") {
      return NetInfo.addEventListener((state) => {
        // console.log("NetInfo:", state);
        onlineManager.setOnline(
          state.isConnected != null &&
            state.isConnected &&
            Boolean(state.isInternetReachable)
        );
      });
    }
  }, []);
}

export function useRefreshOnFocus(refetch: () => void) {
  const enabledRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (enabledRef.current) {
        console.log("[useFocusEffect] Refetching!");
        refetch();
      } else {
        enabledRef.current = true;
      }
    }, [refetch])
  );

  useAppState(
    React.useCallback(
      (state) => {
        if (state === "active") {
          console.log("[useAppState] Refetching!");
          refetch();
        }
      },
      [refetch]
    )
  );
}
