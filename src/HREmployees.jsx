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

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/employees');
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
      const response = await fetch(`http://localhost:5000/api/employees/${selectedEmployee.id}`, {
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
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
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

  return (
    <div className="status-page">
      <header className="status-header-row">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="status-main-title">Employee Management</h1>
        <div style={{ width: '80px' }}></div> {/* Spacer for symmetry */}
      </header>

      <div className="status-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>No employees found.</p>
        ) : (
          <div>
            <div className="hr-table-header">
              <div>Employee Name</div>
              <div>Department</div>
              <div>Position</div>
              <div>Employee ID</div>
              <div>Date Created</div>
              <div>Actions</div>
            </div>

            {employees.map((employee) => (
              <div className="hr-table-row" key={employee.id}>
                <div>{employee.name}</div>
                <div>{employee.department}</div>
                <div>{employee.position}</div>
                <div style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                  {employee.employee_id}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {employee.date_created ? new Date(employee.date_created).toLocaleDateString() : 'N/A'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowPassword(!showPassword && selectedEmployee?.id === employee.id);
                    }}
                    style={{ background: showPassword && selectedEmployee?.id === employee.id ? '#3b82f6' : '#64748b' }}
                  >
                    {showPassword && selectedEmployee?.id === employee.id ? 'Hide' : 'View/Reset Password'}
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Password Management Modal */}
        {selectedEmployee && showPassword && (
          <div className="password-modal">
            <div className="password-modal-content">
              <h3>Manage Password for {selectedEmployee.name}</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                Note: For security reasons, passwords are stored as hashed values and cannot be viewed in plain text.
              </p>
              
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '15px' }}>
                  <label className="field-label">New Password</label>
                  <input 
                    type="password"
                    className="field-input"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm({...resetPasswordForm, newPassword: e.target.value})}
                    placeholder="Enter new password (min 6 characters)"
                    minLength="6"
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label className="field-label">Confirm New Password</label>
                  <input 
                    type="password"
                    className="field-input"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({...resetPasswordForm, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    minLength="6"
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    className="action-btn"
                    onClick={() => setShowPassword(false)}
                    style={{ background: '#64748b' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="action-btn"
                    style={{ background: '#10b981' }}
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }
        
        .action-btn:hover {
          opacity: 0.8;
        }
        
        .delete-btn {
          background-color: #ef4444 !important;
        }
        
        .password-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .password-modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
        }
        
        .password-modal-content h3 {
          margin: 0 0 10px 0;
          color: #374151;
        }
      `}</style>
    </div>
  );
}