/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: inspect.ts
 * Author: Aevarkan
 */

import { CommandPermissionLevel, CustomCommand, CustomCommandOrigin, CustomCommandResult, CustomCommandStatus, Player, system, world } from "@minecraft/server";

const inspectCommand: CustomCommand = {
    description: "Toggles inspect mode.",
    name: "areas:inspect",
    permissionLevel: CommandPermissionLevel.Admin,
}

system.beforeEvents.startup.subscribe(event => {
    const registry = event.customCommandRegistry
    registry.registerCommand(inspectCommand, inspectCommandFunction)
})

function inspectCommandFunction(origin: CustomCommandOrigin): CustomCommandResult {

    const player = origin.sourceEntity as Player
    player.sendMessage("Sucess!")

    const result: CustomCommandResult = {
        status: CustomCommandStatus.Success
    }
    return result
}