/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockBreak.ts
 * Author: Aevarkan
 */

import { Player, world } from "@minecraft/server";
import { Database } from "library/classes/AreasDatabase";
import { Areas } from "library/classes/AreasSystem";
import { BlockSnapshot } from "library/classes/BlockSnapshot";
import { PlayerSession } from "library/classes/PlayerSession";
import { BlockInteractionTypes } from "library/definitions/areasWorld";

// We cannot use before events, this is because the block is already placed.
// For rollback, we're assuming all blocks were placed on air.
// Either that or rollbacks aren't allowed to initial state
// Could possibly initialise the world by getting an initial state of all blocks
// Should do this with a command areas:init <radius>
// You'd then have to run this command continually
// Ticking area?? Then have all blocks in a radius around players
// This could be automated, no player input, or make them put a command block that runs the command for every player
// I don't know the performance impacts, since this will save a dynamic property for EVERY block
// This will be much easier once the beforeEvent comes out of experimental
// It saves the block that is there before the new block is placed

world.afterEvents.playerPlaceBlock.subscribe(({block, player}) => {

    // Don't log if the player is in inspector mode
    // This shouldn't even trigger as its an after event
    // Inspector mode doesn't allow block placement anyway
    const session = Areas.getPlayerSession(player)
    if (session.inspectorEnabled) return

    const blockSnapshot = new BlockSnapshot(block)
    const time = Date.now()
    Database.Block.logBlockEvent(time, blockSnapshot, BlockInteractionTypes.BlockPlaced, player)
})

// Checks if a block is initialised, if not, then initialise
world.beforeEvents.playerBreakBlock.subscribe(event => {

    // Don't log if the player is in inspector mode
    const session = Areas.getPlayerSession(event.player)
    if (session.inspectorEnabled) return

    const block = event.block
    Database.Block.safelyInitialiseBlock(block)
})