/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: inspect.ts
 * Author: Aevarkan
 */

import { CommandPermissionLevel, CustomCommand, CustomCommandOrigin, CustomCommandResult, CustomCommandStatus, Player, system, world } from "@minecraft/server";
import { Areas } from "library/classes/AreasSystem";
import { Commands } from "library/classes/CommandRegister";

const inspectCustomCommand: CustomCommand = {
    description: "Toggles inspect mode.",
    name: "areas:inspect",
    permissionLevel: CommandPermissionLevel.Admin,
}

function inspectCommand(origin: CustomCommandOrigin): CustomCommandResult {

    const player = origin.sourceEntity
    let result: CustomCommandResult = {
        status: CustomCommandStatus.Failure
    }

    if (!(player instanceof Player)) return result

    result = { status: CustomCommandStatus.Success }

    const session = Areas.getPlayerSession(player)

    // Set inspector mode and send the player a message
    session.inspectorEnabled = !session.inspectorEnabled
    if (session.inspectorEnabled) {
        session.sendAreasMessage("inspector.on")
    } else {
        session.sendAreasMessage("inspector.off")
    }
    

    return result
}

Commands.registerCommand(inspectCustomCommand, inspectCommand)