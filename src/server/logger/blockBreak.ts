/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockBreak.ts
 * Author: Aevarkan
 */

import { Block, DimensionLocation, system, Vector3, world } from "@minecraft/server";
import { Database } from "library/classes/AreasDatabase";
import { BlockSnapshot } from "library/classes/BlockSnapshot";
import { PlayerSession } from "library/classes/PlayerSession";
import { BlockInteractionTypes } from "library/definitions/areasWorld";

// We cannot use after events, this is because the block is already destroyed.
// We're assuming all destruction means that block is now air.
// (It is, we can always use the after event to confirm of course. No need to though)
// We can't detect natural events

world.beforeEvents.playerBreakBlock.subscribe(({block, dimension, player}) => {

    // Don't log if the player is in inspector mode
    const session = new PlayerSession(player)
    if (session.isInspectorEnabled) return

    const time = Date.now()
    const blockSnapshot = new BlockSnapshot(block)

    const blockLocation: DimensionLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
        dimension: dimension
    }

    // world.structureManager.createFromWorld
    // const item = block.getItemStack()
    // const struct = world.structureManager.createFromWorld()

    Database.Block.logBlockEvent(time, blockSnapshot, BlockInteractionTypes.BlockBroken, player)

    // We wait a tick to see if the block actually changes
    // If the block is still there, then remove the entry
    // This will be useful for later when we save NBT blocks
    system.runTimeout(() => {
        const newBlock = dimension.getBlock(blockLocation)
        const newBlockTypeId = newBlock.typeId

        // Remove the log if nothing happens
        if (blockSnapshot.typeId === newBlockTypeId) {
            Database.Block.removeLoggedEvent(time, blockLocation)
        }

    }, 1)
})

// There is a console error here when maces create explosions
// I don't know how to fix that
// It doesn't really matter, but it's very annoying
world.beforeEvents.explosion.subscribe((event) => {
    const time = Date.now()
    const affectedBlocks = event.getImpactedBlocks()
    const entity = event.source

    affectedBlocks.forEach(block => {
        const blockSnapshot = new BlockSnapshot(block)

        Database.Block.logBlockEvent(time, blockSnapshot, BlockInteractionTypes.BlockExploded, entity)
    })
})
