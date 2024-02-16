import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const mta = axios.create({
  baseURL: process.env.MTA_API_HOST || "https://mta-api.fly.dev",
});

export type TrainTime = { route: string; time: string };
export type StationSchedule = {
  id: string;
  name: string;
  location: [number, number];
  routes: string[];
  last_update: string;
  N: TrainTime[];
  S: TrainTime[];
};

export const fetchActiveAlerts = async () => {
  const { data: response } = await axios.get("/api/alerts");

  return response.data;
};

export function useActiveAlerts(options: any = {}) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: () => fetchActiveAlerts(),
    refetchOnMount: "always", //
    ...options,
  });

  return { data, error, isPending, isLoading, isRefetching, refetch };
}

export const fetchAllRoutes = async () => {
  const { data: response } = await mta.get("/api/routes");

  return response.data;
};

export function useAllRoutes(options: any = {}) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: () => fetchActiveAlerts(),
    refetchOnMount: "always", //
    ...options,
  });

  return { data, error, isPending, isLoading, isRefetching, refetch };
}

export const fetchRouteById = async (
  routeId: string
): Promise<StationSchedule[]> => {
  const { data: response } = await mta.get(`/api/routes/${routeId}`);

  return response.data;
};

export function useRouteById(routeId: string, options: any = {}) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["/api/routes", routeId],
    queryFn: () => fetchRouteById(routeId),
    refetchOnMount: "always", //
    ...options,
  });

  return { data, error, isPending, isLoading, isRefetching, refetch };
}

export const fetchStationsByQuery = async (
  query: string
): Promise<StationSchedule[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const { data: response } = await mta.get(`/api/stations`, {
    params: { query },
  });

  return response.data;
};

export function useStationsByQuery(query: string, options: any = {}) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery<any, Error, StationSchedule[]>({
    queryKey: ["/api/stations", query],
    queryFn: () => fetchStationsByQuery(query),
    refetchOnMount: "always", //
    ...options,
  });

  return {
    data,
    error,
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    refetch,
  };
}

export const fetchStationsByLocation = async (
  latitude: number,
  longitude: number
): Promise<StationSchedule[]> => {
  const { data: response } = await mta.get(`/api/stations`, {
    params: { latitude, longitude, limit: 5 },
  });

  return response.data;
};

export function useStationsByLocation(
  latitude: number,
  longitude: number,
  options: any = {}
) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["/api/stations", latitude, longitude],
    queryFn: () => fetchStationsByLocation(latitude, longitude),
    refetchOnMount: "always", //
    ...options,
  });

  return { data, error, isPending, isLoading, isRefetching, refetch };
}

export const fetchStationById = async (
  stationId: string
): Promise<StationSchedule> => {
  const { data: response } = await mta.get(`/api/stations/${stationId}`);
  const [station] = response.data;

  return station;
};

export function useStationById(stationId: string, options: any = {}) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery<any, Error, StationSchedule>({
    queryKey: [`station`, stationId],
    queryFn: () => fetchStationById(stationId),
    refetchOnMount: "always", //
    ...options,
  });

  return { data, error, isPending, isLoading, isRefetching, refetch };
}

export const fetchStationsById = async (
  stationIds: string[]
): Promise<StationSchedule[]> => {
  const { data: response } = await mta.get(
    `/api/stations/${stationIds.join(",")}`
  );

  return response.data;
};

export function useStationsByIds(stationIds: string[], options: any = {}) {
  const {
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    error,
    data,
    refetch,
  } = useQuery<any, Error, StationSchedule[]>({
    queryKey: ["stations", ...stationIds],
    queryFn: () => fetchStationsById(stationIds),
    refetchOnMount: "always", //
    ...options,
  });

  return { data, error, isPending, isLoading, isRefetching, refetch };
}
