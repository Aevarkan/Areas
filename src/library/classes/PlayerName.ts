/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: PlayerName.ts
 * Author: Aevarkan
 */

import { Player, world } from "@minecraft/server";

export class PlayerNameDatabase {

    /**
     * Saves a players name and id for viewing later.
     * @param player The player to save.
     */
    public savePlayerRecord(player: Player) {
        const playerId = player.id
        const playerName = player.name

        const key = `nameRecord.${playerId}`
        world.setDynamicProperty(key, playerName)

        const idKey = `nameRecordId.${playerName}`
        world.setDynamicProperty(idKey, playerId)
    }

    /**
     * Gets a player's name from their id
     * @param playerId The player id (player.id)
     * @returns The player's last seen name.
     * @remarks Useful for offline players!
     */
    public getPlayerName(playerId: number): string {
        const key = `nameRecord.${playerId}`

        const playerName = world.getDynamicProperty(key) as string
        return playerName
    }

    /**
     * Gets a player's id from their name
     * @param playerId The player id (player.id)
     * @returns The player's id.
     * @remarks This may give an incorrect id if multiple players use the same name (for example, when someone changes it)
     */
    public getPlayerId(playerName: string) {
        const key = `nameRecordId.${playerName}`

        const playerId = world.getDynamicProperty(key) as string
        return playerId
    }
}