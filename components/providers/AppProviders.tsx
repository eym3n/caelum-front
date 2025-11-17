"use client";

import * as React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { createQueryClient } from "@/lib/queryClient";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => createQueryClient());
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}


