/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: constants.ts
 * Author: Aevarkan
 */

// The python script will insert the version number
export const CURRENT_VERSION = "v{{VERSION}}"

// For compressing numbers 
export const BASE64 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/"

export const MILLISECONDS_SECOND = 1000
export const MILLISECONDS_MINUTE = MILLISECONDS_SECOND * 60
export const MILLISECONDS_HOUR = MILLISECONDS_MINUTE * 60
export const MILLISECONDS_DAY = MILLISECONDS_HOUR * 24
export const MILLISECONDS_MONTH = MILLISECONDS_DAY * 30
export const MILLISECONDS_YEAR = MILLISECONDS_MONTH * 365
