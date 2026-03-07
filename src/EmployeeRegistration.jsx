import React, { useState, useEffect } from 'react';

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

  // Load existing employees from database on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.department || !form.position || !form.employee_Id || !form.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          department: form.department,
          position: form.position,
          employee_Id: form.employee_Id,
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
        
        alert("Employee registered successfully!");
      } else {
        alert(data.message || "Failed to register employee");
      }
    } catch (error) {
      console.error('Error registering employee:', error);
      alert(`Registration failed: ${error.message}\n\nPlease ensure:\n1. Backend server is running on port 5000\n2. Database is accessible\n3. Check browser console for more details`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="store-page">
      <div className="store-container">
        <div className="store-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1 className="store-title" style={{color: '#059669'}}>Employee Registration</h1>
        </div>
        
        <div style={{display: 'flex', gap: '40px'}}>
          {/* Registration Form */}
          <div style={{flex: 1, maxWidth: '500px'}}>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div className="field">
                <label className="field-label">Employee Name *</label>
                <input 
                  className="field-input" 
                  placeholder="Enter employee full name" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="field">
                <label className="field-label">Department *</label>
                <input 
                  className="field-input" 
                  placeholder="Enter department" 
                  value={form.department}
                  onChange={e => setForm({...form, department: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="field">
                <label className="field-label">Position *</label>
                <input 
                  className="field-input" 
                  placeholder="Enter job position" 
                  value={form.position}
                  onChange={e => setForm({...form, position: e.target.value})} 
                  required 
                />
              </div>

              <div className="field">
                <label className="field-label">Employee ID *</label>
                <input 
                  className="field-input" 
                  placeholder="Enter employee ID" 
                  value={form.employee_Id}
                  onChange={e => setForm({...form, employee_Id: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="field">
                <label className="field-label">Password *</label>
                <input 
                  type="password"
                  className="field-input" 
                  placeholder="Enter password" 
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                  minLength="6"
                />
              </div>
              
              <div className="field">
                <label className="field-label">Confirm Password *</label>
                <input 
                  type="password"
                  className="field-input" 
                  placeholder="Confirm password" 
                  value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})} 
                  required 
                  minLength="6"
                />
              </div>
              
              <button type="submit" className="add-request-btn" style={{background: '#059669', marginTop: '10px'}}>
                Register Employee
              </button>
            </form>
          </div>

          {/* Employee List */}
              <div style={{flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: '30px'}}>
            <h3 style={{marginBottom: '20px', color: '#374151'}}>Registered Employees</h3>
            {employees.length === 0 ? (
              <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No employees registered yet.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {employees.map(employee => (
                  <div key={employee.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <h4 style={{margin: '0 0 5px 0', color: '#111827'}}>{employee.name}</h4>
                        <p style={{margin: '0 0 5px 0', color: '#6b7280'}}>{employee.position} - {employee.department}</p>
                        <p style={{margin: '0', color: '#374151', fontWeight: 'bold'}}>ID: {employee.employeeId}</p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{margin: '0 0 5px 0', color: '#6b7280', fontSize: '12px'}}>Created: {employee.dateCreated}</p>
                        <span style={{
                          padding: '5px 10px',
                          backgroundColor: '#9ca3af',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          Password not available
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}