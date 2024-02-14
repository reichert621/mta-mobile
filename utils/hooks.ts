import React from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

import {
  FavoriteStation,
  getCachedFavorites,
  setCachedFavorites,
} from "@/utils/index";

export function useFavorites() {
  const [isLoading, setLoadingState] = React.useState(true);
  const [favorites, setFavorites] = React.useState<FavoriteStation[]>([]);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    const init = async () => {
      try {
        const cached = await getCachedFavorites();

        setFavorites(cached);
      } catch (err) {
        console.error("Failed to retrieve cached favorites:", err);
        setError(err);
      } finally {
        setLoadingState(false);
      }
    };

    init();
  }, []);

  const refresh = async () => {
    try {
      const cached = await getCachedFavorites();

      setFavorites(cached);
    } catch (err) {
      console.error("Failed to retrieve cached favorites:", err);
      setError(err);
    }
  };

  const set = async (favorites: FavoriteStation[]) => {
    try {
      await setCachedFavorites(favorites);
      const cached = await getCachedFavorites();

      setFavorites(cached);
    } catch (err) {
      console.error("Failed to set cached favorites:", err);
      setError(err);
    }
  };

  return {
    isLoading,
    favorites,
    error,
    refresh,
    set,
  };
}

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
        console.log("NetInfo:", state);
        onlineManager.setOnline(
          state.isConnected != null &&
            state.isConnected &&
            Boolean(state.isInternetReachable)
        );
      });
    }
  }, []);
}
