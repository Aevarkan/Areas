/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: AreasDatabase.ts
 * Author: Aevarkan
 */

import { world } from "@minecraft/server";
import { BlockDatabase } from "./BlockDatabase";
import { EntityDatabase } from "./EntityDatabase";
import { PlayerNameDatabase } from "./PlayerName";

/**
 * General class for database handling.
 */
export class AreasDatabase {

    /**
     * The entity event database.
     * {@link EntityDatabase}
     */
    Entity: EntityDatabase
    /**
     * The block event database.
     * {@link BlockDatabase}
     */
    Block: BlockDatabase
    /**
     * The player name database.
     */
    Names: PlayerNameDatabase

    constructor() {
        this.Entity = new EntityDatabase()
        this.Block = new BlockDatabase()
        this.Names = new PlayerNameDatabase()
    }

    /**
     * Gets the total storage usage of the database
     * @returns The number of bytes the database uses.
     */
    public getStorageUsage(): number {
        const byteCount = world.getDynamicPropertyTotalByteCount()
        return byteCount
    }

    /**
     * Clears the entire database.
     */
    public clearDatabase() {
        world.clearDynamicProperties()
    }

}