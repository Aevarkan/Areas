/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: playerName.ts
 * Author: Aevarkan
 */

import { world } from "@minecraft/server";
import { Database } from "library/classes/AreasDatabase";

// Grabs a player's name when they spawn in
world.afterEvents.playerSpawn.subscribe(event => {
    Database.Names.savePlayerRecord(event.player)
})