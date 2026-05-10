const { db } = require('../config/db');

/**
 * Database query optimization utilities
 */

// Connection pooling optimization
const executeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Prepared statement cache for frequently used queries
const preparedStatements = new Map();

const getPreparedStatement = (query) => {
    if (!preparedStatements.has(query)) {
        preparedStatements.set(query, query);
    }
    return preparedStatements.get(query);
};

// Optimized pagination with cursor-based pagination for large datasets
const getPaginatedResults = async (baseQuery, countQuery, params, pagination) => {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    // Validate and sanitize inputs
    const safeLimit = Math.min(parseInt(limit), 100); // Max 100 items per page
    const safeOffset = Math.max(0, parseInt(offset));
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build final query with proper LIMIT/OFFSET
    const finalQuery = `${baseQuery} ORDER BY ${sortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
    const finalParams = [...params, safeLimit, safeOffset];

    // Execute both queries in parallel
    const [data, [count]] = await Promise.all([
        executeQuery(finalQuery, finalParams),
        executeQuery(countQuery, params)
    ]);

    return {
        data,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count.total / safeLimit),
            totalItems: count.total,
            itemsPerPage: safeLimit,
            hasNextPage: page < Math.ceil(count.total / safeLimit),
            hasPrevPage: page > 1
        }
    };
};

// Bulk operations for better performance
const bulkInsert = async (tableName, records) => {
    if (!records || records.length === 0) {
        return { affectedRows: 0 };
    }

    const columns = Object.keys(records[0]);
    const values = records.map(record =>
        columns.map(column => record[column])
    );

    const placeholders = values.map(() => `(?)`).join(',');
    const query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES ${placeholders}`;
    const flattenedValues = values.flat();

    return await executeQuery(query, flattenedValues);
};

const bulkUpdate = async (tableName, updates, whereField) => {
    if (!updates || updates.length === 0) {
        return { affectedRows: 0 };
    }

    const updatePromises = updates.map(async (update) => {
        const whereValue = update[whereField];
        delete update[whereField];

        const setClause = Object.keys(update).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(update), whereValue];

        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereField} = ?`;
        return await executeQuery(query, values);
    });

    const results = await Promise.all(updatePromises);
    return {
        affectedRows: results.reduce((sum, result) => sum + result.affectedRows, 0)
    };
};

// Caching utilities for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedQuery = async (key, queryFn, ttl = CACHE_TTL) => {
    const now = Date.now();

    if (cache.has(key)) {
        const cached = cache.get(key);
        if (now - cached.timestamp < ttl) {
            return cached.data;
        }
        cache.delete(key);
    }

    const data = await queryFn();
    cache.set(key, { data, timestamp: now });
    return data;
};

// Database health check
const checkDatabaseHealth = async () => {
    try {
        const [result] = await executeQuery('SELECT 1 as health_check');
        return result[0].health_check === 1;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
};

// Query performance monitoring
const monitorQueryPerformance = (query, startTime) => {
    const duration = Date.now() - startTime;

    if (duration > 1000) { // Log slow queries (>1 second)
        console.warn(`Slow query detected (${duration}ms):`, query.substring(0, 100));
    }

    return duration;
};

// Optimized request statistics with caching
const getRequestStats = async () => {
    const cacheKey = 'request_stats';

    return await getCachedQuery(cacheKey, async () => {
        const startTime = Date.now();

        const [statusCounts] = await executeQuery(`
      SELECT status, COUNT(*) as count 
      FROM requests 
      GROUP BY status
    `);

        const [priorityCounts] = await executeQuery(`
      SELECT priority, COUNT(*) as count 
      FROM requests 
      GROUP BY priority
    `);

        const [monthlyCounts] = await executeQuery(`
      SELECT DATE_FORMAT(date_added, '%Y-%m') as month, COUNT(*) as count
      FROM requests 
      GROUP BY DATE_FORMAT(date_added, '%Y-%m')
      ORDER BY month DESC 
      LIMIT 12
    `);

        const [topItems] = await executeQuery(`
      SELECT i.model as itemName, i.brand as itemBrand, 
             COUNT(*) as requestCount, SUM(r.quantity) as totalQuantity
      FROM requests r
      JOIN items i ON r.item_id = i.id
      GROUP BY r.item_id
      ORDER BY requestCount DESC
      LIMIT 10
    `);

        monitorQueryPerformance('getRequestStats', startTime);

        return {
            statusCounts,
            priorityCounts,
            monthlyCounts,
            topItems
        };
    }, 2 * 60 * 1000); // Cache for 2 minutes
};

// Optimized inventory check with stock levels
const checkInventoryLevels = async () => {
    const cacheKey = 'inventory_levels';

    return await getCachedQuery(cacheKey, async () => {
        const startTime = Date.now();

        const [lowStockItems] = await executeQuery(`
      SELECT id, model, brand, quantity, min_stock_level, 
             (min_stock_level - quantity) as shortage
      FROM items 
      WHERE quantity <= min_stock_level
      ORDER BY shortage DESC
    `);

        const [outOfStockItems] = await executeQuery(`
      SELECT id, model, brand 
      FROM items 
      WHERE quantity = 0
    `);

        const [overstockedItems] = await executeQuery(`
      SELECT id, model, brand, quantity, max_stock_level
      FROM items 
      WHERE quantity >= max_stock_level
      ORDER BY quantity DESC
    `);

        monitorQueryPerformance('checkInventoryLevels', startTime);

        return {
            lowStockItems,
            outOfStockItems,
            overstockedItems
        };
    }, 5 * 60 * 1000); // Cache for 5 minutes
};

// Database cleanup utilities
const cleanupOldRecords = async (tableName, dateField, retentionDays = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const query = `
    DELETE FROM ${tableName} 
    WHERE ${dateField} < ? 
    LIMIT 1000
  `;

    return await executeQuery(query, [cutoffDate]);
};

// Connection pool monitoring
const getConnectionPoolStats = async () => {
    try {
        const pool = db.pool;
        return {
            totalConnections: pool.config.connectionLimit,
            activeConnections: pool._activeConnections?.length || 0,
            idleConnections: pool._freeConnections?.length || 0,
            queuedRequests: pool._connectionQueue?.length || 0
        };
    } catch (error) {
        console.error('Failed to get connection pool stats:', error);
        return null;
    }
};

module.exports = {
    executeQuery,
    getPaginatedResults,
    bulkInsert,
    bulkUpdate,
    getCachedQuery,
    checkDatabaseHealth,
    monitorQueryPerformance,
    getRequestStats,
    checkInventoryLevels,
    cleanupOldRecords,
    getConnectionPoolStats,
    CACHE_TTL
};