"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SimulatedTime() {
  const { data } = useSWR("/api/simulated-time", fetcher);

  if (!data) return null;

  return (
    <p className="text-sm text-gray-400 text-center">
      Tiempo simulado: {new Date(data.fecha).toLocaleString()}
    </p>
  );
}
