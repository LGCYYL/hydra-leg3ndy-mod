import axios from "axios";
import {
  HOSTER_USER_AGENT,
  extractHosterFilename,
  handleHosterError,
} from "./fuckingfast";
import { logger } from "@main/services";

/**
 * Qiwi.gg file hosting support.
 *
 * URL format:  https://qiwi.gg/file/<ID>#FileName.ext
 * Direct link: extracted from the page's <a> with data-id or from an API endpoint.
 *
 * The site renders a page with a download button that contains the direct link
 * in an anchor tag. We can also hit the undocumented API endpoint directly.
 */
export class QiwiApi {
  private static readonly QIWI_DOMAINS = ["qiwi.gg"];

  // Qiwi embeds the download URL in the page. There are two known patterns:
  // 1. <a ... href="https://qiwi.gg/file/<id>/download">
  // 2. Undocumented API: GET https://qiwi.gg/file/<id>/download → 302 → direct URL
  private static readonly DOWNLOAD_LINK_REGEX =
    /href="(https?:\/\/qiwi\.gg\/file\/[^"]+\/download[^"]*)"/i;

  private static isSupportedDomain(url: string): boolean {
    const lower = url.toLowerCase();
    return this.QIWI_DOMAINS.some((d) => lower.includes(d));
  }

  private static extractFileId(url: string): string {
    // Supports: https://qiwi.gg/file/ABC123#filename.rar
    const match = /qiwi\.gg\/file\/([A-Za-z0-9_-]+)/i.exec(url);
    if (!match) throw new Error("Invalid Qiwi.gg URL format");
    return match[1];
  }

  private static async getQiwiDirectLink(url: string): Promise<string> {
    const fileId = this.extractFileId(url);

    logger.log(`[Qiwi] Extracting download link for file ID: ${fileId}`);

    // Strategy 1: Follow the /download redirect directly
    try {
      const downloadUrl = `https://qiwi.gg/file/${fileId}/download`;

      const response = await axios.get(downloadUrl, {
        headers: {
          "User-Agent": HOSTER_USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Referer: `https://qiwi.gg/file/${fileId}`,
        },
        maxRedirects: 10,
        timeout: 30000,
        validateStatus: (status) => status < 500,
      });

      // If response is a redirect to a CDN URL, the final URL is what we want
      const finalUrl = response.request?.res?.responseUrl as string | undefined;
      if (finalUrl && !finalUrl.includes("qiwi.gg/file/")) {
        logger.log(`[Qiwi] Got direct link via redirect`);
        return finalUrl;
      }

      // Strategy 2: Scrape the HTML of the file page
      const pageUrl = `https://qiwi.gg/file/${fileId}`;
      const pageResponse = await axios.get(pageUrl, {
        headers: {
          "User-Agent": HOSTER_USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 30000,
      });

      const html = pageResponse.data as string;

      if (
        html.toLowerCase().includes("not found") ||
        html.toLowerCase().includes("deleted")
      ) {
        throw new Error("File not found or deleted on Qiwi.gg");
      }

      const match = this.DOWNLOAD_LINK_REGEX.exec(html);
      if (match?.[1]) {
        logger.log(`[Qiwi] Got download URL from page HTML`);
        return match[1];
      }

      // Strategy 3: Extract data-file-url or data-url attributes
      const dataUrlMatch = /data-(?:file-)?url="([^"]+download[^"]*)"/i.exec(html);
      if (dataUrlMatch?.[1]) {
        logger.log(`[Qiwi] Got download URL from data attribute`);
        return dataUrlMatch[1];
      }

      throw new Error("Could not extract download link from Qiwi.gg page");
    } catch (error) {
      logger.error(`[Qiwi] Error extracting link:`, error);
      handleHosterError(error);
    }
  }

  public static async getDirectLink(url: string): Promise<string> {
    if (!this.isSupportedDomain(url)) {
      throw new Error(
        `Unsupported domain. Supported: ${this.QIWI_DOMAINS.join(", ")}`
      );
    }
    return this.getQiwiDirectLink(url);
  }

  public static async getFilename(
    url: string,
    directUrl?: string
  ): Promise<string> {
    // Filename is often in the URL fragment: https://qiwi.gg/file/ABC#Game.rar
    if (url.includes("#")) {
      const fragment = url.split("#")[1];
      if (fragment && fragment.includes(".")) return fragment;
    }
    return extractHosterFilename(url, directUrl);
  }
}
