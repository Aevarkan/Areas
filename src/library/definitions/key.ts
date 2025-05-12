/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: key.ts
 * Author: Aevarkan
 */

import { DimensionLocation } from "@minecraft/server";

export interface DatabaseKeyRecord {
    /**
     * The original key id stored in the dynamic property.
     */
    id: string
    time: number,
    location: DimensionLocation
}

// export interface DatabaseKeyValuePair {
//     key: DatabaseKeyRecord,
//     value: 
// }