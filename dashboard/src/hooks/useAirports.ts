"use client";

import useSWR from "swr";
import { getAirportDetail } from "@/lib/api";

export function useAirportDetail(ident: string) {
  const { data, error, isLoading } = useSWR(
    ident ? `airport-${ident}` : null,
    () => getAirportDetail(ident),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );
  return { airport: data ?? null, error, loading: isLoading };
}
