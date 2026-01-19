const db = require('../config/db');

/**
 * Log an audit event
 * @param {Object} params
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Action name (e.g., 'LOGIN', 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} params.entityType - Entity type (e.g., 'USER', 'PROJECT', 'REPORT')
 * @param {number} [params.entityId] - ID of the entity
 * @param {Object} [params.oldValue] - Previous state of the entity
 * @param {Object} [params.newValue] - New state of the entity
 * @param {string} [params.ipAddress] - IP address of the user
 */
const logAudit = async ({ userId, action, entityType, entityId, oldValue, newValue, ipAddress }) => {
    try {
        const query = `
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const params = [
            userId,
            action,
            entityType,
            entityId || null,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null,
            ipAddress || null
        ];

        await db.query(query, params);
    } catch (error) {
        console.error('Audit Logging Failed:', error);
        // We generally don't want audit logging failure to crash the main request, 
        // so we catch and log error but don't rethrow unless strict audit is required.
    }
};

module.exports = logAudit;
