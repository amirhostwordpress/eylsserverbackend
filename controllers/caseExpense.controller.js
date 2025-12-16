// Case Expense Controller
import CaseExpense from "../models/caseExpense.model.js";
import Case from "../models/case.model.js";

/**
 * @desc    Get all expenses for a case
 * @route   GET /api/cases/:caseId/expenses
 * @access  Authenticated
 */
export const getExpenses = async (req, res) => {
    try {
        const { caseId } = req.params;

        console.log('\n💰 GET Expenses for case:', caseId);

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        const expenses = await CaseExpense.findAll({
            where: { caseId },
            order: [["date", "DESC"]],
        });

        console.log('✅ Found', expenses.length, 'expenses\n');

        res.json({
            success: true,
            data: { expenses },
        });
    } catch (error) {
        console.error("❌ Get expenses error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expenses",
            error: error.message,
        });
    }
};

/**
 * @desc    Add new expense
 * @route   POST /api/cases/:caseId/expenses
 * @access  Authenticated
 */
export const addExpense = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { date, expense, amount } = req.body;

        console.log('\n➕ ADD Expense for case:', caseId);

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Validation
        if (!date || !expense || !amount) {
            return res.status(400).json({
                success: false,
                message: "Date, expense description, and amount are required",
            });
        }

        const newExpense = await CaseExpense.create({
            caseId,
            date,
            expense,
            amount: parseFloat(amount),
        });

        console.log('✅ Created expense:', newExpense.id, '\n');

        res.status(201).json({
            success: true,
            data: { expense: newExpense },
        });
    } catch (error) {
        console.error("❌ Add expense error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add expense",
            error: error.message,
        });
    }
};

/**
 * @desc    Update expense
 * @route   PUT /api/cases/:caseId/expenses/:id
 * @access  Authenticated
 */
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, expense, amount } = req.body;

        console.log('\n↻ UPDATE Expense:', id);

        const expenseRecord = await CaseExpense.findByPk(id);
        if (!expenseRecord) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        await expenseRecord.update({
            date,
            expense,
            amount: amount ? parseFloat(amount) : expenseRecord.amount,
        });

        console.log('✅ Updated expense\n');

        res.json({
            success: true,
            data: { expense: expenseRecord },
        });
    } catch (error) {
        console.error("❌ Update expense error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update expense",
            error: error.message,
        });
    }
};

/**
 * @desc    Delete expense
 * @route   DELETE /api/cases/:caseId/expenses/:id
 * @access  Authenticated
 */
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('\n🗑️  DELETE Expense:', id);

        const expenseRecord = await CaseExpense.findByPk(id);
        if (!expenseRecord) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        await expenseRecord.destroy();

        console.log('✅ Deleted expense\n');

        res.json({
            success: true,
            message: "Expense deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete expense error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete expense",
            error: error.message,
        });
    }
};
