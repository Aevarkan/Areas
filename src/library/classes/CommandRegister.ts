/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: CommandRegister.ts
 * Author: Aevarkan
 */

import { CustomCommand, CustomCommandOrigin, CustomCommandResult, system } from "@minecraft/server";
import { CustomCommandPair } from "library/definitions/customCommands";

let _commandHandler: CustomCommandHandler

class CommandRegister {

    private commandsToRegister: CustomCommandPair[] = []

    /**
     * Register a new command.
     * @param command The custom command.
     * @param callbackFunction The function the command should execute.
     */
    public registerCommand(command: CustomCommand, callbackFunction: (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult | undefined) {
        
        const commandPair: CustomCommandPair = {
            command: command,
            callbackFunction: callbackFunction
        }

        this.commandsToRegister.push(commandPair)
    }

    public getCommands() {
        return this.commandsToRegister
    }

}

export const Commands = new CommandRegister()

class CustomCommandHandler {

    private commandRegister: CommandRegister

    constructor() {
        this.commandRegister = Commands
        this.registerCommands()
    }

    private registerCommands() {
        system.beforeEvents.startup.subscribe(event => {
            const commandRegister = event.customCommandRegistry

            // Register each command put in the register
            this.commandRegister.getCommands().forEach(commandPair => {
                commandRegister.registerCommand(commandPair.command, commandPair.callbackFunction)
            })
            
        })
    }
}

_commandHandler = new CustomCommandHandler()