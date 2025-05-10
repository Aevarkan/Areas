/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: AreasSystem.ts
 * Author: Aevarkan
 */

import { Player } from "@minecraft/server"
import { PlayerSession } from "./PlayerSession"

class AreasSystem {

    private currentPlayerSessions: Map<string, PlayerSession> = new Map()

    /**
     * Gets a player's session.
     * @param player The player to get the session for.
     * @returns The PlayerSession.
     * @remarks Creates a new session if one doesn't exist.
     */
    public getPlayerSession(player: Player): PlayerSession {
        const id = player.id

        // Get the player session if it exists, otherwise make a new one.
        let session: PlayerSession
        if(this.currentPlayerSessions.has(id)) {
            session = this.currentPlayerSessions.get(id)
        } else {
            session = new PlayerSession(player)
            this.currentPlayerSessions.set(id, session)
        }

        return session
    }
}

export const Areas = new AreasSystem()