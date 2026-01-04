import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, createCredential, demoCache, demoIdempotent, demoRateLimited, demoRetry, listClients } from "./api";

export function useDemoCache(customerId: number) {
  return useQuery({
    queryKey: ["demoCache", customerId],
    queryFn: () => demoCache(customerId),
    enabled: Number.isFinite(customerId),
  });
}

export function useDemoRateLimited() {
  return useMutation({
    mutationFn: () => demoRateLimited(),
  });
}

export function useDemoRetry() {
  return useMutation({
    mutationFn: (failTimes: number) => demoRetry(failTimes),
  });
}

export function useDemoIdempotent() {
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: { amount: number; currency: string }, idempotencyKey: string }) =>
      demoIdempotent(body, idempotencyKey),
  });
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => listClients(),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { clientName: string; clientCode: string }) => createClient(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clients"] });
    }
  });
}

export function useCreateCredential() {
  return useMutation({
    mutationFn: ({ clientId, credentialName }: { clientId: number; credentialName: string }) =>
      createCredential(clientId, { credentialName }),
  });
}
