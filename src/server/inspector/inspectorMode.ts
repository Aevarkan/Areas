/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: inspectorMode.ts
 * Author: Aevarkan
 */

import { DimensionLocation, system, world } from "@minecraft/server";
import { Database } from "library/classes/AreasDatabase";
import { PlayerSession } from "library/classes/PlayerSession";
import { Utility } from "library/classes/Utility";

world.beforeEvents.playerPlaceBlock.subscribe(event => {
    const session = new PlayerSession(event.player)

    // We only care if the session is enabled
    if (!(session.inspectorEnabled)) return

    // Don't place blocks in inspector mode
    event.cancel = true

    const currentTime = Date.now()

    const block = event.block
    const blockLocation: DimensionLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
        dimension: block.dimension
    }

    const player = session.player
    const playerQueryOptions = session.getBlockQueryOptions()

    const blockLogs = Database.Block.getBlockRecord(blockLocation, playerQueryOptions)

    const messages = Utility.Message.parseBlockEventRecords(blockLogs, currentTime, false)
    // player.sendMessage(messages)
    messages.forEach(message => {
        player.sendMessage(message)
    })
})

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const session = new PlayerSession(event.player)

    // We only care if the session is enabled
    if (!(session.inspectorEnabled)) return

    // Don't place blocks in inspector mode
    event.cancel = true

    const currentTime = Date.now()

    const block = event.block
    const blockLocation: DimensionLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
        dimension: block.dimension
    }

    const player = session.player
    const playerQueryOptions = session.getBlockQueryOptions()

    // Redo this: the message should be parsed in a class!
    const blockLogs = Database.Block.getBlockRecord(blockLocation, playerQueryOptions)

    const messages = Utility.Message.parseBlockEventRecords(blockLogs, currentTime, false)
    // player.sendMessage(messages)
    messages.forEach(message => {
        player.sendMessage(message)
    })
})