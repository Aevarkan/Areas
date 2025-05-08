/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: record.ts
 * Author: Aevarkan
 */

import { DimensionLocation } from "@minecraft/server";
import { AreasEntityTypes, BlockInteractionTypes } from "./areasWorld";

export interface BlockEventRecordValue {
    /**
     * The original value stored in the dynamic property.
     */
    id: string,
    interaction: BlockInteractionTypes,
    typeId: string,
    isNBT: boolean,
    structureId?: string,
    causeEntityType: AreasEntityTypes,
    causeEntityTypeId?: string,
    causePlayerId?: number
}

/**
 * A full block event.
 */
export interface BlockEventRecord {
    /**
     * @remarks
     * The unix time this record was made.
     */
    time: number,
    /**
     * @remarks
     * The location of the block event record.
     */
    location: DimensionLocation,
    /**
     * @remarks
     * The type of interaction.
     */
    interaction: BlockInteractionTypes,
    /**
     * @remarks
     * The type id of the block affected block.
     */
    typeId: string,
    /**
     * @remarks
     * Whether the record contains an NBT block, for example, a chest.
     */
    isNBT: boolean,
    /**
     * @remarks
     * The structure id if the record contains an NBT block.
     */
    structureId?: string,
    /**
     * @remarks
     * The entity that caused this record to be made.
     */
    causeEntityType: AreasEntityTypes,
    /**
     * @remarks
     * The type id of the entity that caused this record to be made.
     */
    causeEntityTypeId?: string,
    /**
     * @remarks
     * The player id that caused this record to be made.
     */
    causePlayerId?: number
}