/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: EntityDatabse.ts
 * Author: Aevarkan
 */

import { DimensionLocation, Entity, Player } from "@minecraft/server"
import { EntityInteractionTypes } from "library/definitions/areasWorld"

class EntityEventDatabase {

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

export const EntityDatabase = new EntityEventDatabase()