// FTP Configuration
export const ftpConfig = {
    host: process.env.FTP_HOST || "ftp.iahwservice.com",
    user: process.env.FTP_USER || "u929535174.Uploads",
    password: process.env.FTP_PASS || "Uploads@123321",
    port: parseInt(process.env.FTP_PORT) || 21,
    baseUrl: process.env.FTP_BASE_URL || "https://iahwservice.com/eylsuploads/",
    secure: false, // Set to true for FTPS
};

export default ftpConfig;
