import React, { useState, useEffect } from 'react';
import './styles/employee-styles.css';
import { notifySuccess, notifyError, notifyWarning } from './utils/toastUtils';

export default function EmployeeRegistration({ onBack, onAddEmployee }) {
  const [form, setForm] = useState({
    name: "",
    department: "",
    position: "",
    employee_Id: "",
    password: "",
    confirmPassword: ""
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hover states for animated interactive feedback
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isPwdToggleHovered, setIsPwdToggleHovered] = useState(false);
  const [isConfirmPwdToggleHovered, setIsConfirmPwdToggleHovered] = useState(false);

  // Load existing employees from database on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        // Transform backend field names to frontend field names
        const transformedEmployees = (data.data || []).map(emp => ({
          id: emp.id,
          name: emp.name,
          department: emp.department,
          position: emp.position,
          employeeId: emp.employee_id,
          dateCreated: emp.date_created
        }));
        setEmployees(transformedEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.department || !form.position || !form.employee_Id || !form.password) {
      notifyWarning("Please fill in all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          department: form.department,
          position: form.position,
          employee_id: form.employee_Id,
          password: form.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (response.ok) {
        // Add to local state
        const newEmployee = {
          id: data.data.id,
          name: data.data.name,
          department: data.data.department,
          position: data.data.position,
          employeeId: data.data.employeeId,
          dateCreated: data.data.date_created
        };

        setEmployees([...employees, newEmployee]);
        onAddEmployee(newEmployee);
        
        // Reset form
        setForm({
          name: "",
          department: "",
          position: "",
          employee_Id: "",
          password: "",
          confirmPassword: ""
        });
        
        notifySuccess("Employee registered successfully!");
      } else {
        notifyError(data.message || "Failed to register employee");
      }
    } catch (error) {
      console.error('Error registering employee:', error);
      notifyError(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Button Inline Styles
  const backButtonStyle = {
    background: isBackHovered ? '#f3f4f6' : 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transform: isBackHovered ? 'translateX(-3px)' : 'none',
    transition: 'all 0.2s ease-in-out',
    boxShadow: isBackHovered ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
  };

  const submitButtonStyle = {
    backgroundColor: loading ? '#0369a1' : (isSubmitHovered ? '#0369a1' : '#0284c7'),
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    width: '100%',
    transition: 'all 0.2s ease-in-out',
    transform: isSubmitHovered && !loading ? 'translateY(-1px)' : 'none',
    boxShadow: isSubmitHovered && !loading ? '0 4px 12px rgba(2, 132, 199, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
  };

  const getToggleButtonStyle = (isHovered) => ({
    background: isHovered ? '#f3f4f6' : 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease-in-out',
    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  return (
    <div className="employee-registration-page">
      {/* Keyframe Spinner Animation */}
      <style>
        {`
          @keyframes registrationSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="employee-registration-container">
        {/* Header Section */}
        <div className="registration-header">
          <button 
            className="back-btn" 
            onClick={onBack} 
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={backButtonStyle}
          >
            ← Back
          </button>
          <div className="header-content">
            <h1 className="registration-title">Employee Registration</h1>
            <p className="registration-subtitle">Add new employees to the system</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="registration-layout">
          {/* Registration Form */}
          <div className="registration-form-card">
            <div className="form-header">
              <h2 className="form-title">New Employee Details</h2>
              <p className="form-description">Fill in all required fields to register a new employee</p>
            </div>
            
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-group">
                <label className="form-label">
                  Employee Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Enter employee full name" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                  <div className="input-icon">👤</div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Department <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input 
                      type="text"
                      className="form-input" 
                      placeholder="Enter department" 
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})} 
                      required 
                    />
                    <div className="input-icon">🏢</div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Position <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input 
                      type="text"
                      className="form-input" 
                      placeholder="Enter job position" 
                      value={form.position}
                      onChange={e => setForm({...form, position: e.target.value})} 
                      required 
                    />
                    <div className="input-icon">💼</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Employee ID <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input 
                    type="text"
                    className="form-input" 
                    placeholder="Enter employee ID" 
                    value={form.employee_Id}
                    onChange={e => setForm({...form, employee_Id: e.target.value})} 
                    required 
                  />
                  <div className="input-icon">🆔</div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="form-input password-input" 
                    placeholder="Enter password" 
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} 
                    required 
                    minLength="6"
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={() => setIsPwdToggleHovered(true)}
                    onMouseLeave={() => setIsPwdToggleHovered(false)}
                    style={getToggleButtonStyle(isPwdToggleHovered)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="password-hint">Minimum 6 characters</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="input-wrapper password-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input password-input" 
                    placeholder="Confirm password" 
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})} 
                    required 
                    minLength="6"
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseEnter={() => setIsConfirmPwdToggleHovered(true)}
                    onMouseLeave={() => setIsConfirmPwdToggleHovered(false)}
                    style={getToggleButtonStyle(isConfirmPwdToggleHovered)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                  <div className="password-error">Passwords do not match</div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
                onMouseEnter={() => setIsSubmitHovered(true)}
                onMouseLeave={() => setIsSubmitHovered(false)}
                style={submitButtonStyle}
              >
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'registrationSpin 1s linear infinite' }}>⏳</span>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    <span>Register Employee</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Employee List */}
          <div className="employee-list-card">
            <div className="list-header">
              <h2 className="list-title">Registered Employees</h2>
              <p className="list-subtitle">Current employees in the system</p>
            </div>
            
            <div className="employee-stats">
              <div className="stat-item">
                <span className="stat-number">{employees.length}</span>
                <span className="stat-label">Total Employees</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{employees.filter(e => e.department).length}</span>
                <span className="stat-label">Departments</span>
              </div>
            </div>

            <div className="employee-list">
              {employees.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3 className="empty-title">No Employees Yet</h3>
                  <p className="empty-description">Be the first to register an employee!</p>
                </div>
              ) : (
                <div className="employee-table-container">
                  <div className="employee-table-header">
                    <div className="table-header-cell">Name</div>
                    <div className="table-header-cell">Position</div>
                    <div className="table-header-cell">Department</div>
                    <div className="table-header-cell">Employee ID</div>
                    <div className="table-header-cell">Date Created</div>
                    <div className="table-header-cell">Status</div>
                  </div>
                  
                  {employees.map(employee => (
                    <div key={employee.id} className="employee-table-row">
                      <div className="table-cell">
                        <div className="employee-avatar">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-name">{employee.name}</div>
                      </div>
                      
                      <div className="table-cell position-cell">
                        {employee.position}
                      </div>
                      
                      <div className="table-cell department-cell">
                        {employee.department}
                      </div>
                      
                      <div className="table-cell id-cell">
                        <span className="employee-id">{employee.employeeId}</span>
                      </div>
                      
                      <div className="table-cell date-cell">
                        <span className="employee-date">
                          {new Date(employee.dateCreated).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="table-cell status-cell">
                        <span className="employee-status">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}