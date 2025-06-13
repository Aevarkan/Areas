/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: checkStorage.ts
 * Author: Aevarkan
 */

import { CommandPermissionLevel, CustomCommand, CustomCommandOrigin, CustomCommandResult, CustomCommandStatus, Player, world } from "@minecraft/server";
import { Areas } from "library/classes/AreasSystem";
import { Utility } from "library/classes/utility/Utility";

const checkStorageCustomCommand: CustomCommand = {
    description: "Shows the storage usage of Areas.",
    name: "areas:storageuse",
    permissionLevel: CommandPermissionLevel.Admin,
}

function checkStorage(origin: CustomCommandOrigin): CustomCommandResult {

    const player = origin.sourceEntity
    let result: CustomCommandResult = {
        status: CustomCommandStatus.Failure
    }

    if (!(player instanceof Player)) return result

    result = { status: CustomCommandStatus.Success }

    const session = Areas.getPlayerSession(player)
    
    // Redo this later to have nicer formatting
    const storageUsage = world.getDynamicPropertyTotalByteCount()
    const storageInfo = Utility.Units.calculateStorage(storageUsage)
    const storageMessage = Utility.RawText.parseStorage(storageInfo)

    session.sendAreasMessage(storageMessage)
    
    return result
}

Areas.Commands.registerCommand(checkStorageCustomCommand, checkStorage)
