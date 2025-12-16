import { Parser } from 'json2csv';
import csv from 'csvtojson';

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} fields - Optional list of fields to include
 * @returns {String} - CSV string
 */
export const exportToCSV = (data, fields = []) => {
    try {
        const opts = fields.length > 0 ? { fields } : {};
        const parser = new Parser(opts);
        const csv = parser.parse(data);
        return csv;
    } catch (err) {
        console.error('CSV Export Error:', err);
        throw new Error('Failed to export to CSV');
    }
};

/**
 * Export data to JSON format
 * @param {Array} data - Array of objects to export
 * @returns {String} - JSON string
 */
export const exportToJSON = (data) => {
    try {
        return JSON.stringify(data, null, 2);
    } catch (err) {
        console.error('JSON Export Error:', err);
        throw new Error('Failed to export to JSON');
    }
};

/**
 * Import data from CSV string
 * @param {String} csvString - CSV content
 * @returns {Promise<Array>} - Array of objects
 */
export const importFromCSV = async (csvString) => {
    try {
        const jsonArray = await csv().fromString(csvString);
        return jsonArray;
    } catch (err) {
        console.error('CSV Import Error:', err);
        throw new Error('Failed to import from CSV');
    }
};

/**
 * Import data from JSON string
 * @param {String} jsonString - JSON content
 * @returns {Array} - Array of objects
 */
export const importFromJSON = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch (err) {
        console.error('JSON Import Error:', err);
        throw new Error('Failed to import from JSON');
    }
};

export default {
    exportToCSV,
    exportToJSON,
    importFromCSV,
    importFromJSON,
};
