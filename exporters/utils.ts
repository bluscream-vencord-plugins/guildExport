/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getNative } from "../nativeUtils";
import { ExporterContext } from "./types";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sanitize = (name: string) => name.replace(/[<>:"/\\|?*]/g, "_");

export async function downloadAsset(url: string, path: string, ctx: ExporterContext) {
    try {
        const native = getNative();
        let uint8: Uint8Array | null = null;

        if (native?.fetchAsset) {
            uint8 = await native.fetchAsset(url);
        } else {
            const resp = await fetch(url);
            if (resp.ok) {
                uint8 = new Uint8Array(await resp.arrayBuffer());
            } else {
                ctx.logger.error(`Failed to download asset: ${url} (Status: ${resp.status})`);
                return;
            }
        }

        if (uint8) {
            ctx.logger.info(`Saving asset to ${path} (${uint8.length} bytes)`);
            await ctx.save(path, uint8);
        } else {
            ctx.logger.error(`Failed to fetch asset (empty data): ${url}`);
        }
    } catch (e) {
        ctx.logger.error(`Error downloading asset: ${url}`, e);
    }
}
