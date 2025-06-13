/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockBreak.ts
 * Author: Aevarkan
 */

import { DimensionLocation, system, world } from "@minecraft/server";
import { Areas } from "library/classes/AreasSystem";
import { BlockSnapshot } from "library/classes/BlockSnapshot";
import { Utility } from "library/classes/utility/Utility";
import { BlockInteractionTypes } from "library/definitions/areasWorld";

// We cannot use after events, this is because the block is already destroyed.
// We're assuming all destruction means that block is now air.
// (It is, we can always use the after event to confirm of course. No need to though)
// We can't detect natural events

world.beforeEvents.playerBreakBlock.subscribe(({block, dimension, player}) => {

    // Don't log if the player is in inspector mode
    // Inspector mode doesn't allow block breaking anyway
    const session = Areas.getPlayerSession(player)
    if (session.inspectorEnabled) return

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

    Areas.Database.Block.safelyInitialiseBlock(blockSnapshot)
    Areas.Database.Block.logBlockEvent(time, blockSnapshot, BlockInteractionTypes.BlockBroken, player)

    // We wait a tick to see if the block actually changes
    // If the block is still there, then remove the entry
    // This will be useful for later when we save NBT blocks
    system.runTimeout(() => {
        const newBlock = dimension.getBlock(blockLocation)
        const newBlockTypeId = newBlock.typeId

        // Remove the log if nothing happens
        if (blockSnapshot.typeId === newBlockTypeId) {
            Areas.Database.Block.removeLoggedEvent(time, blockLocation)
        }

        // This uses way too much performance, we'll just need to take the storage hit.
        // And deinitialise it (no need for an if statement like above as it's already safe)
        // Database.Block.safelyDeinitialiseBlock(blockSnapshot)

    }, 1)
})

// There is a console error here when maces create explosions
// I don't know how to fix that
// It doesn't really matter, but it's very annoying
world.beforeEvents.explosion.subscribe((event) => {
    const time = Date.now()
    const affectedBlocks = event.getImpactedBlocks()
    const dimension = event.dimension
    const entity = event.source

    // We do not log fluid blocks, they're not changed by explosions and saves a lot of space by not doing it!
    affectedBlocks.filter(block => Utility.isFluidBlock(block))

    const blockSnapshots = [] as BlockSnapshot[]
    affectedBlocks.forEach(block => {
        const blockSnapshot = new BlockSnapshot(block)
        blockSnapshots.push(blockSnapshot)

        Areas.Database.Block.safelyInitialiseBlock(blockSnapshot)
        Areas.Database.Block.logBlockEvent(time, blockSnapshot, BlockInteractionTypes.BlockExploded, entity)
    })

    // Check if the explosion caused any damage 1 tick later
    system.runTimeout(() => {
        blockSnapshots.forEach(blockSnapshot => {

            const newBlock = dimension.getBlock(blockSnapshot)
            const newBlockTypeId = newBlock.typeId
    
            // Remove the log if nothing happens
            if (blockSnapshot.typeId === newBlockTypeId) {
                Areas.Database.Block.removeLoggedEvent(time, blockSnapshot)
            }
    
            // This uses way too much performance, we'll just need to take the storage hit.
            // And deinitialise it (no need for an if statement like above as it's already safe)
            // Database.Block.safelyDeinitialiseBlock(blockSnapshot)

        })

    }, 1)
})

// console.log("Block break listener active.")