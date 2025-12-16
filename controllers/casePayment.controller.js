// Case Payment Controller
import Payment from "../models/payment.model.js";
import Case from "../models/case.model.js";

/**
 * @desc    Get all payments for a case
 * @route   GET /api/cases/:caseId/payments
 * @access  Authenticated
 */
export const getPayments = async (req, res) => {
    try {
        const { caseId } = req.params;

        console.log('\n💳 GET Payments for case:', caseId);

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        const payments = await Payment.findAll({
            where: { caseId },
            order: [["invoiceDate", "DESC"]],
        });

        console.log('✅ Found', payments.length, 'payments\n');

        res.json({
            success: true,
            data: { payments },
        });
    } catch (error) {
        console.error("❌ Get payments error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message,
        });
    }
};

/**
 * @desc    Add new payment
 * @route   POST /api/cases/:caseId/payments
 * @access  Authenticated
 */
export const addPayment = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { date, paymentType, chequeNumber, chequeDate, bank, amount, being } = req.body;

        console.log('\n➕ ADD Payment for case:', caseId);

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Validation
        if (!date || !paymentType || !amount) {
            return res.status(400).json({
                success: false,
                message: "Date, payment type, and amount are required",
            });
        }

        // Build notes field from payment details
        const notes = `Being: ${being || ''} | Bank: ${bank || ''} | Cheque Date: ${chequeDate || ''}`;

        const newPayment = await Payment.create({
            caseId,
            clientId: caseData.clientId,
            amount: parseFloat(amount),
            paymentMethod: paymentType,
            transactionId: chequeNumber || null,
            notes: notes,
            status: 'completed',
            invoiceDate: date,
        });

        console.log('✅ Created payment:', newPayment.id, '\n');

        res.status(201).json({
            success: true,
            data: { payment: newPayment },
        });
    } catch (error) {
        console.error("❌ Add payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add payment",
            error: error.message,
        });
    }
};

/**
 * @desc    Update payment
 * @route   PUT /api/cases/:caseId/payments/:id
 * @access  Authenticated
 */
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, paymentType, chequeNumber, chequeDate, bank, amount, being } = req.body;

        console.log('\n↻ UPDATE Payment:', id);

        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        // Build notes field
        const notes = `Being: ${being || ''} | Bank: ${bank || ''} | Cheque Date: ${chequeDate || ''}`;

        await payment.update({
            amount: amount ? parseFloat(amount) : payment.amount,
            paymentMethod: paymentType || payment.paymentMethod,
            transactionId: chequeNumber,
            notes: notes,
            invoiceDate: date || payment.invoiceDate,
        });

        console.log('✅ Updated payment\n');

        res.json({
            success: true,
            data: { payment },
        });
    } catch (error) {
        console.error("❌ Update payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update payment",
            error: error.message,
        });
    }
};

/**
 * @desc    Delete payment
 * @route   DELETE /api/cases/:caseId/payments/:id
 * @access  Authenticated
 */
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('\n🗑️  DELETE Payment:', id);

        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        await payment.destroy();

        console.log('✅ Deleted payment\n');

        res.json({
            success: true,
            message: "Payment deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete payment",
            error: error.message,
        });
    }
};
