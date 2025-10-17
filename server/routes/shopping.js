/**
 * Shopping List Routes
 * Handles CRUD operations for trip shopping lists
 */
const express = require('express');
const router = express.Router();
const { authenticateToken, requireTripMember } = require('../middleware/auth');
const { validateShoppingItem, validateId, handleValidationErrors } = require('../middleware/validation');
const { Database } = require('../models/database');

const db = new Database();

/**
 * Get shopping list for a trip
 * GET /api/shopping/trips/:tripId
 */
router.get('/trips/:tripId', 
    authenticateToken,
    validateId('tripId'),
    handleValidationErrors,
    requireTripMember,
    async (req, res) => {
        try {
            const { tripId } = req.params;
            
            const items = await db.all(`
                SELECT si.*, u.name as created_by_name, au.name as assigned_to_name
                FROM shopping_items si
                LEFT JOIN users u ON si.created_by = u.id
                LEFT JOIN users au ON si.assigned_to = au.id
                WHERE si.trip_id = ?
                ORDER BY si.category, si.created_at DESC
            `, [tripId]);

            res.json({
                success: true,
                message: 'Shopping list retrieved successfully',
                data: items
            });
        } catch (error) {
            console.error('Error getting shopping list:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve shopping list'
            });
        }
    }
);

/**
 * Add item to shopping list
 * POST /api/shopping/trips/:tripId
 */
router.post('/trips/:tripId',
    authenticateToken,
    validateId('tripId'),
    validateShoppingItem,
    handleValidationErrors,
    requireTripMember,
    async (req, res) => {
        try {
            const { tripId } = req.params;
            const { name, quantity = 1, notes = '', category = 'other', amazon_url = '' } = req.body;
            const userId = req.user.userId;

            const result = await db.run(`
                INSERT INTO shopping_items (trip_id, name, quantity, notes, category, amazon_url, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [tripId, name, quantity, notes, category, amazon_url, userId]);

            const newItem = await db.get(`
                SELECT si.*, u.name as created_by_name
                FROM shopping_items si
                LEFT JOIN users u ON si.created_by = u.id
                WHERE si.id = ?
            `, [result.lastID]);

            res.status(201).json({
                success: true,
                message: 'Shopping item added successfully',
                data: newItem
            });
        } catch (error) {
            console.error('Error adding shopping item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add shopping item'
            });
        }
    }
);

/**
 * Update shopping item
 * PUT /api/shopping/items/:itemId
 */
router.put('/items/:itemId',
    authenticateToken,
    validateId('itemId'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { itemId } = req.params;
            const userId = req.user.userId;
            
            // Check if item exists and user has permission
            const item = await db.get(`
                SELECT si.*, tm.role
                FROM shopping_items si
                JOIN trip_members tm ON si.trip_id = tm.trip_id
                WHERE si.id = ? AND tm.user_id = ?
            `, [itemId, userId]);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Shopping item not found or access denied'
                });
            }

            // Build update query dynamically
            const allowedFields = ['name', 'quantity', 'notes', 'category', 'amazon_url', 'purchased', 'assigned_to'];
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(req.body)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            values.push(itemId);
            
            await db.run(`
                UPDATE shopping_items 
                SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, values);

            const updatedItem = await db.get(`
                SELECT si.*, u.name as created_by_name, au.name as assigned_to_name
                FROM shopping_items si
                LEFT JOIN users u ON si.created_by = u.id
                LEFT JOIN users au ON si.assigned_to = au.id
                WHERE si.id = ?
            `, [itemId]);

            res.json({
                success: true,
                message: 'Shopping item updated successfully',
                data: updatedItem
            });
        } catch (error) {
            console.error('Error updating shopping item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update shopping item'
            });
        }
    }
);

/**
 * Delete shopping item
 * DELETE /api/shopping/items/:itemId
 */
router.delete('/items/:itemId',
    authenticateToken,
    validateId('itemId'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { itemId } = req.params;
            const userId = req.user.userId;
            
            // Check if item exists and user has permission (admin or creator)
            const item = await db.get(`
                SELECT si.*, tm.role
                FROM shopping_items si
                JOIN trip_members tm ON si.trip_id = tm.trip_id
                WHERE si.id = ? AND tm.user_id = ? AND (tm.role = 'admin' OR si.created_by = ?)
            `, [itemId, userId, userId]);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Shopping item not found or insufficient permissions'
                });
            }

            await db.run('DELETE FROM shopping_items WHERE id = ?', [itemId]);

            res.json({
                success: true,
                message: 'Shopping item deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting shopping item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete shopping item'
            });
        }
    }
);

/**
 * Assign shopping item to user
 * PUT /api/shopping/items/:itemId/assign
 */
router.put('/items/:itemId/assign',
    authenticateToken,
    validateId('itemId'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { itemId } = req.params;
            const { assignedTo } = req.body;
            const userId = req.user.userId;
            
            // Check if item exists and user has permission
            const item = await db.get(`
                SELECT si.*, tm.role
                FROM shopping_items si
                JOIN trip_members tm ON si.trip_id = tm.trip_id
                WHERE si.id = ? AND tm.user_id = ?
            `, [itemId, userId]);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Shopping item not found or access denied'
                });
            }

            // If assigning to someone, verify they're a trip member
            if (assignedTo) {
                const isMember = await db.get(`
                    SELECT id FROM trip_members 
                    WHERE trip_id = ? AND user_id = ?
                `, [item.trip_id, assignedTo]);

                if (!isMember) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot assign to user who is not a trip member'
                    });
                }
            }

            await db.run(`
                UPDATE shopping_items 
                SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [assignedTo || null, itemId]);

            const updatedItem = await db.get(`
                SELECT si.*, u.name as created_by_name, au.name as assigned_to_name
                FROM shopping_items si
                LEFT JOIN users u ON si.created_by = u.id
                LEFT JOIN users au ON si.assigned_to = au.id
                WHERE si.id = ?
            `, [itemId]);

            res.json({
                success: true,
                message: 'Shopping item assignment updated successfully',
                data: updatedItem
            });
        } catch (error) {
            console.error('Error assigning shopping item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assign shopping item'
            });
        }
    }
);

module.exports = router;
