/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: BlockDatabase.ts
 * Author: Aevarkan
 */

import { Block, DimensionLocation, Entity } from "@minecraft/server";

/**
 * What can happen to a block, and how it happened.
 */
export enum BlockInteractionTypes {
    BlockBroken = "broken",
    BlockExploded = "exploded",
    BlockPlaced = "placed",

}

class _Database {

    /**
     * Gets all the logs for a specific location.
     */
    public getLocationHistory(location: DimensionLocation) {

    }

    /**
     * Appends an action (e.g. Broken block) to the database.
     * @param block The block affected by the interaction.
     * @param interaction The type of interaction.
     * @param location Where the interaction happened.
     * @param entity The optional entity that was responsible for the interaction.
     */
    public addEntry(block: Block, interaction: BlockInteractionTypes, location: DimensionLocation, entity?: Entity) {

    }
}

export const Database = new _Database()