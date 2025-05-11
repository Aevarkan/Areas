/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: AreasSystem.ts
 * Author: Aevarkan
 */

import { Player, system } from "@minecraft/server"
import { PlayerSession } from "./PlayerSession"
import { CommandRegister } from "./CommandRegister"
import { AreasDatabase } from "./AreasDatabase"

/**
 * Encapsulates all operations for this addon.
 */
class AreasSystem {

    private currentPlayerSessions: Map<string, PlayerSession> = new Map()

    /**
     * Handles custom commands for the addon.
     */
    public Commands: CommandRegister

    /**
     * Handles the database for the addon.
     */
    public Database: AreasDatabase

    constructor() {
        this.Commands = new CommandRegister()
        this.Database = new AreasDatabase()
        this._registerCommands()
    }

    private _registerCommands() {
        system.beforeEvents.startup.subscribe(event => {
            const commandRegister = event.customCommandRegistry

            // Register each command put in the register
            this.Commands.getCommands().forEach(commandPair => {
                commandRegister.registerCommand(commandPair.command, commandPair.callbackFunction)
            })
            
        })
    }

    /**
     * Gets a player's session.
     * @param player The player to get the session for.
     * @returns The player's {@link PlayerSession}.
     * @remarks Creates a new session if one doesn't exist.
     */
    public getPlayerSession(player: Player): PlayerSession {
        const id = player.id

        // Get the player session if it exists, otherwise make a new one.
        let session: PlayerSession
        if (this.currentPlayerSessions.has(id)) {
            session = this.currentPlayerSessions.get(id)
        } else {
            session = new PlayerSession(player)
            this.currentPlayerSessions.set(id, session)
        }

        return session
    }
}

/**
 * Encapsulates all operations for this addon.
 */
export const Areas = new AreasSystem()