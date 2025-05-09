/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: Errors.ts
 * Author: Aevarkan
 */

/**
 * When a database entry uses a character used in the separator.
 */
export class DatabaseInvalidCharacterError extends Error {}

/**
 * When a calcuation gives a value that is know to be wrong.
 */
export class CalculationError extends Error {}