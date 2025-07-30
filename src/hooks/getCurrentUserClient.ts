"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCurrentUser() {
  const { data: user, error, isLoading } = useSWR("/api/me", fetcher);
  return { user, error, isLoading };
}
