/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: entityDie.ts
 * Author: Aevarkan
 */

import { world } from "@minecraft/server";
import { Areas } from "library/classes/AreasSystem";
import { EntityInteractionTypes } from "library/definitions/areasWorld";

world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity
    const cause = event.damageSource.cause
    const sourceEntity = event.damageSource.damagingEntity

    Areas.Database.Entity.logEntityEvent(entity, EntityInteractionTypes.EntitySlain, sourceEntity)
})