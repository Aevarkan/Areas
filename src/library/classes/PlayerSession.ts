/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: InspectorSession.ts
 * Author: Aevarkan
 */

import { DimensionLocation, Player, RawMessage } from "@minecraft/server";
import config from "config";
import { DatabaseQueryTypes } from "library/definitions/areasWorld";
import { BlockRecordQueryOptions } from "library/definitions/query";
import { Utility } from "./Utility";
import { MessageInfo } from "library/definitions/rawMessages";

const IS_INSPECTOR_ENABLED_DP = "inspector"

/**
 * Represents a player's current status for Areas.
 * @remarks This includes both inspector functionality and plot functionality.
 */
export class PlayerSession {
    /**
     * The player this inspector session is for.
     */
    public readonly player: Player
    /**
     * Whether inspector mode is enabled for the player.
     */
    public inspectorEnabled: boolean
    /**
     * Whether the player is an operator.
     */
    public readonly isOperator: boolean

    constructor(player: Player) {
        this.player = player
        // this.isInspectorEnabled = player.getDynamicProperty(IS_INSPECTOR_ENABLED_DP) as boolean ?? false
        this.inspectorEnabled = false
        this.isOperator = false

        // When there is isOp, add that too
        if (config.operatorTag && player.hasTag(config.operatorTag)) {
            this.isOperator = true
        }
    }

    /**
     * Gets the player's block query options.
     */
    public getBlockQueryOptions(): BlockRecordQueryOptions {

        const queryOptions: BlockRecordQueryOptions = {
            timeOptions: undefined,
            entityOptions: undefined,
            interaction: undefined
        }

        return queryOptions
    }

    /**
     * Checks if a player has permission to place a block here.
     * @param location The location to check.
     * @remarks This doesn't check for inspector mode.
     */
    public hasPlacePermission(location: DimensionLocation) {

    }

    /**
     * Sends the player the results of inspect mode.
     * @param rawMessages The fully formatted inspect mode raw messages.
     * @param logType The type of query to show records for.
     * @param messageInformation Additional information associated with the log type.
     * @remarks Headers and footers should not be included in the array.
     */
    public sendInspectMessage(rawMessages: RawMessage[], logType: DatabaseQueryTypes, messageInformation: MessageInfo) {
        
        // Add the message header to the top
        const headerMessage = Utility.RawText.parseMessageHeader(logType, messageInformation)
        rawMessages.unshift(headerMessage)

        // Add the message footer to the bottom
        const footerMessageNoPrefix: RawMessage = {
            translate: "inspector.messageFooter"
        }
        const footerMessage = Utility.RawText.addPrefix(footerMessageNoPrefix, 1)
        rawMessages.push(footerMessage)

        rawMessages.forEach(message => {
            this.player.sendMessage(message)
        })
    }

    /**
     * Sends the player a message with the addon's prefix.
     * @param message The localisation string of the message or a {@link RawMessage}.
     * @remarks The localisation string cannot have substitution markers (anything with %s).
     * @remarks Example string id: `inspector.recordNoEntityCause`
     */
    public sendAreasMessage(message: string | RawMessage) {

        let rawMessage: RawMessage
        if (typeof message === "string") {
            rawMessage = { translate: message }
        } else {
            rawMessage = message
        }
        

        const completeMessage = Utility.RawText.addPrefix(rawMessage, 0)

        this.player.sendMessage(completeMessage)
    }
}