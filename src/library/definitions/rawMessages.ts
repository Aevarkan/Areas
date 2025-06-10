/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: rawMessages.ts
 * Author: Aevarkan
 */

import { RawMessage } from "@minecraft/server"

/**
 * Message information for parsing rawtext.
 * @remarks Properties must be a string or RawMessage.
 * @remarks This object must be created according to its use.
 */
export interface MessageInfo {
    x?: string,
    y?: string,
    z?: string,
    playerName?: string
    entityCause?: RawMessage
}