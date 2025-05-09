/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: InspectorSession.ts
 * Author: Aevarkan
 */

import { DimensionLocation, Player } from "@minecraft/server";
import config from "config";
import { BlockRecordQueryOptions } from "library/definitions/query";

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
    private isInspectorEnabled: boolean
    /**
     * Whether the player is an operator.
     */
    public readonly isOperator: boolean

    constructor(player: Player) {
        this.player = player
        // this.isInspectorEnabled = player.getDynamicProperty(IS_INSPECTOR_ENABLED_DP) as boolean ?? false
        this.isInspectorEnabled = false
        this.isOperator = false

        // When there is isOp, add that too
        if (config.OperatorTag && player.hasTag(config.OperatorTag)) {
            this.isOperator = true
        }

        // DEBUG
        this.isInspectorEnabled = true
    }

    /**
     * @remarks
     * Setter: Enables/Disables inspector mode for the player.
     */
    public set inspectorEnabled(enabled: boolean) {
        this.isInspectorEnabled = enabled
        this.player.setDynamicProperty(IS_INSPECTOR_ENABLED_DP, enabled)
    }

    /**
     * @remarks
     * Getter: Gets if inspector mode is enabled for the player.
     */
    public get inspectorEnabled() {
        return this.isInspectorEnabled
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
}