// Case Controller
import { Op } from "sequelize";
import Case from "../models/case.model.js";
import CaseTracking from "../models/caseTracking.model.js";
import CaseExpense from "../models/caseExpense.model.js";
import Payment from "../models/payment.model.js";
import Document from "../models/document.model.js";
import User from "../models/user.model.js";
import CaseType from "../models/caseType.model.js";
import CaseCategory from "../models/caseCategory.model.js";
import CaseSubCategory from "../models/caseSubCategory.model.js";
import { generateCaseNumber, generateRandomPassword, sanitizeUser } from "../utils/helpers.js";
import emailService from "../utils/emailService.js";
import bcrypt from "bcryptjs";

/**
 * Register new case
 */
/**
 * Register new case
 */
export const registerCase = async (req, res) => {
    try {
        const {
            clientName,
            clientEmail,
            clientPhone,
            clientMobile, // Accept clientMobile as well
            emiratesId,
            caseType,
            caseCategory,
            caseSubCategory,
            emirate,
            courtArea,
            description,
            urgencyLevel,
            estimatedCost,
            nationality,
            whatsappNumber,
            landlineNumber,
            companyAddress,
            companyNumber,
            companyEmail,
            occupation,
            employerName,
            employerNumber,
            employerAddress,
            salary,
            lastDayOfWork,
            stillOnDuty,
            workPeriodStart,
            workPeriodEnd,
            familyMemberName,
            familyMemberNumber,
            friendName,
            friendNumber,
            referenceSource,
            referenceOtherDetails,
            regionGroup,
            title,
            // signature, // Removed signature as requested
        } = req.body;

        // Normalize phone number (use clientPhone if available, otherwise clientMobile)
        const finalClientPhone = clientPhone || clientMobile;

        // Validate required fields
        if (!clientEmail || !clientName || !finalClientPhone) {
            return res.status(400).json({
                success: false,
                message: "Client email, name, and phone/mobile are required",
            });
        }

        // Validation for Coordinators: Can only register cases in assigned emirates
        if (req.user.role === 'coordinator') {
            let assignedEmirates = req.user.assignedEmirates;

            console.log('Debug RegisterCase - Role:', req.user.role);
            console.log('Debug RegisterCase - Raw Assigned:', assignedEmirates, typeof assignedEmirates);
            console.log('Debug RegisterCase - Requested Emirate:', emirate);

            // Handle stringified JSON
            if (typeof assignedEmirates === 'string') {
                try {
                    assignedEmirates = JSON.parse(assignedEmirates);
                } catch (e) {
                    console.error('Debug RegisterCase - Parse Error:', e);
                    assignedEmirates = [];
                }
            }

            console.log('Debug RegisterCase - Parsed Assigned:', assignedEmirates);

            if (assignedEmirates && Array.isArray(assignedEmirates) && assignedEmirates.length > 0) {
                // Normalize for comparison: trim and lowercase
                const normalizedAssigned = assignedEmirates.map(e => typeof e === 'string' ? e.trim().toLowerCase() : String(e));
                const normalizedEmirate = typeof emirate === 'string' ? emirate.trim().toLowerCase() : String(emirate);

                if (!normalizedAssigned.includes(normalizedEmirate)) {
                    console.log('Debug RegisterCase - Access Denied');
                    return res.status(403).json({
                        success: false,
                        message: `You are not authorized to register cases in ${emirate}. Your assigned emirates are: ${assignedEmirates.join(', ')}`
                    });
                }
            }
        }

        // Generate unique case number
        let caseNumber;
        let isUnique = false;
        while (!isUnique) {
            caseNumber = generateCaseNumber();
            const existing = await Case.findOne({ where: { caseNumber } });
            if (!existing) isUnique = true;
        }

        // Check if client already exists
        let client = await User.findOne({ where: { email: clientEmail } });
        let tempPassword = null;
        let isNewClient = false;

        if (!client) {
            // Create client user account
            tempPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            client = await User.create({
                email: clientEmail,
                password: hashedPassword,
                name: clientName,
                phone: finalClientPhone, // Use the normalized phone number
                role: "client",
                caseNumber: caseNumber,
                createdBy: req.userId,
                isActive: true,
                // Save extended client information to User table
                nationality: nationality || null,
                emiratesId: emiratesId || null,
                whatsappNumber: whatsappNumber || null,
                landlineNumber: landlineNumber || null,
                companyName: companyAddress ? 'N/A' : null, // If company address exists, assume company
                companyAddress: companyAddress || null,
                companyEmail: companyEmail || null,
                companyPhone: companyNumber || null,
                occupation: occupation ? (Array.isArray(occupation) ? occupation.join(', ') : occupation) : null,
                employerName: employerName || null,
                address: companyAddress || null, // Use company address as general address
                city: null, // Not provided in case registration
                notes: description || null,
            });

            isNewClient = true;

            // Send welcome email with temporary password
            try {
                await emailService.sendWelcomeEmail(client, tempPassword);
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
            }
        } else {
            // Update existing client with new information if provided
            const updateData = {};
            if (nationality) updateData.nationality = nationality;
            if (emiratesId) updateData.emiratesId = emiratesId;
            if (whatsappNumber) updateData.whatsappNumber = whatsappNumber;
            if (landlineNumber) updateData.landlineNumber = landlineNumber;
            if (companyAddress) updateData.companyAddress = companyAddress;
            if (companyEmail) updateData.companyEmail = companyEmail;
            if (companyNumber) updateData.companyPhone = companyNumber;
            if (employerName) updateData.employerName = employerName;
            if (occupation) updateData.occupation = Array.isArray(occupation) ? occupation.join(', ') : occupation;
            
            if (Object.keys(updateData).length > 0) {
                await client.update(updateData);
            }
        }

        // Create case
        const newCase = await Case.create({
            caseNumber,
            clientId: client.id,
            coordinatorId: req.userId,
            clientName,
            clientEmail,
            clientPhone: finalClientPhone, // Use the normalized phone number
            emiratesId,
            caseType,
            caseCategory,
            caseSubCategory,
            emirate,
            courtArea,
            description,
            urgencyLevel: urgencyLevel || "medium",
            estimatedCost: estimatedCost || 0,
            status: "pending",
            approvalStatus: "pending",
            registrationDate: new Date(),
            nationality,
            whatsappNumber,
            landlineNumber,
            companyAddress,
            companyNumber,
            companyEmail,
            occupation,
            employerName,
            employerNumber,
            employerAddress,
            salary,
            lastDayOfWork,
            stillOnDuty,
            workPeriodStart,
            workPeriodEnd,
            familyMemberName,
            familyMemberNumber,
            friendName,
            friendNumber,
            referenceSource,
            referenceOtherDetails,
            regionGroup,
            title,
            // signature, // Removed from creation
            createdBy: req.userId, // or req.user.email if you prefer
        });

        // Create tracking record
        await CaseTracking.create({
            caseId: newCase.id,
            userId: req.userId,
            changeNumber: 1,
            changeType: "case_registered",
            newValue: "Case registered",
            description: `Case ${caseNumber} registered by ${req.user.name}`,
        });

        res.status(201).json({
            success: true,
            message: isNewClient
                ? `Case registered successfully. Client account created and welcome email sent to ${clientEmail}`
                : "Case registered successfully",
            data: {
                case: newCase,
                client: sanitizeUser(client),
                // Return temp password only for new clients (for coordinator to see)
                ...(isNewClient && tempPassword && { temporaryPassword: tempPassword })
            },
        });
    } catch (error) {
        console.error("Register case error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register case",
            error: error.message,
        });
    }
};

/**
 * Update case
 */
export const updateCase = async (req, res) => {
    try {
        const { id } = req.params;
        // Remove trackingRecords, expenses, payments from destructuring to ignore them
        const { trackingRecords, expenses, payments, ...updates } = req.body;

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 UPDATE CASE DEBUG - START');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 Case ID:', id);
        console.log('📦 Updates Keys:', Object.keys(updates));

        const caseData = await Case.findByPk(id);

        if (!caseData) {
            console.log('❌ Case not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Coordinators can only update cases they registered
        if (req.user.role === "coordinator" && caseData.coordinatorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied - You can only update cases you registered",
            });
        }

        console.log('✅ Case found:', caseData.caseNumber);

        // Track changes for main fields
        const changes = [];
        for (const [key, value] of Object.entries(updates)) {
            let currentVal = caseData[key];
            let newVal = value;

            // Normalize null/undefined
            if (currentVal === null || currentVal === undefined) currentVal = '';
            if (newVal === null || newVal === undefined) newVal = '';

            // Convert to string for comparison to handle type mismatches (e.g. number vs string)
            const strCurrent = String(currentVal).trim();
            const strNew = String(newVal).trim();

            if (strCurrent === strNew) continue;

            // Special handling for Dates to avoid false positives
            // If both look like dates and are equal in time, skip
            if ((key.toLowerCase().includes('date') || key === 'dob') && strCurrent && strNew) {
                const d1 = new Date(strCurrent);
                const d2 = new Date(strNew);
                if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
                    if (d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0]) {
                        continue;
                    }
                }
            }

            changes.push({
                field: key,
                oldValue: caseData[key],
                newValue: value,
            });
        }

        // Special handling for approvalStatus - serialize to JSON if it's an object
        if (updates.approvalStatus && typeof updates.approvalStatus === 'object') {
            updates.approvalStatus = JSON.stringify(updates.approvalStatus);
        }

        // Update case
        await caseData.update(updates);

        // Create tracking records for main field updates
        for (const change of changes) {
            const lastTracking = await CaseTracking.findOne({
                where: { caseId: id },
                order: [["changeNumber", "DESC"]],
            });

            await CaseTracking.create({
                caseId: id,
                userId: req.userId,
                changeNumber: (lastTracking?.changeNumber || 0) + 1,
                changeType: `field_update_${change.field}`,
                oldValue: String(change.oldValue),
                newValue: String(change.newValue),
                description: `${change.field} updated from ${change.oldValue} to ${change.newValue}`,
            });
        }

        // Fetch updated case with associations
        const updatedCase = await Case.findByPk(id, {
            include: [
                { model: CaseTracking, as: "trackingRecords" },
                { model: CaseExpense, as: "expenses" },
                { model: Payment, as: "payments" }
            ]
        });

        console.log('✅ Case updated successfully');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        res.json({
            success: true,
            message: "Case updated successfully",
            data: { case: updatedCase },
        });
    } catch (error) {
        console.error("❌ UPDATE CASE ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update case",
            error: error.message,
        });
    }
};
/**
 * Get all cases (with role-based filtering)
 */
export const getAllCases = async (req, res) => {
    try {
        const { status, emirate, search, page = 1, limit } = req.query;

        const isUnlimited = limit === '0' || limit === 0 || (typeof limit === 'string' && limit.toLowerCase() === 'all');
        const resolvedLimit = isUnlimited ? null : (limit !== undefined ? parseInt(limit) : 20);
        const resolvedPage = parseInt(page);

        const where = {};

        // Apply role-based filtering
        if (req.user.role === "client") {
            where.clientId = req.userId;
        } else if (req.user.role === "lawyer") {
            where.lawyerId = req.userId;
        } else if (req.user.role === "counsellor") {
            where.counsellorId = req.userId;
        } else if (req.user.role === "coordinator") {
            // Coordinators see only cases they registered themselves
            where.coordinatorId = req.userId;
        }

        // Apply emirate filter
        if (req.emirateFilter && req.emirateFilter.length > 0) {
            where.emirate = { [Op.in]: req.emirateFilter };
        }

        if (status) where.status = status;
        if (emirate) where.emirate = emirate;

        if (search) {
            where[Op.or] = [
                { caseNumber: { [Op.like]: `%${search}%` } },
                { clientName: { [Op.like]: `%${search}%` } },
                { clientEmail: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = !isUnlimited ? (resolvedPage - 1) * resolvedLimit : null;

        const { count, rows } = await Case.findAndCountAll({
            where,
            include: [
                { model: User, as: "client", attributes: ["id", "name", "email", "phone", "visiblePassword"] },
                { model: User, as: "coordinator", attributes: ["id", "name", "email"] },
                { model: User, as: "lawyer", attributes: ["id", "name", "email"] },
                { model: User, as: "counsellor", attributes: ["id", "name", "email"] },
                { model: CaseTracking, as: "trackingRecords" },
                { model: CaseExpense, as: "expenses" },
                { model: Payment, as: "payments" },
                { model: Document, as: "documents" },
            ],
            ...(isUnlimited ? {} : { limit: resolvedLimit, offset: offset }),
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: {
                cases: rows,
                pagination: {
                    total: count,
                    page: isUnlimited ? 1 : resolvedPage,
                    limit: isUnlimited ? count : resolvedLimit,
                    pages: isUnlimited ? 1 : Math.ceil(count / resolvedLimit),
                    unlimited: isUnlimited,
                },
            },
        });
    } catch (error) {
        console.error("Get all cases error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cases",
            error: error.message,
        });
    }
};

/**
 * Get case by ID
 */
export const getCaseById = async (req, res) => {
    try {
        const { id } = req.params;

        const caseData = await Case.findByPk(id, {
            include: [
                { model: User, as: "client", attributes: ["id", "name", "email", "phone", "visiblePassword"] },
                { model: User, as: "coordinator", attributes: ["id", "name", "email"] },
                { model: User, as: "lawyer", attributes: ["id", "name", "email"] },
                { model: User, as: "counsellor", attributes: ["id", "name", "email"] },
                { model: CaseTracking, as: "trackingRecords", include: [{ model: User, as: "user", attributes: ["name"] }] },
                { model: CaseExpense, as: "expenses" },
                { model: Payment, as: "payments" },
                { model: Document, as: "documents" },
            ],
        });

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Check access permission
        if (req.user.role === "client" && caseData.clientId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Coordinators can only view cases they registered
        if (req.user.role === "coordinator" && caseData.coordinatorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied - You can only view cases you registered",
            });
        }

        res.json({
            success: true,
            data: { case: caseData },
        });
    } catch (error) {
        console.error("Get case error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch case",
            error: error.message,
        });
    }
};



/**
 * Assign lawyer to case
 */
export const assignLawyer = async (req, res) => {
    try {
        const { id } = req.params;
        const { lawyerId } = req.body;

        const caseData = await Case.findByPk(id);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Ensure ID is a string and trimmed
        const cleanLawyerId = String(lawyerId).trim();

        console.log('Debug AssignLawyer - Received ID:', lawyerId);
        console.log('Debug AssignLawyer - Clean ID:', cleanLawyerId);

        // Try findOne instead of findPk
        const lawyer = await User.findOne({ where: { id: cleanLawyerId } });
        
        console.log('Debug AssignLawyer - Found User:', lawyer ? { id: lawyer.id, role: lawyer.role, name: lawyer.name } : 'Not Found');

        if (!lawyer || lawyer.role !== "lawyer") {
            return res.status(400).json({
                success: false,
                message: `Invalid lawyer ID. Found: ${lawyer ? lawyer.role : 'None'}`,
            });
        }

        caseData.lawyerId = lawyerId;
        await caseData.save();

        // Track assignment
        const lastTracking = await CaseTracking.findOne({
            where: { caseId: id },
            order: [["changeNumber", "DESC"]],
        });

        await CaseTracking.create({
            caseId: id,
            userId: req.userId,
            changeNumber: (lastTracking?.changeNumber || 0) + 1,
            changeType: "lawyer_assigned",
            newValue: lawyer.name,
            description: `Lawyer ${lawyer.name} assigned to case`,
        });

        res.json({
            success: true,
            message: "Lawyer assigned successfully",
            data: { case: caseData },
        });
    } catch (error) {
        console.error("Assign lawyer error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign lawyer",
            error: error.message,
        });
    }
};

/**
 * Update case status
 */
export const updateCaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const caseData = await Case.findByPk(id);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        const oldStatus = caseData.status;
        caseData.status = status;
        await caseData.save();

        // Track status change
        const lastTracking = await CaseTracking.findOne({
            where: { caseId: id },
            order: [["changeNumber", "DESC"]],
        });

        await CaseTracking.create({
            caseId: id,
            userId: req.userId,
            changeNumber: (lastTracking?.changeNumber || 0) + 1,
            changeType: "status_change",
            oldValue: oldStatus,
            newValue: status,
            description: `Status changed from ${oldStatus} to ${status}`,
        });

        res.json({
            success: true,
            message: "Status updated successfully",
            data: { case: caseData },
        });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
};

/**
 * Add note to case
 */
export const addCaseNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const caseData = await Case.findByPk(id);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        const lastTracking = await CaseTracking.findOne({
            where: { caseId: id },
            order: [["changeNumber", "DESC"]],
        });

        await CaseTracking.create({
            caseId: id,
            userId: req.userId,
            changeNumber: (lastTracking?.changeNumber || 0) + 1,
            changeType: "note_added",
            newValue: note,
            description: `Note added by ${req.user.name}`,
        });

        res.json({
            success: true,
            message: "Note added successfully",
        });
    } catch (error) {
        console.error("Add note error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add note",
            error: error.message,
        });
    }
};

/**
 * Delete case
 */
export const deleteCase = async (req, res) => {
    try {
        const { id } = req.params;

        const caseData = await Case.findByPk(id);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Coordinators can only delete cases they registered
        if (req.user.role === "coordinator" && caseData.coordinatorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied - You can only delete cases you registered",
            });
        }

        await caseData.destroy();

        res.json({
            success: true,
            message: "Case deleted successfully",
        });
    } catch (error) {
        console.error("Delete case error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete case",
            error: error.message,
        });
    }
};

/**
 * Search for existing clients by email or phone
 * @route GET /api/cases/search-client?query=email_or_phone
 */
export const searchExistingClient = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least 3 characters to search",
            });
        }

        const searchTerm = query.trim();
        // Normalize phone number by removing spaces, dashes, and parentheses
        const normalizedPhone = searchTerm.replace(/[\s\-\(\)]/g, '');

        console.log('=== CLIENT SEARCH DEBUG ===');
        console.log('Search term:', searchTerm);
        console.log('Normalized phone:', normalizedPhone);

        // First, search in User table for registered clients
        // Try exact match first, then partial match
        const registeredClient = await User.findOne({
            where: {
                role: "client",
                [Op.or]: [
                    { email: searchTerm }, // Exact match for email
                    { email: { [Op.like]: `%${searchTerm}%` } }, // Partial match for email
                    { phone: normalizedPhone }, // Exact match for normalized phone
                    { phone: { [Op.like]: `%${normalizedPhone}%` } }, // Partial match for normalized phone
                    { phone: { [Op.like]: `%${searchTerm}%` } }, // Partial match for original search term
                    { whatsappNumber: normalizedPhone }, // Exact match for WhatsApp
                    { whatsappNumber: { [Op.like]: `%${normalizedPhone}%` } }, // Partial match for WhatsApp
                    { name: { [Op.like]: `%${searchTerm}%` } }, // Partial match for client name
                    { clientNumber: searchTerm }, // Exact match for client number
                    { clientNumber: { [Op.like]: `%${searchTerm}%` } }, // Partial match for client number
                ],
            },
        });

        console.log('Registered client found:', registeredClient ? registeredClient.name : 'None');

        // Then search for cases with matching email, phone, or name
        const cases = await Case.findAll({
            where: {
                [Op.or]: [
                    { clientEmail: searchTerm }, // Exact match for email
                    { clientEmail: { [Op.like]: `%${searchTerm}%` } }, // Partial match for email
                    { clientPhone: normalizedPhone }, // Exact match for normalized phone
                    { clientPhone: { [Op.like]: `%${normalizedPhone}%` } }, // Partial match for normalized phone
                    { clientPhone: { [Op.like]: `%${searchTerm}%` } }, // Partial match for original search term
                    { whatsappNumber: normalizedPhone }, // Exact match for WhatsApp
                    { whatsappNumber: { [Op.like]: `%${normalizedPhone}%` } }, // Partial match for WhatsApp
                    { clientName: { [Op.like]: `%${searchTerm}%` } }, // Partial match for client name
                ],
            },
            include: [
                {
                    model: User,
                    as: "lawyer",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        console.log('Cases found:', cases.length);
        console.log('=== END DEBUG ===');

        // If no registered client and no cases found
        if (!registeredClient && cases.length === 0) {
            return res.json({
                success: true,
                message: "No existing client found",
                data: {
                    found: false,
                    client: null,
                    cases: [],
                },
            });
        }

        let clientInfo;

        // If we found a registered client in User table
        if (registeredClient) {
            clientInfo = {
                clientName: registeredClient.name,
                clientEmail: registeredClient.email,
                clientPhone: registeredClient.phone,
                clientMobile: registeredClient.phone,
                clientNumber: registeredClient.clientNumber || null,
                whatsappNumber: registeredClient.whatsappNumber || null,
                landlineNumber: registeredClient.landlineNumber || null,
                emiratesId: registeredClient.emiratesId || null,
                nationality: registeredClient.nationality || null,
                companyAddress: registeredClient.companyAddress || null,
                companyNumber: registeredClient.companyPhone || null,
                companyEmail: registeredClient.companyEmail || null,
                occupation: registeredClient.occupation || null,
                employerName: registeredClient.employerName || null,
                employerNumber: null, // Not stored in User table
                employerAddress: null, // Not stored in User table
                salary: null, // Not stored in User table
                familyMemberName: null, // Not stored in User table
                familyMemberNumber: null, // Not stored in User table
                friendName: null, // Not stored in User table
                friendNumber: null, // Not stored in User table
            };

            // If there are cases, merge additional details from the latest case
            if (cases.length > 0) {
                const latestCase = cases[0];
                clientInfo = {
                    ...clientInfo,
                    whatsappNumber: clientInfo.whatsappNumber || latestCase.whatsappNumber,
                    landlineNumber: clientInfo.landlineNumber || latestCase.landlineNumber,
                    emiratesId: clientInfo.emiratesId || latestCase.emiratesId,
                    nationality: clientInfo.nationality || latestCase.nationality,
                    companyAddress: clientInfo.companyAddress || latestCase.companyAddress,
                    companyNumber: clientInfo.companyNumber || latestCase.companyNumber,
                    companyEmail: clientInfo.companyEmail || latestCase.companyEmail,
                    occupation: clientInfo.occupation || latestCase.occupation,
                    employerName: clientInfo.employerName || latestCase.employerName,
                    employerNumber: latestCase.employerNumber || clientInfo.employerNumber,
                    employerAddress: latestCase.employerAddress || clientInfo.employerAddress,
                    salary: latestCase.salary || clientInfo.salary,
                    familyMemberName: latestCase.familyMemberName || clientInfo.familyMemberName,
                    familyMemberNumber: latestCase.familyMemberNumber || clientInfo.familyMemberNumber,
                    friendName: latestCase.friendName || clientInfo.friendName,
                    friendNumber: latestCase.friendNumber || clientInfo.friendNumber,
                };
            }
        } else {
            // No registered client, but cases exist - use case data
            const latestCase = cases[0];
            clientInfo = {
                clientName: latestCase.clientName,
                clientEmail: latestCase.clientEmail,
                clientPhone: latestCase.clientPhone,
                clientMobile: latestCase.clientPhone, // Use clientPhone for mobile too
                clientNumber: null, // Not stored in Case table
                whatsappNumber: latestCase.whatsappNumber,
                landlineNumber: latestCase.landlineNumber,
                emiratesId: latestCase.emiratesId,
                nationality: latestCase.nationality,
                companyAddress: latestCase.companyAddress,
                companyNumber: latestCase.companyNumber,
                companyEmail: latestCase.companyEmail,
                occupation: latestCase.occupation,
                employerName: latestCase.employerName,
                employerNumber: latestCase.employerNumber,
                employerAddress: latestCase.employerAddress,
                salary: latestCase.salary,
                familyMemberName: latestCase.familyMemberName,
                familyMemberNumber: latestCase.familyMemberNumber,
                friendName: latestCase.friendName,
                friendNumber: latestCase.friendNumber,
            };
        }

        // Get case type names for all cases
        const caseTypeIds = [...new Set(cases.map(c => c.caseType).filter(Boolean))];
        console.log('Case Type IDs to fetch:', caseTypeIds);
        
        const caseTypes = await CaseType.findAll({
            where: {
                id: { [Op.in]: caseTypeIds }
            },
            attributes: ['id', 'name']
        });
        
        console.log('Case Types found:', caseTypes.length);
        
        const caseTypeMap = {};
        caseTypes.forEach(ct => {
            caseTypeMap[ct.id] = ct.name;
        });

        // Get category names
        const categoryIds = [...new Set(cases.map(c => c.caseCategory).filter(Boolean))];
        console.log('Category IDs to fetch:', categoryIds);
        
        const categories = await CaseCategory.findAll({
            where: {
                id: { [Op.in]: categoryIds }
            },
            attributes: ['id', 'name']
        });
        
        console.log('Categories found:', categories.length);
        console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name })));
        
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat.name;
        });
        
        console.log('Category Map:', categoryMap);

        // Get sub-category names
        const subCategoryIds = [...new Set(cases.map(c => c.caseSubCategory).filter(Boolean))];
        console.log('Sub-Category IDs to fetch:', subCategoryIds);
        
        const subCategories = await CaseSubCategory.findAll({
            where: {
                id: { [Op.in]: subCategoryIds }
            },
            attributes: ['id', 'name']
        });
        
        console.log('Sub-Categories found:', subCategories.length);
        
        const subCategoryMap = {};
        subCategories.forEach(subCat => {
            subCategoryMap[subCat.id] = subCat.name;
        });

        // Format cases list with names instead of IDs
        const casesList = cases.map((c) => {
            const mappedCase = {
                caseNumber: c.caseNumber,
                caseType: caseTypeMap[c.caseType] || c.caseType,
                caseCategory: categoryMap[c.caseCategory] || c.caseCategory,
                caseSubCategory: subCategoryMap[c.caseSubCategory] || c.caseSubCategory,
                status: c.status,
                emirate: c.emirate,
                registrationDate: c.registrationDate,
                lawyer: c.lawyer ? c.lawyer.name : "Unassigned",
            };
            
            console.log('Original case:', {
                caseType: c.caseType,
                caseCategory: c.caseCategory,
                caseSubCategory: c.caseSubCategory
            });
            console.log('Mapped case:', {
                caseType: mappedCase.caseType,
                caseCategory: mappedCase.caseCategory,
                caseSubCategory: mappedCase.caseSubCategory
            });
            
            return mappedCase;
        });

        const message = registeredClient
            ? `Found registered client${cases.length > 0 ? ` with ${cases.length} case(s)` : " (no cases yet)"}`
            : `Found ${cases.length} case(s) for this client`;

        res.json({
            success: true,
            message: message,
            data: {
                found: true,
                client: clientInfo,
                cases: casesList,
                totalCases: cases.length,
                isRegisteredClient: !!registeredClient,
            },
        });
    } catch (error) {
        console.error("Search client error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search for client",
            error: error.message,
        });
    }
};

export default {
    registerCase,
    getAllCases,
    getCaseById,
    updateCase,
    assignLawyer,
    updateCaseStatus,
    addCaseNote,
    deleteCase,
    searchExistingClient,
};
