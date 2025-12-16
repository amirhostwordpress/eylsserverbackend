import express from 'express';
import {
    createCaseType,
    getAllCaseTypes,
    getCaseTypeById,
    updateCaseType,
    deleteCaseType,
    createCaseCategory,
    getAllCaseCategories,
    getCategoriesByType,
    updateCaseCategory,
    deleteCaseCategory,
    createCaseSubCategory,
    getAllCaseSubCategories,
    getSubCategoriesByCategory,
    updateCaseSubCategory,
    deleteCaseSubCategory,
    exportCaseTypes,
    exportCaseCategories,
    exportCaseSubCategories,
    importCaseTypes,
    importCaseCategories,
    importCaseSubCategories,
} from '../controllers/caseType.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

// Case Types routes
router.post('/case-types', protect, authorize(['super_admin']), createCaseType);
router.get('/case-types', protect, getAllCaseTypes);
router.get('/case-types/:id', protect, getCaseTypeById);
router.put('/case-types/:id', protect, authorize(['super_admin']), updateCaseType);
router.delete('/case-types/:id', protect, authorize(['super_admin']), deleteCaseType);

// Case Categories routes
router.post('/case-categories', protect, authorize(['super_admin']), createCaseCategory);
router.get('/case-categories', protect, getAllCaseCategories);
router.get('/case-categories/by-type/:caseTypeId', protect, getCategoriesByType);
router.put('/case-categories/:id', protect, authorize(['super_admin']), updateCaseCategory);
router.delete('/case-categories/:id', protect, authorize(['super_admin']), deleteCaseCategory);

// Case Sub-Categories routes
router.post('/case-sub-categories', protect, authorize(['super_admin']), createCaseSubCategory);
router.get('/case-sub-categories', protect, getAllCaseSubCategories);
router.get('/case-sub-categories/by-category/:categoryId', protect, getSubCategoriesByCategory);
router.put('/case-sub-categories/:id', protect, authorize(['super_admin']), updateCaseSubCategory);
router.delete('/case-sub-categories/:id', protect, authorize(['super_admin']), deleteCaseSubCategory);

// Export routes
router.get('/export/CaseTypes', protect, exportCaseTypes);
router.get('/export/CaseCategories', protect, exportCaseCategories);
router.get('/export/CaseSubCategories', protect, exportCaseSubCategories);

// Import routes
router.post('/import/CaseTypes', protect, authorize(['super_admin']), importCaseTypes);
router.post('/import/CaseCategories', protect, authorize(['super_admin']), importCaseCategories);
router.post('/import/CaseSubCategories', protect, authorize(['super_admin']), importCaseSubCategories);

export default router;
