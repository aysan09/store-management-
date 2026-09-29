import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import "./styles.css";
import { notifySuccess, notifyError, notifyWarning, notifyInfo } from './utils/toastUtils';

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
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
        notifyError('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      notifyError('Error loading employees. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Safe handler for back button
  const handleBackClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onBack === 'function') {
      onBack();
    } else {
      console.warn('onBack prop was not provided to HREmployees component.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetPasswordForm.newPassword || !resetPasswordForm.confirmPassword) {
      notifyWarning('Please enter both new password and confirm password');
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      notifyError('Passwords do not match');
      return;
    }

    if (resetPasswordForm.newPassword.length < 6) {
      notifyWarning('Password must be at least 6 characters long');
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
        notifySuccess('Password reset successfully');
        setShowPassword(false);
        setResetPasswordForm({
          employeeId: '',
          newPassword: '',
          confirmPassword: ''
        });
        loadEmployees();
      } else {
        const errorData = await response.json();
        notifyError(errorData.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      notifyError('Error resetting password. Please check if the server is running.');
    }
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setEmployeeToDelete(null);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/employees/${employeeToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        notifySuccess('Employee deleted successfully');
        setEmployeeToDelete(null);
        loadEmployees();
      } else {
        const errorData = await response.json();
        notifyError(errorData.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      notifyError('Error deleting employee. Please check if the server is running.');
    } finally {
      setIsDeleting(false);
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

  const handleExportEmployees = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      notifySuccess('Exporting employees to Excel...');
      // Prefer a server-side Excel export when available, otherwise fall back to CSV.
      const response = await fetch('/api/employees/export');
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const isExcel = contentType.includes('spreadsheet') || contentType.includes('octet-stream');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.${isExcel ? 'xlsx' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        notifySuccess('Employees exported successfully!');
        return;
      }
      throw new Error('Export endpoint unavailable');
    } catch (error) {
      console.warn('Server employee export unavailable, using CSV fallback:', error);
      try {
        const headers = ['Employee Name', 'Department', 'Position', 'Employee ID', 'Date Created'];
        const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const rows = filteredEmployees.map(employee => [
          employee.name,
          employee.department,
          employee.position,
          employee.employee_id,
          employee.date_created || ''
        ].map(escapeCsv).join(','));
        const csv = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        notifySuccess('Employees exported as CSV.');
      } catch (fallbackError) {
        console.error('Employee CSV export failed:', fallbackError);
        notifyError('Failed to export employees');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

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
        <div className="header-topline">
          {/* Added type="button" and handleBackClick wrapper */}
          <button
            type="button"
            className="back-btn employee-back-btn"
            onClick={handleBackClick}
          >
            ← Back
          </button>
          <span className="header-eyebrow">HR Portal</span>
        </div>

        <div className="header-content">
          <div className="header-info">
            <h1 className="management-title">Employee Management</h1>
            <p className="management-subtitle">Manage employee accounts and access</p>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div className="stat-content">
                <span className="stat-number">{employees.length}</span>
                <span className="stat-label">Total Employees</span>
              </div>
            </div>
            <button
              type="button"
              className="hr-records-export-btn export-btn"
              onClick={handleExportEmployees}
              disabled={isExporting || filteredEmployees.length === 0}
              title="Export employees"
              aria-label="Export employees"
            >
              <Download className="export-icon" aria-hidden="true" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
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
                type="button"
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
                      type="button"
                      className={`action-btn password-btn ${showPassword && selectedEmployee?.id === employee.id ? 'active' : ''}`}
                      onClick={() => {
                        if (showPassword && selectedEmployee?.id === employee.id) {
                          setShowPassword(false);
                        } else {
                          setSelectedEmployee(employee);
                          setShowPassword(true);
                        }
                      }}
                    >
                      {showPassword && selectedEmployee?.id === employee.id ? 'Hide Password' : 'Reset Password'}
                    </button>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteEmployee(employee)}
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
                  type="button"
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

        {/* Delete Confirmation Modal */}
        {employeeToDelete && (
          <div className="password-modal-overlay" onClick={closeDeleteConfirm}>
            <div className="password-modal-content delete-confirm-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Delete Employee</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <p className="delete-confirm-message">
                  Are you sure you want to delete <strong>{employeeToDelete.name}</strong>
                  {employeeToDelete.employee_id ? ` (${employeeToDelete.employee_id})` : ''}?
                </p>
                <p className="delete-confirm-warning">
                  This action cannot be undone. The employee will be permanently removed.
                </p>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="action-btn cancel-btn"
                    onClick={closeDeleteConfirm}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={confirmDeleteEmployee}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Employee'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}