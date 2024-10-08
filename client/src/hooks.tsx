import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
    Server, GamePlayer, NewGameDimensions, NewPlayer,
    NewUserData, UserCredentials
} from "./server";
import { GameManagerV2 } from "./gameManagerV2";

const getClientStatePollFreqInMs = 500;

/**
 * Queries Server.getPlayers() for the specified game and then compares the results
 * against the provided list of game players to determine (and return) a list of
 * available players to add to the game.
 */
export function useAvailableGamePlayersQuery(server: Server, gameId: string, gamePlayers: GamePlayer[]) {
    return useQuery({
        queryKey: ['availableGamePlayers', gameId],
        queryFn: async () => {
            const playerList = await server.getPlayers();
            // const gamePlayers = await server.getPlayersForGame(gameId);
            const availPlayers = playerList.filter(p => {
                const matchedPlayers = gamePlayers.find(gp => {
                    return gp.id === p.id;
                });
                return matchedPlayers === undefined;
            });
            return availPlayers;
        }
    });
}

/** Queries Server.getPlayers() to retrieve all players */
export function usePlayersQuery(server: Server) {
    return useQuery({
        queryKey: ['players'],
        queryFn: async () => await server.getPlayers()
    });
}

/** Queries Server.getGame() for the specific game */
export function useGameListQuery(server: Server) {
    return useQuery({
        queryKey: ['gameList'],
        queryFn: async () => await server.getGames()
    });
}

/** Queries Server.getGame() for the specific game */
export function useGameDetailsQuery(server: Server, gameId: string) {
    return useQuery({
        queryKey: ['gameDetails', gameId],
        queryFn: async () => await server.getGame(gameId)
    });
}

/** Retrieves and returns the latest game state via the provided GameManagerV2 instance */
export function useGetGameClientStateQuery(
    gameManager: GameManagerV2 | null,
    gameId: string
) {
    return useQuery({
        queryKey: ['getGameClientState', gameId],
        queryFn: async () => {
            const gameManager = GameManagerV2.getInstance(gameId);
            const gameClientState = await gameManager.getClientState();
            return gameClientState;
        },
        refetchInterval: getClientStatePollFreqInMs,
        enabled: () => {
            const bool1 = gameManager instanceof GameManagerV2;
            const bool2 = gameId !== undefined;
            const bool3 = gameManager?.queryServerAllowed;
            return (
                gameManager instanceof GameManagerV2 &&
                gameId !== undefined &&
                gameManager.queryServerAllowed
            );
        }
    });
}

/** Queries Server.getPlayersForGame() for the specified game */
export function useGamePlayersQuery(server: Server, gameId: string) {
    return useQuery({
        queryKey: ['gamePlayers', gameId],
        queryFn: async () => await server.getPlayersForGame(gameId!)
    });
}

/** Supports mutation of a specific player after initializing with a server and game */
export function useRemovePlayerMutation(server: Server, gameId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playerId: string) => await server.removePlayerFromGame(gameId, playerId),
        onSuccess: () => {
            // TODO: Would be great to fire an event like 'playersChanged' and have an event handler do this
            queryClient.invalidateQueries({ queryKey: ['gamePlayers', gameId] });
            queryClient.invalidateQueries({ queryKey: ['availableGamePlayers', gameId] });
        }
    });
}

/** Calls Server.addPlayersToGame() for the specified player and game */
export function useAddPlayerMutation(server: Server, gameId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playerIds: string[]) => await server.addPlayersToGame(gameId!, playerIds),
        onSuccess: () => {
            // TODO: Would be great to fire an event like 'playersChanged' and have an event handler do this
            queryClient.invalidateQueries({ queryKey: ['gamePlayers', gameId] });
            queryClient.invalidateQueries({ queryKey: ['availableGamePlayers', gameId] });
        }
    });
}

/** Calls Server.addGame() with the specified game dimensions */
export function useCreateGameMutation(server: Server) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dimensions: NewGameDimensions) => await server.createGame(dimensions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gameList'] });
        }
    });
}

/** Calls Server.createPlayer() with the specified NewPlayer data */
export function useCreatePlayerMutation(server: Server) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (player: NewPlayer) => await server.createPlayer(player),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] });
            queryClient.invalidateQueries({ queryKey: ['availableGamePlayers'] });
        }
    });
}

/** Calls Server.deletePlayer() with the specified player ID */
export function useDeletePlayerMutation(server: Server) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playerId: string) => await server.deletePlayer(playerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['players'] });
            queryClient.invalidateQueries({ queryKey: ['availableGamePlayers'] });
        }
    });
}

/** Calls Server.startGame() with the specified game ID */
export function useStartGameMutation(gameManager: GameManagerV2) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gameId: string) => {
            await gameManager.startGame();
        },
        onSuccess: (_data, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['gameDetails', gameId] });
            queryClient.invalidateQueries({ queryKey: ['getGameClientState', gameId] });
        }
    });
}

/** Calls Server.deleteGame() with the specified game ID */
export function useDeleteGameMutation(server: Server) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gameId: string) => await server.deleteGame(gameId),
        onSuccess: (_data, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['gameList'] });
            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes(gameId)
            });
        }
    });
}

/** Calls Server.registerUser() with the specified user data */
export function useRegisterUserMutation(server: Server) {
    return useMutation({
        mutationFn: async (userData: NewUserData) => await server.registerUser(userData)
    })
}

/** Calls Server.authUser() with the specified credentials */
export function useAuthUserMutation(server: Server) {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (credentials: UserCredentials) => await server.authUser(credentials),
        onSuccess: () => {
            navigate('/games');
        }
    })
}