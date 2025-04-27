/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: Database.ts
 * Author: Aevarkan
 */

import { Block, DimensionLocation, Entity, Player, world } from "@minecraft/server";

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

class _Database {

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
        
        // Debug
        const blockTypeId = block.typeId
        const locationStr = JSON.stringify(location)
        const entityTypeId = entity.typeId
        const entityId = entity.id

        let entityName = "none"
        if (entity instanceof Player) {
            entityName = entity.name
        }


        console.log(blockTypeId, locationStr, interaction, entityTypeId, entityId, entityName)
        // world.sendMessage(blockTypeId + locationStr + interaction + entityTypeId + entityId + entityName)
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

export const Database = new _Database()