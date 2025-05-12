/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: config.ts
 * Author: Aevarkan
 */

import { CommandPermissionLevel } from "@minecraft/server";

/**
 * Configuration settings.
 */
export default {
    /**
     * The tag to check if a player should have admin permissions according to Areas.
     * @remarks set this to undefined to not have a tag.
     */
    operatorTag: "areas:admin",
    /**
     * Whether Areas should check
     */
    checkForOp: true,
    /**
     * How a record should appear when its not rolled back.
     * @remarks This should have "\u00A7" at the start.
     * @remarks Inputting multiple colours will cause them to cycle.
     */
    recordFormatCode: ["\u00A7s", "\u00A7q"],
    // recordFormatCode: ["\u00A7c", "\u00A76", "\u00A7e", "\u00A72", "\u00A79", "\u00A7u"], // Uncomment this for a rainbow.
    /**
     * How a record should appear when its rolled back.
     * @remarks This should have "\u00A7" at the start.
     * @remarks Inputting multiple colours will cause them to cycle.
     */
    rolledBackRecordFormatCode: ["\u00A7p\u00A7o", "\u00A7s\u00A7v"],
    // rolledBackRecordFormatCode: ["\u00A7c\u00A7o", "\u00A76\u00A7o", "\u00A7e\u00A7o", "\u00A72\u00A7o", "\u00A79\u00A7o", "\u00A7u\u00A7o"], // Uncomment this for a rainbow.
    /**
     * Debug logging.
     */
    log: false,
    /**
     * The prefix that will appear in front of every message.
     * @remarks The second prefix only appears at the end of many messages (e.g. when showing logs).
     */
    messagePrefix: ["\u00A7s\u00A7lAreas >>\u00A7r ", "\u00A7s\u00A7lAreas <<\u00A7r "],
    /**
     * The command permission level required to do commands.
     * @remarks Set this to `CommandPermissionLevel.Any` to let anyone run commands.
     */
    commandPermissionLevel: CommandPermissionLevel.Admin
}