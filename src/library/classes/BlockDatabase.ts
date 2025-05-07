/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: BlockDatabase.ts
 * Author: Aevarkan
 */

import { Block, DimensionLocation, Entity, Player, world } from "@minecraft/server";
import { BlockData } from "./BlockWrapper";
import { Name } from "./PlayerName";

/**
 * What can happen to a block, and how it happened.
 */
export enum BlockInteractionTypes {
    BlockBroken = "broken",
    BlockExploded = "exploded",
    BlockPlaced = "placed",

}

/**
 * What can happen to an entity, and how it happened.
 */
export enum EntityInteractionTypes {
    EntitySlain = "killed",
    EntityStarve = "starved"
}

export enum EntityTypes {
    None = "null",
    NonPlayerEntity = "entity",
    Player = "player"
}

class BlockEventDatabase {

    /**
     * Gets all the logs for a specific location.
     */
    public getLocationHistory(location: DimensionLocation) {

    }

    /**
     * Logs an block event (e.g. Broken block) to the database.
     * @param block The block affected by the interaction.
     * @param interaction The type of interaction.
     * @param location Where the interaction happened.
     * @param entity The optional entity that was responsible for the interaction.
     */
    public logBlockEvent(block: Block, interaction: BlockInteractionTypes, location: DimensionLocation, entity?: Entity) {
        
        const time = Date.now()
        const serialisedData = this.serialiseBlockEvent(block, interaction, time, entity)

        console.log(serialisedData.key, serialisedData.value)

        // Unserialising for test
        const unserialisedData = this.unserialiseBlockEventValue(serialisedData.value)
        const entityType = unserialisedData.entityType

        console.log("Interaction type: ", unserialisedData.interaction)
        console.log("NBT: ", unserialisedData.isNBT)
        console.log("Entity type: ", entityType)
        console.log("Source Entity: ", unserialisedData.sourceEntityId)

        if (entityType == EntityTypes.Player) {
            const playerId = unserialisedData.sourceEntityId
            const playerName = Name.getPlayerName(playerId)
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
    private serialiseBlockEvent(block: Block, interaction: BlockInteractionTypes, time: number, entity?: Entity) {
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
        const key = `blockEvent.${time}.${blockX}.${blockY}.${blockZ}.${blockDimension}`

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
            sourceEntityId = entity.typeId
        } else {
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
    private unserialiseBlockEventValue(value: string) {
        const parts = value.split(",")
        
        const interaction = parts[0] as BlockInteractionTypes // This is certain due to how its saved
        const blockTypeId = parts[1]
        const isNBTString = parts[2]
        const structureId = parts[3]
        const sourceEntityId = parts[4]

        const isNBT = isNBTString === "1" ? true : false

        let entityType: EntityTypes
        if (sourceEntityId === "null") {
            entityType = EntityTypes.None
        } else if (this.isId(sourceEntityId)) {
            entityType = EntityTypes.Player
        } else {
            entityType = EntityTypes.NonPlayerEntity
        }

        return {interaction, blockTypeId, isNBT, structureId, sourceEntityId, entityType}
    }

    private isId(string: string): boolean {
        const regex = /^-?\d+$/
        return regex.test(string)
    }
    

    /**
     * Special case of logging a block event where this is the first time it is recorded in the database.
     * @remarks This doesn't need a timestamp.
     */
    public initialiseBlock() {

    }

    /**
     * Logs an entity event (e.g. Entity dies) to the database.
     * @param entity The entity effected by the interaction.
     * @param interaction The type of interaction.
     * @param sourceEntity The optional entity that caused the interaction.
     */
    public logEntityEvent(entity: Entity, interaction: EntityInteractionTypes, sourceEntity?: Entity) {


        // Debug
        // const entityId = entity.id
        let entityTypeId = entity.typeId
        // const sourceEntityId = sourceEntity.id
        let sourceEntityTypeId = sourceEntity.typeId
        const dimensionLocation: DimensionLocation = {
            x: Math.floor(entity.location.x),
            y: Math.floor(entity.location.y),
            z: Math.floor(entity.location.z),
            dimension: entity.dimension
        }

        

        const locationStr = JSON.stringify(dimensionLocation)

        let entityName = "none"
        if (entity instanceof Player) {
            entityName = entity.name
            entityTypeId = entity.id
        }

        let sourceEntityName = "none"
        if (sourceEntity instanceof Player) {
            sourceEntityName = sourceEntity.name
            sourceEntityTypeId = sourceEntity.id
        }

        console.log(entityTypeId, entityName, locationStr, interaction, sourceEntityTypeId, sourceEntityName)
    }
}

export const BlockDatabase = new BlockEventDatabase()