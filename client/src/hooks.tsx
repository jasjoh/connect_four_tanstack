import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server } from "./server";

/** Queries Server.getGame() for the specific game */
export function useGameDetailsQuery(server: Server, gameId: string) {
    return useQuery({
        queryKey: ['gameDetails', gameId],
        queryFn: async () => await server.getGame(gameId)
    });
}

/** Queries Server.getPlayersForGame() for the specified game */
export function useGamePlayersQuery(server: Server, gameId: string) {
    return useQuery({
        queryKey: ['gamePlayers', gameId],
        queryFn: async () => await server.getPlayersForGame(gameId!)
    })
}

/** Supports mutation of a specific player after initializing with a server and game */
export function useRemovePlayerMutation(server: Server, gameId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playerId: string) => await server.removePlayerFromGame(gameId, playerId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gamePlayers', gameId] })
    })
}

/** Calls Server.addPlayersToGame() for the specified player and game */
export function useAddPlayerMutation(server: Server, gameId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playerIds: string[]) => await server.addPlayersToGame(gameId!, playerIds),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gamePlayers', gameId] })
    })
}