/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockBreak.ts
 * Author: Aevarkan
 */

import { DimensionLocation, world } from "@minecraft/server";
import { BlockInteractionTypes, Database } from "library/classes/BlockDatabase";

// We cannot use after events, this is because the block is already destroyed.
// We're assuming all destruction means that block is now air.
// (It is, we can always use the after event to confirm of course. No need to though)
// We can't detect natural events

world.beforeEvents.playerBreakBlock.subscribe(({block, dimension, player}) => {
    const location: DimensionLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
        dimension: dimension
    }

    Database.addEntry(block, BlockInteractionTypes.BlockBroken, location, player)
})

// world.afterEvents.blockExplode.subscribe(({block, dimension, source}) => {
//     const location: DimensionLocation = {
//         x: block.location.x,
//         y: block.location.y,
//         z: block.location.z,
//         dimension: dimension
//     }

//     Database.addEntry(block, BlockInteractionTypes.BlockBroken, location, source)
// })


world.beforeEvents.explosion.subscribe((event) => {
    const affectedBlocks = event.getImpactedBlocks()
    const entity = event.source

    affectedBlocks.forEach(block => {
        const blockLocation: DimensionLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z,
            dimension: block.dimension
        }

        Database.addEntry(block, BlockInteractionTypes.BlockExploded, blockLocation, entity)
    })
})
