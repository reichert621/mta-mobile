import AsyncStorage from "@react-native-async-storage/async-storage";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FavoriteStationSettings = {
  northbound: Record<string, boolean>;
  southbound: Record<string, boolean>;
};
export type FavoriteStation = {
  id: string;
  name: string;
  location?: [number, number];
  routes?: string[];
  rank?: number;
  active?: boolean;
  northbound?: boolean;
  southbound?: boolean;
  // TODO: figure out how to model this
  enabled: FavoriteStationSettings;
};

export const DEFAULT_FAVORITES: FavoriteStation[] = [
  {
    id: "52ed",
    location: [40.690635, -73.981824],
    name: "DeKalb Av",
    active: true,
    enabled: {
      northbound: {},
      southbound: {},
    },
  },
  {
    id: "ec1f",
    location: [40.688484, -73.985001],
    name: "Hoyt-Schermerhorn Sts",
    active: true,
    enabled: {
      northbound: {},
      southbound: {},
    },
  },
];

const CACHE_KEY = "__mta:favorites";

export const getCachedFavorites = async (): Promise<FavoriteStation[]> => {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    const json = data ? JSON.parse(data) : DEFAULT_FAVORITES;
    const favorites = json.filter((d: any) => d.id && d.name);

    return favorites;
  } catch (e) {
    return [];
  }
};

export const setCachedFavorites = async (favorites: FavoriteStation[]) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn("Failed to save favorites:", e);
  }
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getColorByRoute = (route: string) => {
  switch (route) {
    case "A":
    case "C":
    case "E":
      return ["bg-mta-blue", "text-white"];
    case "B":
    case "D":
    case "F":
    case "M":
      return ["bg-mta-orange", "text-white"];
    case "1":
    case "2":
    case "3":
      return ["bg-mta-red", "text-white"];
    case "4":
    case "5":
    case "6":
    case "6X":
      return ["bg-mta-dark-green", "text-white"];
    case "N":
    case "Q":
    case "R":
    case "W":
      return ["bg-mta-yellow", "text-black"];
    case "J":
    case "Z":
      return ["bg-mta-brown", "text-white"];
    case "L":
      return ["bg-mta-light-gray", "text-white"];
    case "G":
      return ["bg-mta-light-green", "text-white"];
    case "7":
    case "7X":
      return ["bg-mta-purple", "text-white"];
    default:
      return ["bg-zinc-900", "text-white"];
  }
};
