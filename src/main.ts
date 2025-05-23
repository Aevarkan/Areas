/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: main.ts
 * Author: Aevarkan
 */

import "./versionCounter"
import "./server/index"

import { CURRENT_VERSION } from "constants"

console.info(`§aAreas §b${CURRENT_VERSION}§a loaded.§r`)