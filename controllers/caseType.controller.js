import CaseType from '../models/caseType.model.js';
import CaseCategory from '../models/caseCategory.model.js';
import CaseSubCategory from '../models/caseSubCategory.model.js';
import User from '../models/user.model.js';

// ============ CASE TYPES ============

// @desc    Create case type
// @route   POST /api/case-types
// @access  Super Admin
export const createCaseType = async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({ message: 'Name and code are required' });
        }

        const existingType = await CaseType.findOne({ where: { name } });
        if (existingType) {
            return res.status(400).json({ message: 'Case type with this name already exists' });
        }

        const existingCode = await CaseType.findOne({ where: { code } });
        if (existingCode) {
            return res.status(400).json({ message: 'Case type with this code already exists' });
        }

        const caseType = await CaseType.create({
            name,
            code,
            createdBy: req.user.id,
        });

        res.status(201).json(caseType);
    } catch (error) {
        console.error('Create case type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all case types
// @route   GET /api/case-types
// @access  Authenticated
export const getAllCaseTypes = async (req, res) => {
    try {
        const { includeInactive } = req.query;

        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        const caseTypes = await CaseType.findAll({
            where: whereClause,
            include: [
                {
                    model: CaseCategory,
                    as: 'categories',
                    where: includeInactive === 'true' ? {} : { isActive: true },
                    required: false,
                    include: [
                        {
                            model: CaseSubCategory,
                            as: 'subCategories',
                            where: includeInactive === 'true' ? {} : { isActive: true },
                            required: false,
                        },
                    ],
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json(caseTypes);
    } catch (error) {
        console.error('Get case types error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single case type
// @route   GET /api/case-types/:id
// @access  Authenticated
export const getCaseTypeById = async (req, res) => {
    try {
        const caseType = await CaseType.findByPk(req.params.id, {
            include: [
                {
                    model: CaseCategory,
                    as: 'categories',
                    include: [
                        {
                            model: CaseSubCategory,
                            as: 'subCategories',
                        },
                    ],
                },
            ],
        });

        if (!caseType) {
            return res.status(404).json({ message: 'Case type not found' });
        }

        res.json(caseType);
    } catch (error) {
        console.error('Get case type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update case type
// @route   PUT /api/case-types/:id
// @access  Super Admin
export const updateCaseType = async (req, res) => {
    try {
        const { name, code, isActive } = req.body;

        const caseType = await CaseType.findByPk(req.params.id);
        if (!caseType) {
            return res.status(404).json({ message: 'Case type not found' });
        }

        // Check for duplicates if name/code is being changed
        if (name && name !== caseType.name) {
            const existing = await CaseType.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ message: 'Case type with this name already exists' });
            }
        }

        if (code && code !== caseType.code) {
            const existing = await CaseType.findOne({ where: { code } });
            if (existing) {
                return res.status(400).json({ message: 'Case type with this code already exists' });
            }
        }

        await caseType.update({ name, code, isActive });

        res.json(caseType);
    } catch (error) {
        console.error('Update case type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete case type (cascade)
// @route   DELETE /api/case-types/:id
// @access  Super Admin
export const deleteCaseType = async (req, res) => {
    try {
        const caseType = await CaseType.findByPk(req.params.id);
        if (!caseType) {
            return res.status(404).json({ message: 'Case type not found' });
        }

        // Count related categories
        const categoryCount = await CaseCategory.count({ where: { caseTypeId: req.params.id } });

        await caseType.destroy();

        res.json({
            message: 'Case type deleted successfully',
            deletedCategories: categoryCount,
        });
    } catch (error) {
        console.error('Delete case type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ============ CASE CATEGORIES ============

// @desc    Create case category
// @route   POST /api/case-categories
// @access  Super Admin
export const createCaseCategory = async (req, res) => {
    try {
        const { name, caseTypeId } = req.body;

        if (!name || !caseTypeId) {
            return res.status(400).json({ message: 'Name and case type ID are required' });
        }

        const caseType = await CaseType.findByPk(caseTypeId);
        if (!caseType) {
            return res.status(404).json({ message: 'Case type not found' });
        }

        const category = await CaseCategory.create({
            name,
            caseTypeId,
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Create case category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all case categories
// @route   GET /api/case-categories
// @access  Authenticated
export const getAllCaseCategories = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        const categories = await CaseCategory.findAll({
            where: whereClause,
            include: [
                {
                    model: CaseType,
                    as: 'caseType',
                },
                {
                    model: CaseSubCategory,
                    as: 'subCategories',
                    where: includeInactive === 'true' ? {} : { isActive: true },
                    required: false,
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json(categories);
    } catch (error) {
        console.error('Get case categories error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get categories by case type
// @route   GET /api/case-categories/by-type/:caseTypeId
// @access  Authenticated
export const getCategoriesByType = async (req, res) => {
    try {
        const categories = await CaseCategory.findAll({
            where: {
                caseTypeId: req.params.caseTypeId,
                isActive: true
            },
            include: [
                {
                    model: CaseSubCategory,
                    as: 'subCategories',
                    where: { isActive: true },
                    required: false,
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json(categories);
    } catch (error) {
        console.error('Get categories by type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update case category
// @route   PUT /api/case-categories/:id
// @access  Super Admin
export const updateCaseCategory = async (req, res) => {
    try {
        const { name, caseTypeId, isActive } = req.body;

        const category = await CaseCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (caseTypeId) {
            const caseType = await CaseType.findByPk(caseTypeId);
            if (!caseType) {
                return res.status(404).json({ message: 'Case type not found' });
            }
        }

        await category.update({ name, caseTypeId, isActive });

        res.json(category);
    } catch (error) {
        console.error('Update case category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete case category (cascade)
// @route   DELETE /api/case-categories/:id
// @access  Super Admin
export const deleteCaseCategory = async (req, res) => {
    try {
        const category = await CaseCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const subCategoryCount = await CaseSubCategory.count({ where: { categoryId: req.params.id } });

        await category.destroy();

        res.json({
            message: 'Category deleted successfully',
            deletedSubCategories: subCategoryCount,
        });
    } catch (error) {
        console.error('Delete case category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ============ CASE SUB-CATEGORIES ============

// @desc    Create case sub-category
// @route   POST /api/case-sub-categories
// @access  Super Admin
export const createCaseSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        if (!name || !categoryId) {
            return res.status(400).json({ message: 'Name and category ID are required' });
        }

        const category = await CaseCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const subCategory = await CaseSubCategory.create({
            name,
            categoryId,
        });

        res.status(201).json(subCategory);
    } catch (error) {
        console.error('Create case sub-category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all case sub-categories
// @route   GET /api/case-sub-categories
// @access  Authenticated
export const getAllCaseSubCategories = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        const subCategories = await CaseSubCategory.findAll({
            where: whereClause,
            include: [
                {
                    model: CaseCategory,
                    as: 'category',
                    include: [
                        {
                            model: CaseType,
                            as: 'caseType',
                        },
                    ],
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json(subCategories);
    } catch (error) {
        console.error('Get case sub-categories error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get sub-categories by category
// @route   GET /api/case-sub-categories/by-category/:categoryId
// @access  Authenticated
export const getSubCategoriesByCategory = async (req, res) => {
    try {
        const subCategories = await CaseSubCategory.findAll({
            where: {
                categoryId: req.params.categoryId,
                isActive: true
            },
            order: [['name', 'ASC']],
        });

        res.json(subCategories);
    } catch (error) {
        console.error('Get sub-categories by category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update case sub-category
// @route   PUT /api/case-sub-categories/:id
// @access  Super Admin
export const updateCaseSubCategory = async (req, res) => {
    try {
        const { name, categoryId, isActive } = req.body;

        const subCategory = await CaseSubCategory.findByPk(req.params.id);
        if (!subCategory) {
            return res.status(404).json({ message: 'Sub-category not found' });
        }

        if (categoryId) {
            const category = await CaseCategory.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        await subCategory.update({ name, categoryId, isActive });

        res.json(subCategory);
    } catch (error) {
        console.error('Update case sub-category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete case sub-category
// @route   DELETE /api/case-sub-categories/:id
// @access  Super Admin
export const deleteCaseSubCategory = async (req, res) => {
    try {
        const subCategory = await CaseSubCategory.findByPk(req.params.id);
        if (!subCategory) {
            return res.status(404).json({ message: 'Sub-category not found' });
        }

        await subCategory.destroy();

        res.json({ message: 'Sub-category deleted successfully' });
    } catch (error) {
        console.error('Delete case sub-category error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ============ EXPORT ============

// @desc    Export case types for Excel
// @route   GET /api/export/CaseTypes
// @access  Authenticated
export const exportCaseTypes = async (req, res) => {
    try {
        const caseTypes = await CaseType.findAll({
            attributes: ['id', 'name', 'code', 'isActive', 'createdAt'],
            order: [['name', 'ASC']],
        });

        // Format data for Excel export
        const exportData = caseTypes.map(type => ({
            id: type.id,
            name: type.name,
            code: type.code,
            isActive: type.isActive ? 'Yes' : 'No',
            createdAt: type.createdAt,
        }));

        res.json(exportData);
    } catch (error) {
        console.error('Export case types error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export case categories for Excel
// @route   GET /api/export/CaseCategories
// @access  Authenticated
export const exportCaseCategories = async (req, res) => {
    try {
        const categories = await CaseCategory.findAll({
            include: [{
                model: CaseType,
                as: 'caseType',
                attributes: ['name', 'code']
            }],
            order: [['name', 'ASC']],
        });

        // Format data for Excel export
        const exportData = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            caseTypeId: cat.caseTypeId,
            caseTypeName: cat.caseType?.name || '',
            caseTypeCode: cat.caseType?.code || '',
            isActive: cat.isActive ? 'Yes' : 'No',
            createdAt: cat.createdAt,
        }));

        res.json(exportData);
    } catch (error) {
        console.error('Export case categories error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export case sub-categories for Excel
// @route   GET /api/export/CaseSubCategories
// @access  Authenticated
export const exportCaseSubCategories = async (req, res) => {
    try {
        const subCategories = await CaseSubCategory.findAll({
            include: [{
                model: CaseCategory,
                as: 'category',
                attributes: ['name'],
                include: [{
                    model: CaseType,
                    as: 'caseType',
                    attributes: ['name', 'code']
                }]
            }],
            order: [['name', 'ASC']],
        });

        // Format data for Excel export
        const exportData = subCategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            categoryId: sub.categoryId,
            categoryName: sub.category?.name || '',
            caseTypeName: sub.category?.caseType?.name || '',
            caseTypeCode: sub.category?.caseType?.code || '',
            isActive: sub.isActive ? 'Yes' : 'No',
            createdAt: sub.createdAt,
        }));

        res.json(exportData);
    } catch (error) {
        console.error('Export case sub-categories error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ============ IMPORT ============

// @desc    Import case types from Excel
// @route   POST /api/import/CaseTypes
// @access  Super Admin
export const importCaseTypes = async (req, res) => {
    try {
        console.log('Import request received');
        console.log('Request body type:', typeof req.body);
        console.log('Request body:', JSON.stringify(req.body).substring(0, 200));
        console.log('Is array:', Array.isArray(req.body));
        
        const data = req.body;
        
        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid data format. Expected an array of case types.',
                receivedType: typeof data,
                isArray: Array.isArray(data)
            });
        }
        
        if (data.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'No data provided. The array is empty.' 
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const item of data) {
            try {
                if (!item.name || !item.code) {
                    results.failed++;
                    results.errors.push(`Row missing required fields: ${JSON.stringify(item)}`);
                    continue;
                }

                // Check if exists by code
                const existing = await CaseType.findOne({ where: { code: item.code } });
                
                if (existing) {
                    // Update existing
                    await existing.update({
                        name: item.name,
                        isActive: item.isActive === 'No' ? false : true
                    });
                } else {
                    // Create new
                    await CaseType.create({
                        name: item.name,
                        code: item.code,
                        isActive: item.isActive === 'No' ? false : true,
                        createdBy: req.user.id
                    });
                }
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Error processing ${item.name}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Import completed. ${results.success} successful, ${results.failed} failed.`,
            results
        });
    } catch (error) {
        console.error('Import case types error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Import case categories from Excel
// @route   POST /api/import/CaseCategories
// @access  Super Admin
export const importCaseCategories = async (req, res) => {
    try {
        console.log('Import categories request received');
        console.log('Is array:', Array.isArray(req.body));
        
        const data = req.body;
        
        if (!Array.isArray(data)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid data format. Expected an array of categories.' 
            });
        }
        
        if (data.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'No data provided. The array is empty.' 
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const item of data) {
            try {
                if (!item.name || !item.caseTypeId) {
                    results.failed++;
                    results.errors.push(`Row missing required fields: ${JSON.stringify(item)}`);
                    continue;
                }

                // Verify case type exists
                const caseType = await CaseType.findByPk(item.caseTypeId);
                if (!caseType) {
                    results.failed++;
                    results.errors.push(`Case type not found for: ${item.name}`);
                    continue;
                }

                // Check if exists by name and caseTypeId
                const existing = await CaseCategory.findOne({ 
                    where: { 
                        name: item.name,
                        caseTypeId: item.caseTypeId 
                    } 
                });
                
                if (existing) {
                    // Update existing
                    await existing.update({
                        isActive: item.isActive === 'No' ? false : true
                    });
                } else {
                    // Create new
                    await CaseCategory.create({
                        name: item.name,
                        caseTypeId: item.caseTypeId,
                        isActive: item.isActive === 'No' ? false : true
                    });
                }
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Error processing ${item.name}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Import completed. ${results.success} successful, ${results.failed} failed.`,
            results
        });
    } catch (error) {
        console.error('Import case categories error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Import case sub-categories from Excel
// @route   POST /api/import/CaseSubCategories
// @access  Super Admin
export const importCaseSubCategories = async (req, res) => {
    try {
        console.log('Import sub-categories request received');
        console.log('Is array:', Array.isArray(req.body));
        
        const data = req.body;
        
        if (!Array.isArray(data)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid data format. Expected an array of sub-categories.' 
            });
        }
        
        if (data.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'No data provided. The array is empty.' 
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const item of data) {
            try {
                if (!item.name || !item.categoryId) {
                    results.failed++;
                    results.errors.push(`Row missing required fields: ${JSON.stringify(item)}`);
                    continue;
                }

                // Verify category exists
                const category = await CaseCategory.findByPk(item.categoryId);
                if (!category) {
                    results.failed++;
                    results.errors.push(`Category not found for: ${item.name}`);
                    continue;
                }

                // Check if exists by name and categoryId
                const existing = await CaseSubCategory.findOne({ 
                    where: { 
                        name: item.name,
                        categoryId: item.categoryId 
                    } 
                });
                
                if (existing) {
                    // Update existing
                    await existing.update({
                        isActive: item.isActive === 'No' ? false : true
                    });
                } else {
                    // Create new
                    await CaseSubCategory.create({
                        name: item.name,
                        categoryId: item.categoryId,
                        isActive: item.isActive === 'No' ? false : true
                    });
                }
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Error processing ${item.name}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Import completed. ${results.success} successful, ${results.failed} failed.`,
            results
        });
    } catch (error) {
        console.error('Import case sub-categories error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
