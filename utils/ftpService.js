// FTP Service for file upload/download
import { Client } from "basic-ftp";
import ftpConfig from "../config/ftp.js";
import fs from "fs";
import path from "path";

class FTPService {
    constructor() {
        this.config = ftpConfig;
    }

    /**
     * Upload file to FTP server
     * @param {string} localFilePath - Path to local file
     * @param {string} remoteFilePath - Path on FTP server
     * @returns {Promise<string>} - Public URL of uploaded file
     */
    async uploadFile(localFilePath, remoteFilePath) {
        const client = new Client();
        client.ftp.verbose = process.env.NODE_ENV === "development";

        try {
            await client.access({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                port: this.config.port,
                secure: this.config.secure,
            });

            // Parse the remote path
            const remoteDir = path.dirname(remoteFilePath);
            const fileName = path.basename(remoteFilePath);

            // Create and navigate to directory if needed
            // ensureDir already navigates to the directory, so no need for cd()
            if (remoteDir && remoteDir !== '.') {
                await client.ensureDir(remoteDir);
            }

            // Upload file to current directory
            await client.uploadFrom(localFilePath, fileName);

            // Generate public URL
            const publicUrl = `${this.config.baseUrl}${remoteFilePath}`;

            return publicUrl;
        } catch (error) {
            console.error("FTP Upload Error:", error);
            throw new Error(`Failed to upload file: ${error.message}`);
        } finally {
            client.close();
        }
    }

    /**
     * Download file from FTP server
     * @param {string} remoteFilePath - Path on FTP server
     * @param {string} localFilePath - Path to save file locally
     */
    async downloadFile(remoteFilePath, localFilePath) {
        const client = new Client();
        client.ftp.verbose = process.env.NODE_ENV === "development";

        try {
            await client.access({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                port: this.config.port,
                secure: this.config.secure,
            });

            await client.downloadTo(localFilePath, remoteFilePath);
        } catch (error) {
            console.error("FTP Download Error:", error);
            throw new Error(`Failed to download file: ${error.message}`);
        } finally {
            client.close();
        }
    }

    /**
     * Delete file from FTP server
     * @param {string} remoteFilePath - Path on FTP server
     */
    async deleteFile(remoteFilePath) {
        const client = new Client();
        client.ftp.verbose = process.env.NODE_ENV === "development";

        try {
            await client.access({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password,
                port: this.config.port,
                secure: this.config.secure,
            });

            await client.remove(remoteFilePath);
        } catch (error) {
            console.error("FTP Delete Error:", error);
            throw new Error(`Failed to delete file: ${error.message}`);
        } finally {
            client.close();
        }
    }

    /**
     * Generate remote file path
     * @param {string} category - Category (e.g., 'cases', 'consultations')
     * @param {string} filename - Filename
     * @returns {string} - Remote path
     */
    generateRemotePath(category, filename) {
        return `${category}/${filename}`;
    }
}

export default new FTPService();
