import React, { useState, useEffect } from 'react';
import './SQLWorkbench.css';

const SQLWorkbench = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  const [tableSchemas, setTableSchemas] = useState({});
  const [sampleQueries, setSampleQueries] = useState([
    {
      name: 'View All Employees',
      query: 'SELECT * FROM employees ORDER BY name ASC;'
    },
    {
      name: 'View All Items',
      query: 'SELECT * FROM items ORDER BY model ASC;'
    },
    {
      name: 'View All Requests',
      query: 'SELECT * FROM requests ORDER BY date_added DESC;'
    },
    {
      name: 'Low Stock Items',
      query: 'SELECT model, brand, category, quantity FROM items WHERE quantity < 5 ORDER BY quantity ASC;'
    },
    {
      name: 'Pending Requests',
      query: 'SELECT employee_name, item_name, quantity, date_added FROM requests WHERE status = "Pending" ORDER BY date_added ASC;'
    },
    {
      name: 'Approved Requests Count',
      query: 'SELECT COUNT(*) as approved_count FROM requests WHERE status = "Approved";'
    },
    {
      name: 'Items by Category',
      query: 'SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity FROM items GROUP BY category ORDER BY item_count DESC;'
    },
    {
      name: 'Recent Activity',
      query: 'SELECT "Employee" as type, name as entity, date_created as date FROM employees UNION SELECT "Item" as type, model as entity, date_added as date FROM items UNION SELECT "Request" as type, CONCAT(employee_name, " - ", item_name) as entity, date_added as date FROM requests ORDER BY date DESC LIMIT 20;'
    }
  ]);

  // Fetch sample queries and table schemas on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sample queries
        const queriesResponse = await fetch('/api/sql/sample-queries');
        const queriesData = await queriesResponse.json();
        if (queriesData.success) {
          setSampleQueries(queriesData.queries);
        }

        // Fetch table schemas
        const tablesResponse = await fetch('/api/sql/tables');
        const tablesData = await tablesResponse.json();
        
        if (tablesData.success) {
          const schemas = {};
          for (const table of tablesData.tables) {
            const schemaResponse = await fetch(`/api/sql/schema/${table}`);
            const schemaData = await schemaResponse.json();
            if (schemaData.success) {
              schemas[table] = schemaData.schema.map(field => 
                `${field.field} (${field.type}${field.null === 'NO' ? ', NOT NULL' : ''}${field.key ? `, ${field.key}` : ''}${field.default ? `, DEFAULT ${field.default}` : ''})`
              );
            }
          }
          setTableSchemas(schemas);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use fallback data if API calls fail
        setSampleQueries([
          {
            name: 'View All Employees',
            query: 'SELECT * FROM employees ORDER BY name ASC;'
          },
          {
            name: 'View All Items',
            query: 'SELECT * FROM items ORDER BY model ASC;'
          },
          {
            name: 'View All Requests',
            query: 'SELECT * FROM requests ORDER BY date_added DESC;'
          }
        ]);
        
        setTableSchemas({
          employees: [
            'id (INT, AUTO_INCREMENT, PRIMARY KEY)',
            'name (VARCHAR(100), NOT NULL)',
            'department (VARCHAR(50), NOT NULL)',
            'position (VARCHAR(50), NOT NULL)',
            'employee_id (VARCHAR(50), UNIQUE, NOT NULL)',
            'password (VARCHAR(255), NOT NULL)',
            'date_created (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)',
            'updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)'
          ],
          items: [
            'id (INT, AUTO_INCREMENT, PRIMARY KEY)',
            'model (VARCHAR(100), NOT NULL)',
            'brand (VARCHAR(100), NOT NULL)',
            'category (VARCHAR(50), NOT NULL)',
            'quantity (INT, NOT NULL, DEFAULT 0)',
            'photo (VARCHAR(255))',
            'date_added (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)',
            'updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)'
          ],
          requests: [
            'id (INT, AUTO_INCREMENT, PRIMARY KEY)',
            'employee_name (VARCHAR(100), NOT NULL)',
            'item_name (VARCHAR(100), NOT NULL)',
            'quantity (INT, NOT NULL)',
            'status (ENUM("Pending", "Approved", "Rejected", "Finished"), DEFAULT "Pending")',
            'date_added (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)',
            'date_approved (TIMESTAMP, NULL)',
            'date_finished (TIMESTAMP, NULL)',
            'updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)'
          ]
        });
      }
    };

    fetchData();
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Make API call to backend SQL endpoint
      const response = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.result);
        setHistory(prev => [
          { query, timestamp: new Date().toLocaleString(), success: true },
          ...prev.slice(0, 9) // Keep only last 10 queries
        ]);
      } else {
        throw new Error(data.error || 'Query execution failed');
      }
    } catch (err) {
      setError(err.message);
      setResults(null);
      setHistory(prev => [
        { query, timestamp: new Date().toLocaleString(), success: false, error: err.message },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setLoading(false);
    }
  };

  const simulateQueryExecution = (query) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // For demonstration, we'll return mock data based on query type
        const queryLower = query.toLowerCase().trim();
        
        if (queryLower.includes('select')) {
          if (queryLower.includes('from employees')) {
            resolve({
              type: 'SELECT',
              columns: ['id', 'name', 'department', 'position', 'employee_id', 'date_created'],
              rows: [
                [1, 'John Doe', 'IT', 'Developer', 'EMP001', '2024-01-15 10:30:00'],
                [2, 'Jane Smith', 'HR', 'Manager', 'HR001', '2024-01-16 14:20:00'],
                [3, 'Bob Johnson', 'Store', 'Clerk', 'STORE001', '2024-01-17 09:15:00']
              ],
              rowCount: 3
            });
          } else if (queryLower.includes('from items')) {
            resolve({
              type: 'SELECT',
              columns: ['id', 'model', 'brand', 'category', 'quantity', 'date_added'],
              rows: [
                [1, 'iPhone 15', 'Apple', 'Electronics', 10, '2024-01-10 11:00:00'],
                [2, 'Galaxy S24', 'Samsung', 'Electronics', 8, '2024-01-11 13:30:00'],
                [3, 'ThinkPad X1', 'Lenovo', 'Computers', 5, '2024-01-12 16:45:00']
              ],
              rowCount: 3
            });
          } else if (queryLower.includes('from requests')) {
            resolve({
              type: 'SELECT',
              columns: ['id', 'employee_name', 'item_name', 'quantity', 'status', 'date_added'],
              rows: [
                [1, 'John Doe', 'iPhone 15', 1, 'Approved', '2024-01-20 10:15:00'],
                [2, 'Jane Smith', 'ThinkPad X1', 1, 'Pending', '2024-01-21 14:30:00'],
                [3, 'Bob Johnson', 'Galaxy S24', 2, 'Finished', '2024-01-22 09:45:00']
              ],
              rowCount: 3
            });
          } else {
            resolve({
              type: 'SELECT',
              columns: ['result'],
              rows: [['Query executed successfully']],
              rowCount: 1
            });
          }
        } else if (queryLower.includes('insert')) {
          resolve({
            type: 'INSERT',
            affectedRows: 1,
            insertId: Math.floor(Math.random() * 1000) + 100
          });
        } else if (queryLower.includes('update')) {
          resolve({
            type: 'UPDATE',
            affectedRows: Math.floor(Math.random() * 5) + 1
          });
        } else if (queryLower.includes('delete')) {
          resolve({
            type: 'DELETE',
            affectedRows: Math.floor(Math.random() * 3) + 1
          });
        } else {
          reject(new Error('Unsupported query type. Please use SELECT, INSERT, UPDATE, or DELETE statements.'));
        }
      }, 1000);
    });
  };

  const loadSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery.query);
  };

  const clearResults = () => {
    setResults(null);
    setError('');
  };

  const exportResults = () => {
    if (!results || results.rows.length === 0) return;

    const csvContent = [
      results.columns.join(','),
      ...results.rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sql-workbench">
      <div className="workbench-header">
        <h2>SQL Workbench</h2>
        <p>Execute SQL queries against your store management database</p>
      </div>

      <div className="workbench-grid">
        {/* Query Input Section */}
        <div className="query-section">
          <div className="query-toolbar">
            <h3>SQL Query Editor</h3>
            <div className="query-actions">
              <button onClick={executeQuery} disabled={loading} className="btn-primary">
                {loading ? 'Executing...' : 'Execute Query'}
              </button>
              <button onClick={clearResults} className="btn-secondary">Clear Results</button>
            </div>
          </div>
          
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your SQL query here..."
            className="query-input"
          />

          {/* Sample Queries */}
          <div className="sample-queries">
            <h4>Quick Queries</h4>
            <div className="query-buttons">
              {sampleQueries.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSampleQuery(sample)}
                  className="btn-sample"
                  title={sample.query}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="results-toolbar">
            <h3>Query Results</h3>
            {results && results.rows && results.rows.length > 0 && (
              <button onClick={exportResults} className="btn-export">Export CSV</button>
            )}
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Executing query...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {results && (
            <div className="results-content">
              {results.type === 'SELECT' && (
                <>
                  <div className="result-info">
                    <span>Rows returned: {results.rowCount}</span>
                  </div>
                  <div className="results-table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          {results.columns.map((col, index) => (
                            <th key={index}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {results.type === 'INSERT' && (
                <div className="result-info">
                  <p>✅ Insert successful!</p>
                  <p>Affected rows: {results.affectedRows}</p>
                  <p>Insert ID: {results.insertId}</p>
                </div>
              )}

              {results.type === 'UPDATE' && (
                <div className="result-info">
                  <p>✅ Update successful!</p>
                  <p>Affected rows: {results.affectedRows}</p>
                </div>
              )}

              {results.type === 'DELETE' && (
                <div className="result-info">
                  <p>✅ Delete successful!</p>
                  <p>Affected rows: {results.affectedRows}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Schema Section */}
        <div className="schema-section">
          <h3>Database Schema</h3>
          <div className="schema-selector">
            <select 
              value={selectedTable} 
              onChange={(e) => setSelectedTable(e.target.value)}
              className="table-select"
            >
              <option value="">Select a table to view schema</option>
              <option value="employees">employees</option>
              <option value="items">items</option>
              <option value="requests">requests</option>
            </select>
          </div>
          
          {selectedTable && (
            <div className="table-schema">
              <h4>Table: {selectedTable}</h4>
              <ul className="schema-list">
                {tableSchemas[selectedTable].map((field, index) => (
                  <li key={index} className="schema-field">
                    <span className="field-name">{field.split(' (')[0]}</span>
                    <span className="field-type">{field.split(' (')[1].replace(')', '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Query History */}
          <div className="query-history">
            <h4>Query History</h4>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="no-history">No queries executed yet</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className={`history-item ${item.success ? 'success' : 'error'}`}>
                    <div className="history-query">{item.query}</div>
                    <div className="history-meta">
                      <span>{item.timestamp}</span>
                      <span className={`status ${item.success ? 'success' : 'error'}`}>
                        {item.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    {item.error && (
                      <div className="history-error">{item.error}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLWorkbench;