import React from "react";

import {
  FavoriteStation,
  getCachedFavorites,
  setCachedFavorites,
} from "@/utils/index";

type ContextProps = {
  isLoading: boolean;
  favorites: FavoriteStation[];
  error: any;
  refresh: () => Promise<any>;
  set: (favorites: FavoriteStation[]) => Promise<any>;
};

export const FavoritesContext = React.createContext<ContextProps>({
  isLoading: false,
  error: null,
  favorites: [],
  refresh: () => Promise.resolve(),
  set: () => Promise.resolve(),
});

export const useFavorites = () => React.useContext(FavoritesContext);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  const value: ContextProps = {
    isLoading,
    error,
    favorites,
    refresh,
    set,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
