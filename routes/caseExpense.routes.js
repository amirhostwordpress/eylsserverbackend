import express from 'express';
import * as expenseController from '../controllers/caseExpense.controller.js';
import { authMiddleware as protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Case Expense Routes
router.get('/:caseId/expenses', expenseController.getExpenses);
router.post('/:caseId/expenses', expenseController.addExpense);
router.put('/:caseId/expenses/:id', expenseController.updateExpense);
router.delete('/:caseId/expenses/:id', expenseController.deleteExpense);

export default router;
