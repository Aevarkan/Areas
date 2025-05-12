/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: customCommands.ts
 * Author: Aevarkan
 */

import { CustomCommand, CustomCommandOrigin, CustomCommandResult } from "@minecraft/server";

export interface CustomCommandPair {
    command: CustomCommand,
    callbackFunction: (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult | undefined,
}
