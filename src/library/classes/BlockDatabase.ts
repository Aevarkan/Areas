/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: BlockDatabase.ts
 * Author: Aevarkan
 */

import { DimensionLocation, Entity, Player, system, world } from "@minecraft/server";
import { BlockSnapshot } from "./BlockSnapshot";
import { DatabaseEntityTypes, BlockInteractionTypes, DatabaseValue } from "library/definitions/areasWorld";
import { BlockRecordQueryOptions } from "library/definitions/query";
import { DatabaseKeyRecord } from "library/definitions/key";
import { Utility } from "./Utility";
import { BlockEventRecord, BlockEventRecordValue } from "library/definitions/record";
import { DatabaseInvalidCharacterError } from "./Errors";
import config from "config";

// const BLOCK_EVENT_PREFIX = "blockEvent"
const BLOCK_EVENT_PREFIX = "b" // We really need to conserve space

export class BlockDatabase {

    /**
     * Logs an block event (e.g. Broken block) to the database.
     * @param time The unix time of this event happening.
     * @param block The block affected by the interaction.
     * @param interaction The type of interaction.
     * @param location Where the interaction happened.
     * @param entity The optional entity that was responsible for the interaction.
     */
    public logBlockEvent(time: number, block: BlockSnapshot, interaction: BlockInteractionTypes, entity?: Entity) {
        const isRolledBack = false // This is false because we just made the event
        const serialisedData = this.serialiseBlockEvent(block, interaction, time, isRolledBack, entity)
        world.setDynamicProperty(serialisedData.key, serialisedData.value)

    }

    /**
     * Removes a logged blockevent from the database.
     * @param time The time of this blockevent happening.
     * @param location The location of the blockevent.
     */
    public removeLoggedEvent(time: number, location: DimensionLocation) {
        const key = this.serialiseKey(time, location)
        world.setDynamicProperty(key, undefined)
    }

    /**
     * Serialises a block event into a compact string.
     * @param block The block that was effected.
     * @param interaction What happened to the block.
     * @param time Unix time of the block event.
     * @param isRolledBack Whether the event has been rolled back.
     * @param entity The optional entity that caused the interaction.
     * @returns A key value pair of the event in string form.
     */
    private serialiseBlockEvent(block: BlockSnapshot, interaction: BlockInteractionTypes, time: number, isRolledBack: boolean, entity?: Entity) {
        // In the database, it should be saved as:
        // Key:
        // blockEvent.time.x.y.z.dimension
        // Value:
        // interaction,blockTypeId,isNBT?,structureId(if it's an nbt, otherwise null),sourceEntityId(Use a number if player)

        const blockLocation: DimensionLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z,
            dimension: block.dimension,
        }

        const key = this.serialiseKey(time, blockLocation)
        const value = this.serialiseValue(block, interaction, isRolledBack, entity)

        return {key, value}
    }

    /**
     * Serialises the key for the block event.
     * @param time The unix time of the block event.
     * @param blockLocation The location of the block.
     * @returns The key in string form.
     */
    private serialiseKey(time: number, blockLocation: DimensionLocation): string {

        const base64Time = Utility.compressNumber(time)
        const blockX = Utility.compressNumber(blockLocation.x)
        const blockY = Utility.compressNumber(blockLocation.y)
        const blockZ = Utility.compressNumber(blockLocation.z)
        const blockDimension = blockLocation.dimension.id

        if (
            BLOCK_EVENT_PREFIX.includes(".") ||
            base64Time.toString().includes(".") ||
            blockX.toString().includes(".") ||
            blockY.toString().includes(".") ||
            blockZ.toString().includes(".") ||
            blockDimension.toString().includes(".")
        ) {
            system.run(() => world.sendMessage("Areas: Something has gone very wrong with the database, please notify the developer. Full stop found."))
            throw new DatabaseInvalidCharacterError('Invalid character "." found in key.')
        }

        // console.log("Compressed " + base64Time + " original: " + time )

        // Must all be strings
        const key = `${BLOCK_EVENT_PREFIX}.${base64Time}.${blockX}.${blockY}.${blockZ}.${blockDimension}`
        return key
    }

    /**
     * Serialises the value for the block event.
     * @param block The block's snapshot {@link BlockSnapshot}
     * @param interaction The type of interaction that caused this event.
     * @param entity The optional entity that caused the event.
     * @returns The value in string form.
     */
    private serialiseValue(block: BlockSnapshot, interaction: BlockInteractionTypes, isRolledBack: boolean, entity?: Entity) {
        // Value
        // * interaction is given as an arguement
        const blockTypeId = block.typeId

        // Implement NBT checking later
        // const isNBT = Utility.hasNBT(block)
        const isNBT = true
        const structureId = DatabaseValue.NULL
        const isNBTString = isNBT === true ? DatabaseValue.True : DatabaseValue.NULL
        const isRolledBackString = isRolledBack ? DatabaseValue.True : DatabaseValue.NULL

        // Use the type id if an entity, otherwise uses the id for a player
        // "null" if no source entity
        let sourceEntityId = DatabaseValue.NULL as string
        if (entity) {
            if (!(entity instanceof Player)) {
                // An entity is stored with type id
                sourceEntityId = entity.typeId
            }
            // A player will just be stored as numeric id
            else {
                sourceEntityId = entity.id
            }
        }

        if (config.log) {
            console.log("Serialised block interaction as: " + interaction)
        }

        if (
            interaction.includes(",") ||
            blockTypeId.includes(",") ||
            isNBTString.includes(",") ||
            structureId.includes(",") ||
            isRolledBackString.includes(",") ||
            sourceEntityId.includes(",")
        ) {
            system.run(() => world.sendMessage("Areas: Something has gone very wrong with the database, please notify the developer. Comma found."))
            throw new DatabaseInvalidCharacterError('Invalid character "," found in value.')
        }

        // Must all be strings
        const value = `${interaction},${blockTypeId},${isNBTString},${structureId},${sourceEntityId},${isRolledBackString}`
        return value
    }

    /**
     * Unserialises a stored block event value.
     * @remarks This doesn't work for the key.
     * @param value The block event value.
     */
    private unserialiseBlockEventRecord(value: string) {
        const parts = value.split(",")
        
        const interaction = parts[0] as BlockInteractionTypes // This is certain due to how its saved
        const blockTypeId = parts[1]
        const isNBTString = parts[2]
        const structureId = parts[3]
        const sourceEntityId = parts[4]
        const isRolledBackString = parts[5]

        const isNBT = isNBTString === DatabaseValue.True ? true : false
        const isRolledBack = isRolledBackString === DatabaseValue.True ? true : false

        let entityType: DatabaseEntityTypes
        // These are set as undefined, then changed
        let causeEntityTypeId = undefined
        let causePlayerId = undefined
        if (sourceEntityId === DatabaseValue.NULL) {
            entityType = DatabaseEntityTypes.None
        } else if (Utility.isId(sourceEntityId)) {
            entityType = DatabaseEntityTypes.Player
            causePlayerId = sourceEntityId
        } else {
            entityType = DatabaseEntityTypes.NonPlayerEntity
            causeEntityTypeId = sourceEntityId
        }

        if (config.log) {
            console.log("Unserialised block interaction as: " + interaction)
        }

        const blockRecordValue: BlockEventRecordValue = {
            id: value,
            interaction: interaction,
            typeId: blockTypeId,
            isNBT: isNBT,
            causeEntityType: entityType,
            structureId: isNBT ? structureId : undefined,
            causeEntityTypeId: causeEntityTypeId,
            causePlayerId: causePlayerId,
            isRolledBack: isRolledBack
        }

        return blockRecordValue
    }

    /**
     * Safely initialises a block, preventing overwrites.
     * @param block The block snapshot to initialise.
     */
    public safelyInitialiseBlock(block: BlockSnapshot) {
        const isInitialised = this.isBlockInitialised(block)
        if (!isInitialised) {
            this.initialiseBlock(block)
        }
    }

    /**
     * Checks if a block is initialised or not.
     * @returns true if initiliased, otherwise false.
     */
    private isBlockInitialised(blockLocation: DimensionLocation) {
        const time = 0 // Initialisation uses time 0
        const key = this.serialiseKey(time, blockLocation)

        const recordKey = world.getDynamicProperty(key)

        // If there's a key, then it's initialised
        let initialised = false
        if (recordKey) {
            initialised = true
        }
        return initialised
    }

    /**
     * Special case of logging a block where this is the first time it is recorded in the database.
     * @param block The block's snapshot.
     * @remarks This doesn't need a timestamp.
     */
    private initialiseBlock(block: BlockSnapshot) {
        // We use the special initialise interaction and set the time to 0
        const interactionType = BlockInteractionTypes.BlockInitialise
        const time = 0 // 1st Jan 1970
        const isRolledBack = false

        // Everything else is the same
        const serialisedBlockEvent = this.serialiseBlockEvent(block, interactionType, time, isRolledBack)
        const key = serialisedBlockEvent.key
        const value = serialisedBlockEvent.value

        world.setDynamicProperty(key, value)
    }

    public safelyDeinitialiseBlock(block: BlockSnapshot) {

        // We can't deinitialise a non existent record
        if (!(this.isBlockInitialised(block))) return

        // We get every record
        const records = this.getBlockRecord(block, undefined)

        // If there's more than 1 record, we can't deinitialise it.
        if (records.length > 1) return

        // The danger is removing a initialisation record when the block is different, we check this now.
        const record = records[0]
        if (block.typeId !== record.typeId) return

        // Really check that the record is the initial one
        // This should never trigger as a normal record isn't ever created without an initial one.
        if (record.time !== 0) return

        // Now this is just getting paranoid
        if (record.interaction !== BlockInteractionTypes.BlockInitialise) return

        // Now we can be sure nothing has ever happened to this block
        this.removeLoggedEvent(0, block)
    }

    /**
     * Gets the blockevent records for the whole world.
     * @param queryOptions Options on what to filter by.
     * @returns A block event record array, sorted by oldest to newest.
     */
    public getBlockRecords(queryOptions?: BlockRecordQueryOptions): BlockEventRecord[] {
        const blockRecordKeyStrings = this.getBlockRecordKeys()
        const blockRecordKeys = this.unserialiseBlockRecordKeys(blockRecordKeyStrings)

        // Filter by options (only time for keys)
        const queryMatchingKeys = blockRecordKeys.filter(key => this.isKeyMatchingBlockQuery(key, queryOptions))

        // Now get the record
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
                structureId: blockRecordValue.structureId,
                isRolledBack: blockRecordValue.isRolledBack
            }

            blockRecords.push(blockRecord)
        })

        const filteredRecords = blockRecords.filter(record => this.isRecordMatchingQuery(record, queryOptions))

        // Sort the records by time
        filteredRecords.sort((a, b) => a.time - b.time)

        return filteredRecords
    }

    /**
     * Gets the blockevent records for a single block location.
     * @param blockLocation The {@link DimensionLocation} to check.
     * @param queryOptions Options on what to filter by.
     * @returns Block event records for the location, sorted by oldest to newest.
     */
    public getBlockRecord(blockLocation: DimensionLocation, queryOptions?: BlockRecordQueryOptions): BlockEventRecord[] {
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
                structureId: blockRecordValue.structureId,
                isRolledBack: blockRecordValue.isRolledBack
            }

            blockRecords.push(blockRecord)
        })

        const filteredRecords = blockRecords.filter(record => this.isRecordMatchingQuery(record, queryOptions))

        // Sort the records by time
        filteredRecords.sort((a, b) => a.time - b.time)

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
            if (filterEntityType === DatabaseEntityTypes.NonPlayerEntity) {
                const filterEntityTypeId = query.entityOptions.entityTypeId
                if (filterEntityTypeId !== record.causeEntityTypeId) {
                    isMatching = false
                }

            } else if (filterEntityType === DatabaseEntityTypes.Player) {
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
        const keyTime = key.time

        // We assume it matches, and test if it doesn't
        let isMatching = true

        // We only check if the query specifies a time
        if (query.timeOptions) {
            const queryTime = query.timeOptions.time
            const isQueryBefore = query.timeOptions.queryBefore

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
        const time = Utility.uncompressNumber(parts[1])
        const blockX = Utility.uncompressNumber(parts[2])
        const blockY = Utility.uncompressNumber(parts[3])
        const blockZ = Utility.uncompressNumber(parts[4])
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