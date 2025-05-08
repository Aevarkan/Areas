/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: BlockSnapshot.ts
 * Author: Aevarkan
 */

import { Block, Dimension, Vector3 } from "@minecraft/server";

/**
 * Represents a block at the time it's created instead of passing by reference.
 */
export class BlockSnapshot {
    
    readonly dimension: Dimension
    readonly location: Vector3
    readonly typeId: string
    readonly isAir: boolean
    readonly isLiquid: boolean
    readonly isWaterlogged: boolean

    constructor(block: Block) {
        this.dimension = block.dimension
        this.location = block.location
        this.typeId = block.typeId
        this.isAir = block.isAir
        this.isLiquid = block.isLiquid
        this.isWaterlogged = block.isWaterlogged
    }
}