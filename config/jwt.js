// JWT configuration
import jwt from "jsonwebtoken";

export const jwtConfig = {
    secret: process.env.JWT_SECRET || "ksjdfsjdjjfkjsdfkasdkjaljsdf",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    refreshSecret:
        process.env.JWT_REFRESH_SECRET || "ksjdfsjdjjfkjsdfkasdkjaljsdfrefresh",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

export const generateToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
    });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshExpiresIn,
    });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.refreshSecret);
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};
