# SQL Workbench Feature

A comprehensive SQL query interface for the Vascom Store Management System that allows users to execute SQL queries against the database with a user-friendly interface.

## Features

### 🗄️ Database Operations

- **Execute SQL Queries**: Run SELECT, INSERT, UPDATE, and DELETE statements
- **Query History**: Track and review previously executed queries
- **Results Export**: Export query results to CSV format
- **Real-time Results**: View query results in a formatted table

### 📊 Database Schema Browser

- **Table Information**: View detailed schema information for each table
- **Field Details**: See field names, data types, constraints, and defaults
- **Interactive Schema**: Select tables to view their complete structure

### ⚡ Quick Access Queries

- **Pre-built Queries**: Common queries for store management operations
- **One-click Execution**: Execute frequently used queries with a single click
- **Query Examples**: Learn SQL patterns through example queries

### 🔒 Security Features

- **Query Validation**: Prevent dangerous SQL operations (DROP, TRUNCATE, etc.)
- **Operation Limits**: Restrict query length and operation types
- **Safe Operations**: Only allow read and safe write operations

## API Endpoints

### `/api/sql/execute`

Execute SQL queries against the database.

**Method**: POST
**Body**: `{ "query": "SELECT * FROM employees;" }`
**Response**:

```json
{
  "success": true,
  "result": {
    "type": "SELECT",
    "columns": ["id", "name", "department"],
    "rows": [[1, "John Doe", "IT"]],
    "rowCount": 1
  }
}
```

### `/api/sql/schema/:table`

Get detailed schema information for a specific table.

**Method**: GET
**Response**:

```json
{
  "success": true,
  "table": "employees",
  "schema": [
    {
      "field": "id",
      "type": "int(11)",
      "null": "NO",
      "key": "PRI",
      "default": null,
      "extra": "auto_increment"
    }
  ]
}
```

### `/api/sql/tables`

Get a list of all available tables.

**Method**: GET
**Response**:

```json
{
  "success": true,
  "tables": ["employees", "items", "requests"]
}
```

### `/api/sql/sample-queries`

Get pre-built sample queries for common operations.

**Method**: GET
**Response**:

```json
{
  "success": true,
  "queries": [
    {
      "name": "View All Employees",
      "query": "SELECT * FROM employees ORDER BY name ASC;"
    }
  ]
}
```

## Database Tables

### Employees Table

Stores employee information including credentials and roles.

**Fields**:

- `id`: Auto-incrementing primary key
- `name`: Employee full name
- `department`: Department name
- `position`: Job position
- `employee_id`: Unique employee identifier
- `password`: Hashed password
- `date_created`: Account creation timestamp
- `updated_at`: Last update timestamp

### Items Table

Manages inventory items with stock tracking.

**Fields**:

- `id`: Auto-incrementing primary key
- `model`: Item model name
- `brand`: Item brand
- `category`: Item category
- `quantity`: Available stock quantity
- `photo`: Photo file path
- `date_added`: Item addition timestamp
- `updated_at`: Last update timestamp

### Requests Table

Tracks item requests from employees.

**Fields**:

- `id`: Auto-incrementing primary key
- `employee_name`: Requesting employee name
- `item_name`: Requested item name
- `quantity`: Requested quantity
- `status`: Request status (Pending/Approved/Rejected/Finished)
- `date_added`: Request creation timestamp
- `date_approved`: Approval timestamp
- `date_finished`: Completion timestamp
- `updated_at`: Last update timestamp

## Usage Examples

### Basic Queries

```sql
-- View all employees
SELECT * FROM employees ORDER BY name ASC;

-- View all items with low stock
SELECT model, brand, category, quantity
FROM items
WHERE quantity < 5
ORDER BY quantity ASC;

-- Count approved requests
SELECT COUNT(*) as approved_count
FROM requests
WHERE status = 'Approved';
```

### Advanced Analytics

```sql
-- Items by category with total quantity
SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity
FROM items
GROUP BY category
ORDER BY item_count DESC;

-- Recent activity across all tables
SELECT "Employee" as type, name as entity, date_created as date
FROM employees
UNION
SELECT "Item" as type, model as entity, date_added as date
FROM items
UNION
SELECT "Request" as type, CONCAT(employee_name, " - ", item_name) as entity, date_added as date
FROM requests
ORDER BY date DESC
LIMIT 20;
```

### Data Management

```sql
-- Insert new item
INSERT INTO items (model, brand, category, quantity)
VALUES ('iPhone 16', 'Apple', 'Electronics', 15);

-- Update item quantity
UPDATE items
SET quantity = quantity - 1
WHERE model = 'iPhone 15';

-- Mark request as finished
UPDATE requests
SET status = 'Finished', date_finished = NOW()
WHERE id = 1;
```

## Security Considerations

### Query Restrictions

- Only SELECT, INSERT, UPDATE, DELETE, SHOW, DESCRIBE, and EXPLAIN operations allowed
- Dangerous operations (DROP, TRUNCATE, ALTER, CREATE, etc.) are blocked
- Query length limited to 10,000 characters
- No file system access operations permitted

### Input Validation

- All queries are validated before execution
- SQL injection protection through parameterized queries
- Error messages don't expose internal database structure

### Access Control

- SQL Workbench accessible to all authenticated users
- No special permissions required beyond login
- Query execution limited to store management database only

## Integration

### Frontend Integration

The SQL Workbench is integrated into the main application through:

1. **Component**: `src/SQLWorkbench.jsx`
2. **Styles**: `src/SQLWorkbench.css`
3. **Routing**: Added to `src/App_new.jsx` as a new view option

### Backend Integration

The SQL Workbench backend is integrated through:

1. **Routes**: `backend/routes/sql.js`
2. **Server**: Registered in `backend/server.js`
3. **Database**: Uses existing MySQL connection pool

## Development Notes

### Testing the SQL Workbench

1. Start the backend server: `npm run dev` (in backend directory)
2. Start the frontend: `npm run dev` (in root directory)
3. Navigate to the SQL Workbench through the application interface
4. Try executing sample queries or write custom SQL

### Adding New Sample Queries

Edit the sample queries array in `backend/routes/sql.js`:

```javascript
{
  name: 'Your Query Name',
  query: 'SELECT your_query_here;'
}
```

### Extending Security Rules

Modify the `validateQuery` function in `backend/routes/sql.js` to add new restrictions:

```javascript
const dangerousPatterns = [
  // Add new patterns here
  /YOUR_PATTERN/i,
];
```

## Troubleshooting

### Common Issues

**Query Execution Fails**

- Check query syntax and table names
- Ensure query doesn't exceed length limits
- Verify database connection is active

**Schema Not Loading**

- Check if tables exist in database
- Verify API endpoints are accessible
- Check browser console for errors

**Results Not Displaying**

- Ensure query returns valid data
- Check if result format is correct
- Verify frontend-backend communication

### Error Messages

- **"Query too long"**: Reduce query length below 10,000 characters
- **"Dangerous SQL operations are not allowed"**: Remove restricted SQL keywords
- **"Only SELECT, INSERT, UPDATE, DELETE operations are allowed"**: Use supported operations only
- **"Query execution failed"**: Check database connection and query syntax

## Future Enhancements

- **Query Templates**: Save and reuse custom query templates
- **Advanced Analytics**: Built-in charts and visualizations
- **Query Builder**: Visual query construction interface
- **Performance Monitoring**: Query execution time tracking
- **Multi-database Support**: Connect to multiple databases
- **Query Scheduling**: Schedule recurring queries
- **Data Export**: Export to multiple formats (Excel, JSON, etc.)

## Support

For issues related to the SQL Workbench feature:

1. Check the troubleshooting section above
2. Review browser developer console for errors
3. Verify database connectivity
4. Check API endpoint responses
5. Consult the main application documentation

The SQL Workbench provides a powerful yet secure interface for database interaction, making it easier for users to manage and analyze their store data through SQL queries.
