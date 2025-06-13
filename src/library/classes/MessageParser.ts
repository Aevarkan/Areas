/**
 * This file is part of Areas which is released under GPL-3.0.
 * See file LICENCE or go to https://www.gnu.org/licenses/gpl-3.0.en.html for full licence details.
 * File: MessageParser.ts
 * Author: Aevarkan
 * Expected INPUTS: BlockEventRecord | EntityEventRecord
 * Expected OUTPUTS: RawMessage
 */

import { BlockEventRecord } from "library/definitions/record";
import { Utility } from "./Utility";
import { StorageInfo, StorageUnit, TimeInfo, TimeUnit } from "./UnitConverter";
import { RawMessageParseError } from "./Errors";
import { DimensionLocation, RawMessage } from "@minecraft/server";
import { BlockInteractionTypes, DatabaseEntityTypes, DatabaseQueryTypes } from "library/definitions/areasWorld";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import config from "config";
import { MessageInfo } from "library/definitions/rawMessages";
import { Areas } from "./AreasSystem";

// This is just so the colours change each line
const nonRolledBackFormats = config.recordFormatCode.length
const rolledBackFormats = config.rolledBackRecordFormatCode.length
let formatIndex = 0
let rolledBackFormatIndex = 0

function incrementFormatIndex(index: number, rolledBackIndex: boolean) {
    
    if (rolledBackIndex) {
        if (index + 1 >= rolledBackFormats) {
            index = 0
        } else {
            index++
        }
    } else {
        if (index + 1 >= nonRolledBackFormats) {
            index = 0
        } else {
            index++
        }
    }
    return index
}

export class MessageParser {

    /**
     * Adds the Areas addon prefix to a RawMessage.
     * @param message The message to add a prefix to.
     * @param prefixIndex The prefix to use, defined in `config`.
     * @returns A raw message with the prefix added.
     */
    public static addPrefix(message: RawMessage, prefixIndex: number) {
        const newMessage: RawMessage = {
            translate: "areas.combine2",
            with: { rawtext: [
                { text: config.messagePrefix[prefixIndex] },
                message
            ]}
        }
        return newMessage
    }

    /**
     * Combines two raw messages.
     * @param message1 The first message.
     * @param message2 The second message.
     * @returns A combined message.
     * @remarks The first message will come first.
     */
    private static combineMessage(message1: RawMessage, message2: RawMessage) {

        const newMessage: RawMessage = {
            translate: "areas.combine2",
            with: { rawtext: [
                message1,
                message2
            ]}
        }
        return newMessage
    }

    public static parseMessageHeader(logType: DatabaseQueryTypes, messageInformation: MessageInfo) {
        
        // Use the message body type we want
        let messageHeaderBody: RawMessage
        switch (logType) {
            case DatabaseQueryTypes.SingleLocationLog:
                messageHeaderBody = {
                    translate: "inspector.singleLocationLog",
                    with: [
                        messageInformation.x,
                        messageInformation.y,
                        messageInformation.z
                    ]
                }
                break

            case DatabaseQueryTypes.AreaLog:
                messageHeaderBody = { translate: "inspector.areaLog" }
                break

            case DatabaseQueryTypes.CauseLog:
                messageHeaderBody = { translate: "inspector.entityCauseLog", with: messageInformation.entityCause }
                break

            case DatabaseQueryTypes.PlayerLog:
                messageHeaderBody = { translate: "inspector.playerLog", with: [ messageInformation.playerName ]}
                break

            default:
                throw new RawMessageParseError("Message body parsed incorrectly.")
        }

        // Combine the with the header
        const wholeMessage: RawMessage = {
            translate: "inspector.messageHeader",
            with: { rawtext: [ messageHeaderBody ] }
        }

        // Now add the prefix
        const completeMessage = this.addPrefix(wholeMessage, 0)
        return completeMessage
    }

    /**
     * Parses a {@link blockEventRecord} into a RawMessage.
     * @param record The block event record.
     * @returns A rawmessage.
     * @remarks Example: 5 seconds ago, Herobrine placed minecraft:tnt at 100 32 100 in nether.
     */
    public static parseBlockEventRecord(record: BlockEventRecord, currentTime: number, includeLocation: boolean): RawMessage {
        const timeDiference = Utility.Units.timeDifference(currentTime, record.time)
        
        // Parse the time into human readable string
        const timeMessagePart = this.parseTime(timeDiference)

        // Parse the entity cause
        const causeEntityMessagePart = this.parseEntityCause(record.causeEntityType, record.causeEntityTypeId, record.causePlayerId)
        
        // Parse action
        const interactionPart = this.parseBlockInteraction(record.interaction)

        // Parse the block
        const blockPart = this.parseBlock(record.typeId)

        // Parse the location
        const locationMessagePart = this.parseLocation(record.location)

        // Now combine them
        let combinedMessage: RawMessage
        if (includeLocation) {
            combinedMessage = {
                translate: "inspector.recordWithLocation",
                with: { rawtext: [
                    timeMessagePart,
                    causeEntityMessagePart,
                    interactionPart,
                    blockPart,
                    locationMessagePart
                ]}
            }

        } else {
            combinedMessage = {
                translate: "inspector.recordNoLocation",
                with: { rawtext: [
                    timeMessagePart,
                    causeEntityMessagePart,
                    interactionPart,
                    blockPart
                ]}
            }

        }

        // We check if it's rolled back now and apply the colour codes from the config
        let formattedMessage: RawMessage
        if (!(record.isRolledBack)) { // Not rolled back

            // Purely cosmetic
            formatIndex = incrementFormatIndex(formatIndex, false)

            formattedMessage = {
                translate: "areas.combine2",
                with: { rawtext: [
                    { text: config.recordFormatCode[formatIndex] },
                    combinedMessage
                ]}
            }
        } else {

            // Purely cosmetic
            rolledBackFormatIndex = incrementFormatIndex(rolledBackFormatIndex, true)

            formattedMessage = {
                translate: "areas.combine2",
                with: { rawtext: [
                    { text: config.rolledBackRecordFormatCode[rolledBackFormatIndex] },
                    combinedMessage
                ]}
            }
        }

        return formattedMessage
    }

    /**
     * Parses a {@link blockEventRecord} array into a RawMessage array.
     * @param record The block event record array.
     * @returns A rawmessage array.
     */
    public static parseBlockEventRecords(records: BlockEventRecord[], currentTime: number, includeLocation: boolean): RawMessage[] {
        
        const parsedRecords = [] as RawMessage[]
        records.forEach(record => {
            const parsedRecord = this.parseBlockEventRecord(record, currentTime, includeLocation)
            parsedRecords.push(parsedRecord)
        })

        return parsedRecords
    }

    /**
     * Parses a time unit into a rawmessage string.
     * @param time The time unit.
     * @returns A raw message string.
     */
    private static parseTime(time: TimeInfo): RawMessage {
        const intervalUnit = time.biggestInterval
        const intervals = time.biggestIntervals.toString()

        let parsedTimeMessage: RawMessage
        switch (intervalUnit) {
            case TimeUnit.Years:
                parsedTimeMessage = { translate: "date.yearsPlural", with: [intervals] } // translation string not in vanilla
                break

            case TimeUnit.Months:
                parsedTimeMessage = { translate: "date.monthsPlural", with: [intervals] } // translation string not in vanilla
                break

            case TimeUnit.Days:
                parsedTimeMessage = { translate: "date.daysPlural", with: [intervals] }
                break

            case TimeUnit.Hours:
                parsedTimeMessage = { translate: "date.hoursPlural", with: [intervals] }
                break

            case TimeUnit.Minutes:
                parsedTimeMessage = { translate: "date.minutesPlural", with: [intervals] }
                break

            case TimeUnit.Seconds:
                parsedTimeMessage = { translate: "date.secondsPlural", with: [intervals] }
                break

            default:
                throw new RawMessageParseError("Block event record parsed incorrectly.")
        }
        
        return parsedTimeMessage
    }

    /**
     * Parses storage size into a rawmessage.
     * @param storage The storage info object.
     * @returns The parsed rawmessage.
     */
    public static parseStorage(storage: StorageInfo): RawMessage {
        const { largestUnit } = storage
        const largestUnitAmount = storage.largestUnitAmount.toString()

        let parsedStorageMessage: RawMessage = null
        switch (largestUnit) {
            case StorageUnit.Byte:
                parsedStorageMessage = { translate: "storage.bytesShort", with: [largestUnitAmount] }
                break

            case StorageUnit.Kilobyte:
                parsedStorageMessage = { translate: "storage.kibibytesShort", with: [largestUnitAmount] }
                break

            case StorageUnit.Megabyte:
                parsedStorageMessage = { translate: "storage.mebibytesShort", with: [largestUnitAmount] }
                break

            case StorageUnit.Gigabyte:
                parsedStorageMessage = { translate: "storage.gibibytesShort", with: [largestUnitAmount] }
                break

            case StorageUnit.Terabyte:
                parsedStorageMessage = { translate: "storage.tebibytesShort", with: [largestUnitAmount] }
                break
        
            default:
                throw new RawMessageParseError("Storage info parsed incorrectly.")
        }

        return parsedStorageMessage
    }

    /**
     * Parses the entity cause into a rawmessage string.
     * @param causeEntityType The type of entity that caused this.
     * @param entityTypeId The optional type id of the entity that caused the record.
     * @param playerId The optional id of the player that caused the record.
     */
    private static parseEntityCause(causeEntityType: DatabaseEntityTypes, entityTypeId?: string, playerId?: number): RawMessage {
        // Entity names are stored in the vanilla resource pack as example below:
        // entity.armadillo.name

        // This selects "armadillo" from "minecraft:armadillo"
        // const entityTypeIdNoNamespace = entityTypeId.split(":")[1]
        // This cannot be here though, as entityTypeId might be undefined

        let parsedEntityCause: RawMessage
        switch (causeEntityType) {
            case DatabaseEntityTypes.None:
                parsedEntityCause = { translate: "inspector.recordNoEntityCause" }
                break

            case DatabaseEntityTypes.NonPlayerEntity:
                const entityTypeIdNoNamespace = entityTypeId.split(":")[1]
                parsedEntityCause = { translate: `entity.${entityTypeIdNoNamespace}.name` }
                break

            case DatabaseEntityTypes.Player:
                const playerName = Areas.Database.Names.getPlayerName(playerId)
                parsedEntityCause = { text: playerName }
                break

            default:
                throw new RawMessageParseError("Entity cause parsed incorrectly.")
        }

        return parsedEntityCause
    }

    /**
     * Parses the location into a rawmessage string.
     * @param location The dimension location.
     * @returns A rawmessage string.
     */
    private static parseLocation(location: DimensionLocation): RawMessage {
        const xString = location.x.toString()
        const yString = location.y.toString()
        const zString = location.z.toString()

        // Dimensions are separate in the files and not very organised
        // Example: dimension.dimensionName0=Overworld
        let dimension: RawMessage
        switch (location.dimension.id) {
            case MinecraftDimensionTypes.Overworld:
                dimension = { translate: "dimension.dimensionName0" }
                break
            
            case MinecraftDimensionTypes.Nether:
                dimension = { translate: "dimension.dimensionName1"}
                break

            case MinecraftDimensionTypes.TheEnd:
                dimension = { translate: "dimension.dimensionName2"}
                break

            default:
                dimension = { translate: "areas.unknown" }
                break
        }

        // Get the coordinates
        const coordinates: RawMessage = {
            translate: "areas.coordinates",
            with: [xString, yString, zString]
        }
        
        // Combine them
        const parsedLocation: RawMessage = {
            translate: "areas.dimensionLocation",
            with: { rawtext: [coordinates, dimension] }
        }

        return parsedLocation
    }

    /**
     * Parses a block id into a raw message.
     * @param blockTypeId The block's type id.
     * @returns The raw message.
     */
    private static parseBlock(blockTypeId: string) {
        // Example: tile.sapling.spruce.name=Spruce Sapling
        const blockTypeIdNoNamespace = blockTypeId.split(":")[1]

        const rawBlockMessage: RawMessage = { translate: `tile.${blockTypeIdNoNamespace}.name` }
        return rawBlockMessage
    }

    /**
     * Parses a block interaction (e.g. block exploded).
     * @param interaction The type of interaction. ({@link BlockInteractionTypes})
     * @returns A raw message string.
     */
    private static parseBlockInteraction(interaction: BlockInteractionTypes) {
        
        let interactionMessage: RawMessage
        switch (interaction) {
            case BlockInteractionTypes.NULL:
                interactionMessage = { translate: "areas.unknown"}
                break

            case BlockInteractionTypes.BlockBroken:
                interactionMessage = { translate: "areas.interaction.blockBroken" }
                break

            case BlockInteractionTypes.BlockExploded:
                interactionMessage = { translate: "areas.interaction.blockExploded" }
                break

            case BlockInteractionTypes.BlockPlaced:
                interactionMessage = { translate: "areas.interaction.blockPlaced" }
                break

            case BlockInteractionTypes.BlockInitialise:
                interactionMessage = { translate: "areas.interaction.blockInitialised" }
                break

            default:
                throw new RawMessageParseError("Error in parsing block interaction.")
        }

        return interactionMessage
    }
}