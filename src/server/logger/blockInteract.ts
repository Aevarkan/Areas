/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: blockInteract.ts
 * Author: Aevarkan
 * 
 * @remarks
 * This concerns 'item' blocks such as water buckets.
 */

import { world } from "@minecraft/server";
import { Areas } from "library/classes/AreasSystem";
import { placeInteractItems } from "library/definitions/itemData";

world.beforeEvents.playerInteractWithBlock.subscribe(({block, player, itemStack}) => {

    const session = Areas.getPlayerSession(player)

    // Inspector has its own handling
    if (session.inspectorEnabled) return

    // Separate log for hand interactions
    if (!itemStack) return

    // We only want stuff like water buckets
    if (!(placeInteractItems.includes(itemStack.typeId))) return

    

})