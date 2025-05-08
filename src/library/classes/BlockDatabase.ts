/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: BlockDatabase.ts
 * Author: Aevarkan
 */

import { Dimension, DimensionLocation, Entity, EntityTypes, Player, world } from "@minecraft/server";
import { BlockData } from "./BlockWrapper";
import { BlockSnapshot } from "./BlockSnapshot";
import { AreasEntityTypes, BlockInteractionTypes } from "library/definitions/areasWorld";
import { Database } from "./AreasDatabase";
import { BlockRecordQueryOptions } from "library/definitions/query";
import { DatabaseKeyRecord } from "library/definitions/key";
import { Utility } from "./Utility";
import { BlockEventRecord, BlockEventRecordValue } from "library/definitions/record";

const BLOCK_EVENT_PREFIX = "blockEvent"

export class BlockDatabase {

    /**
     * Gets all the logs for a specific location.
     */
    public getLocationHistory(location: DimensionLocation) {

    }

    /**
     * Logs an block event (e.g. Broken block) to the database.
     * @param time The unix time of this event happening.
     * @param block The block affected by the interaction.
     * @param interaction The type of interaction.
     * @param location Where the interaction happened.
     * @param entity The optional entity that was responsible for the interaction.
     */
    public logBlockEvent(time: number, block: BlockSnapshot, interaction: BlockInteractionTypes, entity?: Entity) {

        // We cannot get the time here, this is not good practice (what if the logging takes a while?)
        // const time = Date.now()
        const serialisedData = this.serialiseBlockEvent(block, interaction, time, entity)

        console.log(serialisedData.key, serialisedData.value)

        // Unserialising for test
        const unserialisedData = this.unserialiseBlockEventRecord(serialisedData.value)
        const entityType = unserialisedData.causeEntityType

        console.log("Interaction type: ", unserialisedData.interaction)
        console.log("NBT: ", unserialisedData.isNBT)
        console.log("Entity type: ", entityType)
        console.log("Source Entity: ", unserialisedData.causeEntityTypeId)

        if (entityType == AreasEntityTypes.Player) {
            const playerId = unserialisedData.causePlayerId
            const playerName = Database.Names.getPlayerName(playerId)
            console.log("Player Name: ", playerName)
        }
    }

    /**
     * Serialises a block event into a compact string.
     * @param block The block that was effected.
     * @param interaction What happened to the block.
     * @param time Unix time of the block event.
     * @param entity The optional entity that caused the interaction.
     * @returns A key value pair of the event in string form.
     */
    private serialiseBlockEvent(block: BlockSnapshot, interaction: BlockInteractionTypes, time: number, entity?: Entity) {
        // In the database, it should be saved as:
        // Key:
        // blockEvent.time.x.y.z.dimension
        // Value:
        // interaction,blockTypeId,isNBT?,structureId(if it's an nbt, otherwise "null"),sourceEntityId(Use a number if player)

        // Key
        // * blockEvent is the prefix
        // * time is given as an argument
        const blockX = block.location.x
        const blockY = block.location.y
        const blockZ = block.location.z
        const blockDimension = block.dimension.id

        // Must all be strings
        const key = `${BLOCK_EVENT_PREFIX}.${time}.${blockX}.${blockY}.${blockZ}.${blockDimension}`

        // Value
        // * interaction is given as an arguement
        const blockTypeId = block.typeId

        // Implement NBT checking later
        const isNBT = BlockData.hasNBT(block)
        const structureId = "null"
        const isNBTString = isNBT === true ? "1" : "0"

        // Use the type id if an entity, otherwise uses the id for a player
        // "null" if no source entity
        let sourceEntityId = "null"
        if (!(entity instanceof Player)) {
            // An entity is stored with type id
            sourceEntityId = entity.typeId
        }
        // A player will just be stored as numeric id
        else {
            sourceEntityId = entity.id
        }

        // Must all be strings
        const value = `${interaction},${blockTypeId},${isNBTString},${structureId},${sourceEntityId}`

        return {key, value}
    }

    /**
     * Unserialises a stored block event value.
     * @remarks This doesn't work for the key.
     * @param value 
     */
    private unserialiseBlockEventRecord(value: string) {
        const parts = value.split(",")
        
        const interaction = parts[0] as BlockInteractionTypes // This is certain due to how its saved
        const blockTypeId = parts[1]
        const isNBTString = parts[2]
        const structureId = parts[3]
        const sourceEntityId = parts[4]

        const isNBT = isNBTString === "1" ? true : false

        let entityType: AreasEntityTypes
        // These are set as undefined, then changed
        let causeEntityTypeId = undefined
        let causePlayerId = undefined
        if (sourceEntityId === "null") {
            entityType = AreasEntityTypes.None
        } else if (this.isId(sourceEntityId)) {
            entityType = AreasEntityTypes.Player
            causePlayerId = sourceEntityId
        } else {
            entityType = AreasEntityTypes.NonPlayerEntity
            causeEntityTypeId = sourceEntityId
        }

        const blockRecordValue: BlockEventRecordValue = {
            id: value,
            interaction: interaction,
            typeId: blockTypeId,
            isNBT: isNBT,
            causeEntityType: entityType,
            structureId: isNBT ? structureId : undefined,
            causeEntityTypeId: causeEntityTypeId,
            causePlayerId: causePlayerId
        }

        return blockRecordValue
    }

    /**
     * Checks if a string is a type id or entity id.
     * @param string The id to check.
     * @returns true if an entity id, otherwise false
     * @remarks Type ids are typically stored as namespace:id, entity ids are purely numbers.
     * @remarks Areas stores entities with type ids and players with numeric ids.
     */
    private isId(string: string): boolean {
        const regex = /^-?\d+$/
        return regex.test(string)
    }

    /**
     * Special case of logging a block where this is the first time it is recorded in the database.
     * @remarks This doesn't need a timestamp.
     */
    public initialiseBlock(block: BlockSnapshot) {
        // We use the special initialise interaction and set the time to 0
        const interactionType = BlockInteractionTypes.BlockInitialise
        const time = 0 // 1st Jan 1970

        // Everything else is the same
        const serialisedBlockEvent = this.serialiseBlockEvent(block, interactionType, time)
        const key = serialisedBlockEvent.key
        const value = serialisedBlockEvent.value

        world.setDynamicProperty(key, value)
    }

    /**
     * Gets the blockevent records for a single block location.
     * @param blockLocation The {@link DimensionLocation} to check.
     * @param queryOptions Options on what to filter by.
     */
    public getBlockRecord(blockLocation: DimensionLocation, queryOptions: BlockRecordQueryOptions) {
        const blockRecordKeys = this.getBlockRecordKeys()

        const keyObjects = this.unserialiseBlockRecordKeys(blockRecordKeys)

        // Filter by the location
        const locationMatchingKeys = keyObjects.filter(key => Utility.isMatchingLocation(key.location, blockLocation))

        // Filter by options (only time for keys)
        const queryMatchingKeys = locationMatchingKeys.filter(key => this.isKeyMatchingBlockQuery(key, queryOptions))

        // This is all the filtering we can do with the keys, so now we need the record
        const blockRecords = [] as BlockEventRecord[]
        queryMatchingKeys.forEach(key => {
            const value = world.getDynamicProperty(key.id) as string
            const blockRecordValue = this.unserialiseBlockEventRecord(value)

            // Combine data from the key to get the full record
            const blockRecord: BlockEventRecord = {
                time: key.time,
                location: key.location,
                causeEntityType: blockRecordValue.causeEntityType,
                interaction: blockRecordValue.interaction,
                isNBT: blockRecordValue.isNBT,
                typeId: blockRecordValue.typeId,
                causeEntityTypeId: blockRecordValue.causeEntityTypeId,
                causePlayerId: blockRecordValue.causePlayerId,
                structureId: blockRecordValue.structureId
            }

            blockRecords.push(blockRecord)
        })

        const filteredRecords = blockRecords.filter(record => this.isRecordMatchingQuery(record, queryOptions))
        return filteredRecords
    }

    /**
     * Checks if a record matches the query.
     * @param record The record.
     * @param query The record query.
     * @returns true if it matches, otherwise false
     */
    private isRecordMatchingQuery(record: BlockEventRecord, query: BlockRecordQueryOptions) {
        // We assume it matches, and try to find a contradiction.
        let isMatching = true

        // Check if the time matches (This is done already when we check the key, but putting it here anyway)
        if (query.timeOptions) {

            // We're querying before, so if the key's time is after (greater), it doesn't match
            if (query.timeOptions.queryBefore) {

                if (record.time >= query.timeOptions.time) {
                    isMatching = false
                }
            }

            // Vice versa
            else {
                if (record.time <= query.timeOptions.time) {
                    isMatching = false
                }
            }
        }

        // Check for the interaction type (cause)
        if (query.interaction) {
            if (query.interaction !== record.interaction) {
                isMatching = false
            }
        }

        // Now check for entities (including players)
        if (query.entityOptions) {
            const filterEntityType = query.entityOptions.entityType
            if (filterEntityType === AreasEntityTypes.NonPlayerEntity) {
                const filterEntityTypeId = query.entityOptions.entityTypeId
                if (filterEntityTypeId !== record.causeEntityTypeId) {
                    isMatching = false
                }

            } else if (filterEntityType === AreasEntityTypes.Player) {
                const filterPlayerId = query.entityOptions.playerId
                if (filterPlayerId !== record.causePlayerId) {
                    isMatching = false
                }
            }

        }

        return isMatching
    }

    /**
     * Checks if a record key matches the query.
     * @param key The key.
     * @param query The record query.
     * @returns true if it matches, otherwise false
     */
    private isKeyMatchingBlockQuery(key: DatabaseKeyRecord, query: BlockRecordQueryOptions) {
        const queryTime = query.timeOptions.time
        const isQueryBefore = query.timeOptions.queryBefore
        const keyTime = key.time

        // We assume it matches, and test if it doesn't
        let isMatching = true

        // We only check if the query specifies a time
        if (query.timeOptions) {

            // We're querying before, so if the key's time is after (greater), it doesn't match
            if (isQueryBefore) {

                if (keyTime >= queryTime) {
                    isMatching = false
                }
            }

            // Vice versa
            else {
                if (keyTime <= queryTime) {
                    isMatching = false
                }
            }
        }

        return isMatching
    }

    /**
     * Gets only the block record keys from the database.
     * @returns A string array of the record keys.
     * @remarks The keys will include the prefix.
     */
    private getBlockRecordKeys(): string[] {
        const allKeys = world.getDynamicPropertyIds()
        const filteredKeys = allKeys.filter(key => key.startsWith(BLOCK_EVENT_PREFIX))
        return filteredKeys
    }

    /**
     * Unserialises an array of block record keys.
     * @param key The key array.
     */
    private unserialiseBlockRecordKeys(keys: string[]) {
        const unserialisedKeys = [] as DatabaseKeyRecord[]

        keys.forEach(key => {
            const keyInfo = this.unserialiseBlockRecordKey(key)
            unserialisedKeys.push(keyInfo)
        })
        return unserialisedKeys
    }

    /**
     * Unserialises a block record key.
     * @param key The key.
     */
    private unserialiseBlockRecordKey(key: string): DatabaseKeyRecord {
        const parts = key.split(".")

        // parts[0] is the prefix
        const time = parseInt(parts[1])
        const blockX = parseInt(parts[2])
        const blockY = parseInt(parts[3])
        const blockZ = parseInt(parts[4])
        const blockDimensionString = parts[5]

        const blockDimension = world.getDimension(blockDimensionString)

        const blockLocation: DimensionLocation = {
            x: blockX,
            y: blockY,
            z: blockZ,
            dimension: blockDimension
        }

        const keyRecord: DatabaseKeyRecord = {
            id: key,
            time: time,
            location: blockLocation
        }

        return keyRecord
    }

}