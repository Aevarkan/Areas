/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockBreak.ts
 * Author: Aevarkan
 */

import { Block, DimensionLocation, system, Vector3, world } from "@minecraft/server";
import { BlockDatabase, BlockInteractionTypes } from "library/classes/BlockDatabase";
import { BlockSnapshot } from "library/classes/BlockSnapshot";

// We cannot use after events, this is because the block is already destroyed.
// We're assuming all destruction means that block is now air.
// (It is, we can always use the after event to confirm of course. No need to though)
// We can't detect natural events

world.beforeEvents.playerBreakBlock.subscribe(({block, dimension, player}) => {

    const blockSnapshot = new BlockSnapshot(block)

    const location: Vector3 = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z
    }

    // We wait a tick to see if the block actually changes
    // This makes it compatible with other addons that may cancel the block breaking (and creative mode swords!)
    system.runTimeout(() => {
        const newBlock = dimension.getBlock(location)
        const newBlockTypeId = newBlock.typeId

        // Don't log it if nothing changes
        if (blockSnapshot.typeId == newBlockTypeId) return

        BlockDatabase.logBlockEvent(blockSnapshot, BlockInteractionTypes.BlockBroken, player)

    }, 1)
})

// There is a console error here when maces create explosions
// I don't know how to fix that
// It doesn't really matter, but it's very annoying
world.beforeEvents.explosion.subscribe((event) => {
    const affectedBlocks = event.getImpactedBlocks()
    const entity = event.source

    affectedBlocks.forEach(block => {
        const blockSnapshot = new BlockSnapshot(block)

        BlockDatabase.logBlockEvent(blockSnapshot, BlockInteractionTypes.BlockExploded, entity)
    })
})
