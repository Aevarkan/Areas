/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockBreak.ts
 * Author: Aevarkan
 */

import { world } from "@minecraft/server";
import { Areas } from "library/classes/AreasSystem";
import { BlockSnapshot } from "library/classes/BlockSnapshot";
import { BlockInteractionTypes } from "library/definitions/areasWorld";

world.afterEvents.playerPlaceBlock.subscribe(({block, player}) => {

    // Don't log if the player is in inspector mode
    // This shouldn't even trigger as its an after event
    // Inspector mode doesn't allow block placement anyway
    const session = Areas.getPlayerSession(player)
    if (session.inspectorEnabled) return

    const blockSnapshot = new BlockSnapshot(block)
    const time = Date.now()
    Areas.Database.Block.logBlockEvent(time, blockSnapshot, BlockInteractionTypes.BlockPlaced, player)
})

// Checks if a block is initialised, if not, then initialise
world.beforeEvents.playerPlaceBlock.subscribe(event => {

    // Don't log if the player is in inspector mode
    const session = Areas.getPlayerSession(event.player)
    if (session.inspectorEnabled) return

    const block = event.block
    Areas.Database.Block.safelyInitialiseBlock(block)
})

// console.log("Block place listener active.")