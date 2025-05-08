/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: Utility.ts
 * Author: Aevarkan
 */

import { DimensionLocation } from "@minecraft/server";

class UtilityFunctions {
    
    /**
     * Checks if a dimension location matches another one.
     */
    public isMatchingLocation(location1: DimensionLocation, location2: DimensionLocation) {
        let isMatching = false

        if (
            location1.x === location2.x &&
            location1.y === location2.y &&
            location1.z === location2.z &&
            location1.dimension.id === location2.dimension.id
        ) {
            isMatching = true
        }

        return isMatching
    }

    /**
     * Checks if a string is a type id or entity id.
     * @param string The id to check.
     * @returns true if an entity id, otherwise false
     * @remarks Type ids are typically stored as namespace:id, entity ids are purely numbers.
     * @remarks Areas stores entities with type ids and players with numeric ids.
     */
    public isId(string: string): boolean {
        const regex = /^-?\d+$/
        return regex.test(string)
    }
}

/**
 * A bunch of utility functions.
 */
export const Utility = new UtilityFunctions()