// backend/services/db/session.queries.js
const pool = require('./connection');
const { keysToCamel } = require('./utils');

/**
 * Creates a new agent session record upon login.
 * @param {string} agentId - The ID of the agent logging in.
 * @returns {Promise<object>} The newly created session object.
 */
const createAgentSession = async (agentId) => {
    const query = `
        INSERT INTO agent_sessions (id, agent_id, login_time)
        VALUES ($1, $2, NOW())
        RETURNING *;
    `;
    const newId = `session-${Date.now()}`;
    const res = await pool.query(query, [newId, agentId]);
    console.log(`[DB] Created session ${newId} for agent ${agentId}`);
    return keysToCamel(res.rows[0]);
};

/**
 * Ends the last open agent session upon logout.
 * Finds the most recent session for the agent that has no logout_time and updates it.
 * @param {string} agentId - The ID of the agent logging out.
 * @returns {Promise<object|null>} The updated session object or null if no open session was found.
 */
const endAgentSession = async (agentId) => {
    const query = `
        UPDATE agent_sessions
        SET logout_time = NOW()
        WHERE id = (
            SELECT id
            FROM agent_sessions
            WHERE agent_id = $1 AND logout_time IS NULL
            ORDER BY login_time DESC
            LIMIT 1
        )
        RETURNING *;
    `;
    const res = await pool.query(query, [agentId]);
    if (res.rows.length > 0) {
        console.log(`[DB] Ended session ${res.rows[0].id} for agent ${agentId}`);
        return keysToCamel(res.rows[0]);
    }
    console.warn(`[DB] No open session found to end for agent ${agentId}`);
    return null;
};

/**
 * Closes all sessions that were not properly closed (e.g., due to a server crash).
 * This should be run on server startup.
 */
const closeAllStaleSessions = async () => {
    try {
        const query = `
            UPDATE agent_sessions
            SET logout_time = login_time + interval '1 second'
            WHERE logout_time IS NULL;
        `;
        const res = await pool.query(query);
        if (res.rowCount > 0) {
            console.log(`[DB Cleanup] Closed ${res.rowCount} stale agent session(s).`);
        } else {
            console.log('[DB Cleanup] No stale agent sessions found.');
        }
    } catch (error) {
        console.error('[DB Cleanup] Error closing stale sessions:', error);
    }
};

module.exports = {
    createAgentSession,
    endAgentSession,
    closeAllStaleSessions,
};
