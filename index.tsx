//// Plugin originally written for Equicord at 2026-02-16 by https://github.com/Bluscream, https://antigravity.google
// region Imports
import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { popNotice, showNotice } from "@api/Notices";
import { Logger } from "@utils/Logger";
import { openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import {
    GuildStore,
    Menu,
    MessageActions,
    showToast,
    Toasts
} from "@webpack/common";
import { zipSync } from "fflate";

import * as AssetEx from "./exporters/assetExporter";
import * as BanEx from "./exporters/banExporter";
import * as ChanEx from "./exporters/channelExporter";
import * as InfoEx from "./exporters/infoExporter";
import * as MemberEx from "./exporters/memberExporter";
import * as RoleEx from "./exporters/roleExporter";
import { ExporterContext } from "./exporters/types";
import { sanitize } from "./exporters/utils";
import { ExportModal } from "./ExportModal";
import { getNative } from "./nativeUtils";
import { settings } from "./settings";
// endregion Imports

// region PluginInfo
export const pluginInfo = {
    id: "guildExport",
    name: "GuildExport",
    description: "Export guild structure and data including channels, roles, and members",
    color: "#7289da",
    authors: [
        { name: "Bluscream", id: 467777925790564352n },
        { name: "Assistant", id: 0n }
    ],
};
// endregion PluginInfo

// region Variables
const logger = new Logger(pluginInfo.id, pluginInfo.color);
const EXPORT_NOTICE_BUTTON_TEXT = "Abort Export";
// endregion Variables

// region Utils
async function exportGuildData(guildId: string) {
    const guild = GuildStore.getGuild(guildId);
    if (!guild) {
        showToast("Guild not found", Toasts.Type.FAILURE);
        return;
    }

    const s = settings.store;
    showToast(`Exporting ${guild.name}...`, Toasts.Type.MESSAGE);
    logger.info(`Starting export for guild: ${guild.name} (${guildId})`);

    const setProgress = (status: string, type = "GENERIC") => {
        logger.info(status);
        popNotice();
        showNotice(
            <div style={{ padding: "8px 0" }}>
                <strong>Exporting {guild.name}...</strong>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                    {status}
                </div>
            </div>,
            EXPORT_NOTICE_BUTTON_TEXT,
            () => {
                popNotice();
                showToast("Export aborted", Toasts.Type.MESSAGE);
            }
        );
    };

    showNotice(
        <div style={{ padding: "8px 0" }}>
            <strong>Exporting {guild.name}...</strong>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                Please wait while we gather all the data. Large servers may take a while.
            </div>
        </div>,
        EXPORT_NOTICE_BUTTON_TEXT,
        () => {
            popNotice();
            showToast("Export aborted", Toasts.Type.MESSAGE);
        }
    );

    try {
        const zipData: Record<string, Uint8Array> = {};
        const native = getNative();
        const exportToFolder = s.exportMode === "Folder" && native;

        if (s.exportMode === "Folder" && !native) {
            showToast("Direct folder export is not supported on Web. Falling back to ZIP.", Toasts.Type.MESSAGE);
        }

        const save = async (path: string, data: string | Uint8Array | undefined) => {
            if (data === undefined) return;
            const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data;
            if (exportToFolder) {
                logger.info(`Saving to folder: ${path} (${uint8.length} bytes)`);
                await native!.saveFile(s.exportDirectory, path, data);
            } else {
                logger.info(`Adding to ZIP: ${path} (${uint8.length} bytes)`);
                zipData[path] = uint8;
            }
        };

        const ctx: ExporterContext = {
            guildId,
            actionDelay: s.actionDelay,
            filenameFormat: s.filenameFormat as any,
            save,
            logger,
            setProgress,
        };

        if (s.exportInfo) await InfoEx.exportInfo(ctx);
        if (s.exportRoles) await RoleEx.exportRoles(ctx);
        if (s.exportChannels) await ChanEx.exportChannels(ctx);
        if (s.exportAutomod) await RoleEx.exportAutomod(ctx);
        if (s.exportBans) await BanEx.exportBans(ctx);
        if (s.exportMembers) await MemberEx.exportMembers(ctx);
        if (s.exportInfo) await AssetEx.exportGuildAssets(ctx);
        if (s.exportEmojis) await AssetEx.exportEmojis(ctx);
        if (s.exportStickers) await AssetEx.exportStickers(ctx);
        if (s.exportSounds) await AssetEx.exportSounds(ctx);

        // Generate and download ZIP or finish Folder export
        if (!exportToFolder) {
            const zipped = zipSync(zipData);
            const fileName = `${sanitize(guild.name)}_export.zip`;

            if (s.exportMode === "ZipSend" && s.sendToChannelId) {
                const file = new File([zipped as any], fileName, { type: "application/zip" });
                try {
                    MessageActions.sendMessage(s.sendToChannelId, { content: "", invalidEmojis: [], validNonShortcutEmojis: [] }, null, {
                        uploads: [{ file, platform: 1 }]
                    });
                } catch (e) {
                    logger.error("Failed to send ZIP to channel", e);
                    showToast("Failed to send ZIP. Downloading instead.", Toasts.Type.FAILURE);
                    const blob = new Blob([zipped as any], { type: "application/zip" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            } else {
                const blob = new Blob([zipped as any], { type: "application/zip" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }
        }

        showToast(`Exported ${guild.name} successfully!`, Toasts.Type.SUCCESS);
        logger.info(`Export completed for guild: ${guild.name}`);

        popNotice();
        showNotice(
            <div style={{ padding: "8px 0" }}>
                <strong>Export Finished!</strong>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                    Successfully exported {guild.name}.
                </div>
            </div>,
            "Close",
            () => popNotice()
        );
    } catch (error) {
        logger.error("Failed to export guild data", error);
        showToast("Failed to export guild data", Toasts.Type.FAILURE);

        popNotice();
        showNotice(
            <div style={{ padding: "8px 0" }}>
                <strong>Export Failed!</strong>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                    {String(error)}
                </div>
            </div>,
            "Close",
            () => popNotice()
        );
    }
}
// endregion Utils

// region Main
const GuildContextMenu: NavContextMenuPatchCallback = (children, { guild }) => {
    if (!guild) return;

    children.push(
        <Menu.MenuItem
            id="blu-guild-export"
            label="Export Server"
            action={() => openModal(props => <ExportModal modalProps={props} guild={guild} onExport={exportGuildData} />)}
        />
    );
};
// endregion Main

// region Definition
export default definePlugin({
    name: "GuildExport",
    description: pluginInfo.description,
    authors: pluginInfo.authors,
    settings,
    contextMenus: {
        "guild-context": GuildContextMenu,
    }
});
// endregion Definition
