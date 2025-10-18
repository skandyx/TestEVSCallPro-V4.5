// backend/services/db/activityType.queries.js
const pool = require('./connection');
const { keysToCamel } = require('./utils');
const { publish } = require('../redisClient');

const getActivityTypes = async () => {
    // is_system TRUE should come first, then by name
    const res = await pool.query('SELECT * FROM activity_types ORDER BY is_system DESC, name ASC');
    return res.rows.map(keysToCamel);
};

const saveActivityType = async (activity, id) => {
    const { name, color, isActive } = activity;
    let savedActivity;

    if (id) {
        // Update
        const res = await pool.query(
            'UPDATE activity_types SET name=$1, color=$2, is_active=$3, updated_at=NOW() WHERE id=$4 AND is_system = FALSE RETURNING *',
            [name, color, isActive, id]
        );
        if (res.rows.length === 0) {
            // Check if it's a system activity
            const systemCheck = await pool.query('SELECT 1 FROM activity_types WHERE id = $1 AND is_system = TRUE', [id]);
            if (systemCheck.rows.length > 0) {
                // If it's a system activity, only isActive can be toggled
                const toggleRes = await pool.query('UPDATE activity_types SET is_active=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [isActive, id]);
                savedActivity = toggleRes.rows[0];
            } else {
                throw new Error(`Activity with id ${id} not found or is a system activity that cannot be fully edited.`);
            }
        } else {
            savedActivity = res.rows[0];
        }
    } else {
        // Create
        const newId = activity.id || `activity-${Date.now()}`;
        const res = await pool.query(
            'INSERT INTO activity_types (id, name, color, is_active, is_system) VALUES ($1, $2, $3, $4, FALSE) RETURNING *',
            [newId, name, color, isActive]
        );
        savedActivity = res.rows[0];
    }
    
    const finalActivity = keysToCamel(savedActivity);
    publish('events:crud', { type: id ? 'updateActivityType' : 'newActivityType', payload: finalActivity });
    return finalActivity;
};

const deleteActivityType = async (id) => {
    // Add check to prevent deleting system activities
    const res = await pool.query('DELETE FROM activity_types WHERE id=$1 AND is_system = FALSE RETURNING id', [id]);
    if (res.rowCount === 0) {
        throw new Error('Activity not found or is a system activity and cannot be deleted.');
    }
    publish('events:crud', { type: 'deleteActivityType', payload: { id } });
};

module.exports = {
    getActivityTypes,
    saveActivityType,
    deleteActivityType,
};
