import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({

    exportMode: {
        type: OptionType.SELECT,
        description: "The format in which to export the guild data",
        options: [
            { label: "Zip (Save)", value: "ZipSave", default: true },
            { label: "Zip (Send)", value: "ZipSend" },
        ],
        restartNeeded: false,
    },
    sendToChannelId: {
        type: OptionType.STRING,
        description: "The ID of the channel to send the export to (if Zip Send is selected)",
        default: "",
        restartNeeded: false,
    },
    exportInfo: {
        type: OptionType.BOOLEAN,
        description: "Whether to export general guild information",
        default: true,
        restartNeeded: false,
    },
    exportChannels: {
        type: OptionType.BOOLEAN,
        description: "Whether to export channel structure and metadata",
        default: true,
        restartNeeded: false,
    },
    exportRoles: {
        type: OptionType.BOOLEAN,
        description: "Whether to export guild roles and permissions",
        default: true,
        restartNeeded: false,
    },
    exportAutomod: {
        type: OptionType.BOOLEAN,
        description: "Whether to export AutoMod rules",
        default: true,
        restartNeeded: false,
    },
    exportBans: {
        type: OptionType.BOOLEAN,
        description: "Whether to export the ban list",
        default: true,
        restartNeeded: false,
    },
    exportMembers: {
        type: OptionType.BOOLEAN,
        description: "Whether to export the member list",
        default: true,
        restartNeeded: false,
    },
    exportEmojis: {
        type: OptionType.BOOLEAN,
        description: "Whether to export guild emojis",
        default: true,
        restartNeeded: false,
    },
    exportStickers: {
        type: OptionType.BOOLEAN,
        description: "Whether to export guild stickers",
        default: true,
        restartNeeded: false,
    },
    exportSounds: {
        type: OptionType.BOOLEAN,
        description: "Whether to export soundboard sounds",
        default: true,
        restartNeeded: false,
    },
    filenameFormat: {
        type: OptionType.SELECT,
        description: "The format for naming exported files (IDs or sanitized Names)",
        options: [
            { label: "IDs (Unique, Safe)", value: "IDs", default: true },
            { label: "Names (Sanitized)", value: "Names" },
        ],
        restartNeeded: false,
    },
    actionDelay: {
        type: OptionType.SLIDER,
        description: "The delay between export actions in milliseconds",
        markers: [0, 100, 250, 500, 1000, 2000],
        default: 250,
        restartNeeded: false,
    },
});
