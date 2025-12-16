// User Controller
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import { sanitizeUser, generateRandomPassword, generateClientNumber } from "../utils/helpers.js";
import emailService from "../utils/emailService.js";
import { USER_ROLES } from "../utils/constants.js";

/**
 * Create new user (Super Admin only)
 * - For CLIENT role: Auto-generate temporary password and send email
 * - For STAFF roles (coordinator, lawyer, counsellor, etc.): Use password provided by admin
 */
export const createUser = async (req, res) => {
    try {
        const { 
            email, 
            name, 
            phone, 
            role, 
            clientNumber,
            assignedEmirates, 
            password, 
            specializations,
            permissions,
            // Extended client fields
            nationality,
            emiratesId,
            whatsappNumber,
            landlineNumber,
            address,
            city,
            companyName,
            companyEmail,
            companyPhone,
            companyAddress,
            occupation,
            employerName,
            notes
        } = req.body;

        // Validate required fields
        if (!email || !name || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, name, phone, and role are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        let finalPassword;
        let isTemporaryPassword = false;

        // For CLIENT role: Generate temporary password and send email
        // For other roles (staff): Use password provided by admin
        if (role === USER_ROLES.CLIENT) {
            // Generate temporary password for clients
            finalPassword = generateRandomPassword();
            isTemporaryPassword = true;
        } else {
            // For staff roles, password must be provided by admin
            if (!password || password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required and must be at least 6 characters for staff accounts",
                });
            }
            finalPassword = password;
        }

        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        // Use provided client number or generate one for clients
        let finalClientNumber = clientNumber || null;
        if (role === USER_ROLES.CLIENT && !finalClientNumber) {
            finalClientNumber = await generateClientNumber(User);
        }

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone,
            role,
            clientNumber: finalClientNumber,
            assignedEmirates:
                role === USER_ROLES.COORDINATOR || role === USER_ROLES.COUNSELLOR
                    ? assignedEmirates || []
                    : null,
            specializations:
                role === USER_ROLES.LAWYER
                    ? specializations || []
                    : null,
            permissions:
                role === USER_ROLES.COORDINATOR
                    ? permissions || null
                    : null,
            // Extended client fields (only for clients)
            nationality: role === USER_ROLES.CLIENT ? nationality : null,
            emiratesId: role === USER_ROLES.CLIENT ? emiratesId : null,
            whatsappNumber: role === USER_ROLES.CLIENT ? whatsappNumber : null,
            landlineNumber: role === USER_ROLES.CLIENT ? landlineNumber : null,
            address: role === USER_ROLES.CLIENT ? address : null,
            city: role === USER_ROLES.CLIENT ? city : null,
            companyName: role === USER_ROLES.CLIENT ? companyName : null,
            companyEmail: role === USER_ROLES.CLIENT ? companyEmail : null,
            companyPhone: role === USER_ROLES.CLIENT ? companyPhone : null,
            companyAddress: role === USER_ROLES.CLIENT ? companyAddress : null,
            occupation: role === USER_ROLES.CLIENT ? occupation : null,
            employerName: role === USER_ROLES.CLIENT ? employerName : null,
            notes: role === USER_ROLES.CLIENT ? notes : null,
            createdBy: req.userId,
            isActive: true,
            visiblePassword: isTemporaryPassword ? finalPassword : null,
        });

        let emailSent = false;
        try {
            // Send welcome email for ALL users (clients and staff)
            await emailService.sendWelcomeEmail(user, finalPassword);
            emailSent = true;
        } catch (emailError) {
            console.error("Welcome email failed:", emailError);
        }

        const userData = sanitizeUser(user);

        res.status(201).json({
            success: true,
            message: emailSent
                ? "User created successfully. Welcome email sent."
                : "User created successfully. Welcome email could not be sent.",
            data: {
                user: userData,
                emailSent,
                // Return password only if it was auto-generated (temporary)
                ...(isTemporaryPassword && { temporaryPassword: finalPassword }),
            },
        });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
};


/**
 * Get all lawyers (accessible by coordinators for case assignment)
 */
export const getLawyers = async (req, res) => {
    try {
        const lawyers = await User.findAll({
            where: {
                role: USER_ROLES.LAWYER,
                isActive: true
            },
            attributes: ['id', 'name', 'email', 'phone', 'specializations'],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                lawyers: lawyers.map(lawyer => ({
                    id: lawyer.id,
                    name: lawyer.name,
                    email: lawyer.email,
                    phone: lawyer.phone,
                    specializations: lawyer.specializations || []
                }))
            }
        });
    } catch (error) {
        console.error("Get lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch lawyers",
            error: error.message,
        });
    }
};

/**
 * Get all users (Super Admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, search, page = 1, limit } = req.query;

        const isUnlimited = limit === '0' || limit === 0 || (typeof limit === 'string' && limit.toLowerCase() === 'all');
        const resolvedLimit = isUnlimited ? null : (limit !== undefined ? parseInt(limit) : 50);
        const resolvedPage = parseInt(page);

        const where = {};

        if (role) {
            where.role = role;
        }

        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = !isUnlimited ? (resolvedPage - 1) * resolvedLimit : null;

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ["password"] }, // visiblePassword will be included by default
            ...(isUnlimited ? {} : { limit: resolvedLimit, offset: offset }),
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: {
                users: rows,
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
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: error.message,
        });
    }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            email,
            phone, 
            clientNumber,
            assignedEmirates, 
            isActive, 
            specializations,
            permissions,
            // Extended client fields
            nationality,
            emiratesId,
            whatsappNumber,
            landlineNumber,
            address,
            city,
            companyName,
            companyEmail,
            companyPhone,
            companyAddress,
            occupation,
            employerName,
            notes
        } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update basic fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (clientNumber !== undefined) user.clientNumber = clientNumber;
        if (assignedEmirates !== undefined) user.assignedEmirates = assignedEmirates;
        if (specializations !== undefined) user.specializations = specializations;
        if (permissions !== undefined) user.permissions = permissions;
        if (isActive !== undefined) user.isActive = isActive;

        // Update extended client fields
        if (nationality !== undefined) user.nationality = nationality;
        if (emiratesId !== undefined) user.emiratesId = emiratesId;
        if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
        if (landlineNumber !== undefined) user.landlineNumber = landlineNumber;
        if (address !== undefined) user.address = address;
        if (city !== undefined) user.city = city;
        if (companyName !== undefined) user.companyName = companyName;
        if (companyEmail !== undefined) user.companyEmail = companyEmail;
        if (companyPhone !== undefined) user.companyPhone = companyPhone;
        if (companyAddress !== undefined) user.companyAddress = companyAddress;
        if (occupation !== undefined) user.occupation = occupation;
        if (employerName !== undefined) user.employerName = employerName;
        if (notes !== undefined) user.notes = notes;

        await user.save();

        const userData = sanitizeUser(user);

        res.json({
            success: true,
            message: "User updated successfully",
            data: { user: userData },
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message,
        });
    }
};

/**
 * Delete user (Super Admin only)
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Prevent deleting self
        if (id === req.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account",
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message,
        });
    }
};

/**
 * Reset password by admin (for client credentials management)
 */
export const resetPasswordByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password is required",
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update both password and visiblePassword
        user.password = hashedPassword;
        user.visiblePassword = newPassword; // Store plain text for admin viewing
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully",
            data: {
                user: sanitizeUser(user),
                newPassword, // Return the new password to show to admin
            },
        });
    } catch (error) {
        console.error("Reset password by admin error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message,
        });
    }
};

/**
 * Assign emirates to user
 */
export const assignEmirates = async (req, res) => {
    try {
        const { id } = req.params;
        const { emirates } = req.body;

        if (!Array.isArray(emirates)) {
            return res.status(400).json({
                success: false,
                message: "Emirates must be an array",
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (
            user.role !== USER_ROLES.COORDINATOR &&
            user.role !== USER_ROLES.COUNSELLOR
        ) {
            return res.status(400).json({
                success: false,
                message: "Only coordinators and counsellors can have assigned emirates",
            });
        }

        user.assignedEmirates = emirates;
        await user.save();

        const userData = sanitizeUser(user);

        res.json({
            success: true,
            message: "Emirates assigned successfully",
            data: { user: userData },
        });
    } catch (error) {
        console.error("Assign emirates error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign emirates",
            error: error.message,
        });
    }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findByPk(req.userId);

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error.message,
        });
    }
};

/**
 * Reset user password (Super Admin only)
 */
export const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            success: true,
            message: "User password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message,
        });
    }
};

/**
 * Get case statistics for all lawyers
 */
export const getCaseStatistics = async (req, res) => {
    try {
        // Import Case model here to avoid circular dependency
        const Case = (await import("../models/case.model.js")).default;

        // Get all lawyers
        const lawyers = await User.findAll({
            where: { role: USER_ROLES.LAWYER },
            attributes: ['id']
        });

        const statistics = {};

        // For each lawyer, count assigned and completed cases
        for (const lawyer of lawyers) {
            const assignedCount = await Case.count({
                where: { lawyerId: lawyer.id }
            });

            const completedCount = await Case.count({
                where: {
                    lawyerId: lawyer.id,
                    status: 'closed'
                }
            });

            statistics[lawyer.id] = {
                assigned: assignedCount,
                completed: completedCount
            };
        }

        res.json({
            success: true,
            data: { statistics }
        });
    } catch (error) {
        console.error("Get case statistics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch case statistics",
            error: error.message,
        });
    }
};

/**
 * Bulk import clients from Excel
 * @route POST /api/users/import
 * @access Super Admin only
 */
export const bulkImportClients = async (req, res) => {
    try {
        const data = req.body;
        const createdBy = req.user.id;

        console.log('=== BULK CLIENT IMPORT ===');
        console.log('Received data count:', Array.isArray(data) ? data.length : 0);

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array of clients.',
            });
        }

        const results = {
            success: 0,
            failed: 0,
            updated: 0,
            errors: [],
        };

        for (const [index, item] of data.entries()) {
            try {
                // Validate required fields
                if (!item.name || !item.email || !item.phone) {
                    results.failed++;
                    results.errors.push({
                        row: index + 2, // +2 for Excel row (1 for header, 1 for 0-index)
                        data: item,
                        error: 'Missing required fields: name, email, or phone'
                    });
                    continue;
                }

                // Check if user already exists
                const existingUser = await User.findOne({
                    where: {
                        [Op.or]: [
                            { email: item.email },
                            { phone: item.phone }
                        ]
                    }
                });

                // Generate password
                const tempPassword = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                // Generate or validate client number
                let clientNumber = item.clientNumber || null;
                if (clientNumber) {
                    // If client number provided, check if it already exists
                    const duplicateNumber = await User.findOne({
                        where: { clientNumber }
                    });
                    if (duplicateNumber) {
                        results.failed++;
                        results.errors.push({
                            row: index + 2,
                            data: item,
                            error: `Client number ${clientNumber} already exists`
                        });
                        continue;
                    }
                } else {
                    // Auto-generate client number
                    clientNumber = await generateClientNumber(User);
                }

                // Prepare user data
                const userData = {
                    name: item.name,
                    email: item.email,
                    phone: item.phone,
                    role: 'client',
                    password: hashedPassword,
                    visiblePassword: tempPassword,
                    clientNumber: clientNumber,
                    isActive: item.isActive === 'No' ? false : true,
                    createdBy: createdBy,
                    // Extended fields
                    nationality: item.nationality || null,
                    emiratesId: item.emiratesId || null,
                    whatsappNumber: item.whatsappNumber || null,
                    landlineNumber: item.landlineNumber || null,
                    companyName: item.companyName || null,
                    companyAddress: item.companyAddress || null,
                    companyEmail: item.companyEmail || null,
                    companyPhone: item.companyPhone || null,
                    occupation: item.occupation || null,
                    employerName: item.employerName || null,
                    address: item.address || null,
                    city: item.city || null,
                    notes: item.notes || null,
                    caseNumber: item.caseNumber || null,
                };

                if (existingUser) {
                    // Update existing user (except password and email)
                    await existingUser.update({
                        name: userData.name,
                        phone: userData.phone,
                        isActive: userData.isActive,
                        nationality: userData.nationality,
                        emiratesId: userData.emiratesId,
                        whatsappNumber: userData.whatsappNumber,
                        landlineNumber: userData.landlineNumber,
                        companyName: userData.companyName,
                        companyAddress: userData.companyAddress,
                        companyEmail: userData.companyEmail,
                        companyPhone: userData.companyPhone,
                        occupation: userData.occupation,
                        employerName: userData.employerName,
                        address: userData.address,
                        city: userData.city,
                        notes: userData.notes,
                        caseNumber: userData.caseNumber,
                    });
                    results.updated++;
                    console.log(`Updated client: ${item.email}`);
                } else {
                    // Create new user
                    await User.create(userData);
                    results.success++;
                    console.log(`Created client: ${item.email}`);

                    // Send welcome email with credentials
                    try {
                        await emailService.sendClientCredentials(
                            item.email,
                            item.name,
                            item.email,
                            tempPassword
                        );
                    } catch (emailError) {
                        console.error(`Failed to send email to ${item.email}:`, emailError.message);
                        // Don't fail the import if email fails
                    }
                }

            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: index + 2,
                    data: item,
                    error: error.message
                });
                console.error(`Error processing row ${index + 2}:`, error.message);
            }
        }

        console.log('=== IMPORT COMPLETE ===');
        console.log(`Created: ${results.success}, Updated: ${results.updated}, Failed: ${results.failed}`);

        res.json({
            success: true,
            message: `Import completed. ${results.success} created, ${results.updated} updated, ${results.failed} failed.`,
            results: {
                created: results.success,
                updated: results.updated,
                failed: results.failed,
                errors: results.errors.slice(0, 10), // Limit errors to first 10
                totalErrors: results.errors.length
            }
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during import',
            error: error.message,
        });
    }
};

export default {
    createUser,
    getLawyers,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    assignEmirates,
    changePassword,
    resetPassword,
    resetPasswordByAdmin,
    getCaseStatistics,
    bulkImportClients,
};
