/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: query.ts
 * Author: Aevarkan
 */

import { BlockInteractionTypes, DatabaseEntityTypes, EntityInteractionTypes } from "./areasWorld"

export enum RecordQueryKind {
    Entity = "entity",
    Block = "block"
}

/**
 * Options on querying a database record.
 * @remarks abstract interface
 */
interface BaseRecordQueryOptions {
    /**
     * Options on filtering the records by time.
     */
    timeOptions?: TimeQueryOptions
    /**
     * Options on filtering the records by entity.
     */
    entityOptions?: EntityQueryOptions
}

/**
 * Options on querying an entity database record.
 */
export interface EntityRecordQueryOptions extends BaseRecordQueryOptions {
    kind: RecordQueryKind.Entity
    /**
     * The interaction type for the record to filter by.
     */
    interaction?: EntityInteractionTypes
}

/**
 * Options on querying a block database record.
 */
export interface BlockRecordQueryOptions extends BaseRecordQueryOptions {
    kind: RecordQueryKind.Block
    /**
     * The interaction type for the record to filter by.
     */
    interaction?: BlockInteractionTypes
}

export interface TimeQueryOptions {
    /**
     * The unix time to filter to/from.
     */
    time: number
    /**
     * Whether to filter time before or after.
     */
    queryBefore: boolean
}

export interface EntityQueryOptions {
    /**
     * The entity type id to filter.
     */
    entityTypeId: string
    /**
     * The entity type id to filter.
     */
    entityType: DatabaseEntityTypes
    /**
     * The optional player id to filter by.
     */
    playerId?: number
}