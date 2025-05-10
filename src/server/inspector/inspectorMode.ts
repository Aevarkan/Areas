/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: inspectorMode.ts
 * Author: Aevarkan
 */

import { DimensionLocation, system, world } from "@minecraft/server";
import { Database } from "library/classes/AreasDatabase";
import { Areas } from "library/classes/AreasSystem";
import { PlayerSession } from "library/classes/PlayerSession";
import { Utility } from "library/classes/Utility";
import { DatabaseQueryTypes } from "library/definitions/areasWorld";
import { MessageInfo } from "library/definitions/rawMessages";

world.beforeEvents.playerPlaceBlock.subscribe(event => {
    const session = Areas.getPlayerSession(event.player)

    // We only care if inspector is enabled
    if (!(session.inspectorEnabled)) return

    // Don't place blocks in inspector mode
    event.cancel = true

    // We also initialise the block if it's not already
    Database.Block.safelyInitialiseBlock(event.block)

    const currentTime = Date.now()

    const block = event.block
    const blockLocation: DimensionLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
        dimension: block.dimension
    }

    // const player = session.player
    const playerQueryOptions = session.getBlockQueryOptions()

    const blockLogs = Database.Block.getBlockRecord(blockLocation, playerQueryOptions)

    const messages = Utility.RawText.parseBlockEventRecords(blockLogs, currentTime, false)
    const messageInfo: MessageInfo = {
        x: blockLocation.x.toString(),
        y: blockLocation.y.toString(),
        z: blockLocation.z.toString()
    }

    session.sendInspectMessage(messages, DatabaseQueryTypes.SingleLocationLog, messageInfo)
})

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const session = Areas.getPlayerSession(event.player)

    // We only care if inspector is enabled
    if (!(session.inspectorEnabled)) return

    // Don't place blocks in inspector mode
    event.cancel = true

    // We also initialise the block if it's not already
    Database.Block.safelyInitialiseBlock(event.block)

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

    const messages = Utility.RawText.parseBlockEventRecords(blockLogs, currentTime, false)
    const messageInfo: MessageInfo = {
        x: blockLocation.x.toString(),
        y: blockLocation.y.toString(),
        z: blockLocation.z.toString()
    }

    // The inspect message includes prettier formatting
    session.sendInspectMessage(messages, DatabaseQueryTypes.SingleLocationLog, messageInfo)
})