// Application constants
export const USER_ROLES = {
    SUPER_ADMIN: "super_admin",
    COORDINATOR: "coordinator",
    COUNSELLOR: "counsellor",
    LAWYER: "lawyer",
    CLIENT: "client",
};

export const CASE_STATUS = {
    PENDING: "pending",
    ACTIVE: "active",
    IN_PROGRESS: "in_progress",
    ON_HOLD: "on_hold",
    COMPLETED: "completed",
    CLOSED: "closed",
    REJECTED: "rejected",
};

export const APPROVAL_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const URGENCY_LEVELS = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
};

export const CONSULTATION_TYPES = {
    IN_PERSON: "in_person",
    VIDEO: "video",
    PHONE: "phone",
};

export const CONSULTATION_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    RESCHEDULED: "rescheduled",
};

export const PAYMENT_STATUS = {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
};

export const NOTIFICATION_TYPES = {
    SMS: "sms",
    WHATSAPP: "whatsapp",
    EMAIL: "email",
};

export const NOTIFICATION_STATUS = {
    PENDING: "pending",
    SENT: "sent",
    FAILED: "failed",
};

export const EMIRATES = [
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
];

export const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const CASE_NUMBER_PREFIX = "CASE";
export const INVOICE_NUMBER_PREFIX = "INV";

export default {
    USER_ROLES,
    CASE_STATUS,
    APPROVAL_STATUS,
    URGENCY_LEVELS,
    CONSULTATION_TYPES,
    CONSULTATION_STATUS,
    PAYMENT_STATUS,
    NOTIFICATION_TYPES,
    NOTIFICATION_STATUS,
    EMIRATES,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE,
    CASE_NUMBER_PREFIX,
    INVOICE_NUMBER_PREFIX,
};
