/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: Time.ts
 * Author: Aevarkan
 */

import { system, world } from "@minecraft/server"
import { DYNAMIC_PROPERTY_TIME_OFFSET } from "constants"

/**
 * Handles everything related to time.
 */
export class Time {
    private time = Date.now()
    private offset = world.getDynamicProperty(DYNAMIC_PROPERTY_TIME_OFFSET) as number ?? 0

    // Might use this, but we can just use UTC time. (Am concerned about how world ticks and time may not match however)
    // Make a way to players to set the time in that case.
    // This does mean changing tick speed will change the time displayed, so we should just use the UTC time.
    // Time offset dynamic property???
    // private tickTime = world.getDynamicProperty("time_elapsed")

    /**
     * Gets the time offset that the server is using (For debugging only!)
     */
    public getOffset(){
        return this.offset
    }

    public setOffset(offset: number) {
        world.setDynamicProperty(DYNAMIC_PROPERTY_TIME_OFFSET, offset)
        this.offset = offset
    }
}