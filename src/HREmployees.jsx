import React, { useState, useEffect } from 'react';
import "./styles.css";

export default function HREmployees({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    employeeId: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        alert('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Error loading employees. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetPasswordForm.newPassword || !resetPasswordForm.confirmPassword) {
      alert('Please enter both new password and confirm password');
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (resetPasswordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: resetPasswordForm.newPassword
        })
      });

      if (response.ok) {
        alert('Password reset successfully');
        setShowPassword(false);
        setResetPasswordForm({
          employeeId: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Refresh employee list
        loadEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password. Please check if the server is running.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Employee deleted successfully');
        // Refresh employee list
        loadEmployees();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee. Please check if the server is running.');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'date_created') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredEmployees = sortedEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-management-page">
      <header className="employee-management-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="header-info">
            <h1 className="management-title">Employee Management</h1>
            <p className="management-subtitle">Manage employee accounts and access</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{employees.length}</span>
              <span className="stat-label">Total Employees</span>
            </div>
          </div>
        </div>
      </header>

      <div className="management-container">
        {/* Search and Filter Section */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search employees by name, department, position, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            {['name', 'department', 'position', 'date_created'].map((field) => (
              <button
                key={field}
                className={`sort-btn ${sortBy === field ? 'active' : ''}`}
                onClick={() => handleSort(field)}
              >
                {field === 'name' ? 'Name' : 
                 field === 'department' ? 'Department' : 
                 field === 'position' ? 'Position' : 'Date Created'}
                {sortBy === field && (
                  <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Employee Table */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">No Employees Found</h3>
            <p className="empty-description">
              {searchTerm ? 'No employees match your search criteria.' : 'No employees have been registered yet.'}
            </p>
          </div>
        ) : (
          <div className="employee-table-container">
            <div className="employee-table-header">
              <div className="table-header-cell" onClick={() => handleSort('name')}>
                Employee Name
                {sortBy === 'name' && <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
              </div>
              <div className="table-header-cell" onClick={() => handleSort('department')}>
                Department
                {sortBy === 'department' && <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
              </div>
              <div className="table-header-cell" onClick={() => handleSort('position')}>
                Position
                {sortBy === 'position' && <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
              </div>
              <div className="table-header-cell" onClick={() => handleSort('employee_id')}>
                Employee ID
                {sortBy === 'employee_id' && <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
              </div>
              <div className="table-header-cell" onClick={() => handleSort('date_created')}>
                Date Created
                {sortBy === 'date_created' && <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
              </div>
              <div className="table-header-cell">Actions</div>
            </div>

            {filteredEmployees.map((employee) => (
              <div className="employee-table-row" key={employee.id}>
                <div className="employee-cell">
                  <div className="employee-avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <span className="employee-name">{employee.name}</span>
                    <span className="employee-id">ID: {employee.employee_id}</span>
                  </div>
                </div>
                <div className="department-cell">
                  <span className="employee-department">{employee.department}</span>
                </div>
                <div className="position-cell">
                  <span className="employee-position">{employee.position}</span>
                </div>
                <div className="id-cell">
                  <span className="employee-id-badge">{employee.employee_id}</span>
                </div>
                <div className="date-cell">
                  <span className="date-added">
                    {employee.date_created ? new Date(employee.date_created).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="date-time">
                    {employee.date_created ? new Date(employee.date_created).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div className="action-cell">
                  <div className="employee-actions">
                    <button 
                      className={`action-btn password-btn ${showPassword && selectedEmployee?.id === employee.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowPassword(!showPassword && selectedEmployee?.id === employee.id);
                      }}
                    >
                      {showPassword && selectedEmployee?.id === employee.id ? 'Hide Password' : 'Reset Password'}
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      Delete Employee
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Password Management Modal */}
        {selectedEmployee && showPassword && (
          <div className="password-modal-overlay">
            <div className="password-modal-content">
              <div className="modal-header">
                <h3>Manage Password for {selectedEmployee.name}</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowPassword(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <p className="security-note">
                  Note: For security reasons, passwords are stored as hashed values and cannot be viewed in plain text.
                </p>
                
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-wrapper">
                      <input 
                        type="password"
                        className="form-input"
                        value={resetPasswordForm.newPassword}
                        onChange={(e) => setResetPasswordForm({...resetPasswordForm, newPassword: e.target.value})}
                        placeholder="Enter new password (min 6 characters)"
                        minLength="6"
                        required
                      />
                    </div>
                    <span className="password-hint">Password must be at least 6 characters long</span>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-wrapper">
                      <input 
                        type="password"
                        className="form-input"
                        value={resetPasswordForm.confirmPassword}
                        onChange={(e) => setResetPasswordForm({...resetPasswordForm, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                        minLength="6"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button"
                      className="action-btn cancel-btn"
                      onClick={() => setShowPassword(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="action-btn reset-btn"
                    >
                      Reset Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
