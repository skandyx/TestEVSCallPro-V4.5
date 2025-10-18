// backend/routes/activityTypes.js
const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Middleware to check for Admin/SuperAdmin/Supervisor role
const isAllowed = (req, res, next) => {
    const allowedRoles = ['Administrateur', 'SuperAdmin', 'Superviseur'];
    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ error: 'Accès non autorisé.' });
    }
};

router.post('/', isAllowed, async (req, res) => {
    try {
        const newActivity = await db.saveActivityType(req.body);
        res.status(201).json(newActivity);
    } catch (error) {
        console.error('Error creating activity type:', error);
        res.status(500).json({ error: 'Failed to create activity type' });
    }
});

router.put('/:id', isAllowed, async (req, res) => {
    try {
        const updatedActivity = await db.saveActivityType(req.body, req.params.id);
        res.json(updatedActivity);
    } catch (error) {
        console.error('Error updating activity type:', error);
        res.status(500).json({ error: 'Failed to update activity type' });
    }
});

router.delete('/:id', isAllowed, async (req, res) => {
    try {
        await db.deleteActivityType(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting activity type:', error);
        res.status(500).json({ error: error.message || 'Failed to delete activity type' });
    }
});

module.exports = router;
