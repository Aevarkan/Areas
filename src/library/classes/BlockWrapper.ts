/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: BlockWrapper.ts
 * Author: Aevarkan
 */

import { BlockSnapshot } from "./BlockSnapshot";

const blocksWithNBT = [
    "minecraft:chest",
    "minecraft:furnace"
]


class BlockWrapper {

    /**
     * Checks if a block has NBT data.
     * @param block The block to check.
     * @returns true if the block has NBT data, otherwise false
     */
    public hasNBT(block: BlockSnapshot) {
        const blockTypeId = block.typeId
        let hasNBT = false

        if (blocksWithNBT.includes(blockTypeId)) {
            hasNBT = true
        }
        return  hasNBT
    }
}

export const BlockData = new BlockWrapper()