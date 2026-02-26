// Mock database using in-memory storage
let employees = [
  {
    id: 1,
    name: "HR Manager",
    department: "HR",
    position: "Manager",
    employee_id: "HR100",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    date_created: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Store Manager",
    department: "Store",
    position: "Manager",
    employee_id: "STORE100",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    date_created: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let items = [];
let requests = [];

let currentId = {
  employee: 2,
  item: 0,
  request: 0
};

// Mock database operations
const mockDb = {
  // Employees
  getEmployees: () => {
    return employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      position: emp.position,
      employee_id: emp.employee_id,
      date_created: emp.date_created
    }));
  },

  getEmployeeById: (id) => {
    return employees.find(emp => emp.id === parseInt(id));
  },

  getEmployeeByEmployeeId: (employeeId) => {
    return employees.find(emp => emp.employee_id === employeeId);
  },

  createEmployee: async (employeeData) => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const newEmployee = {
      id: ++currentId.employee,
      name: employeeData.name,
      department: employeeData.department,
      position: employeeData.position,
      employee_id: employeeData.employeeId,
      password: hashedPassword,
      date_created: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    employees.push(newEmployee);
    return newEmployee;
  },

  updateEmployee: async (id, updateData) => {
    const bcrypt = require('bcryptjs');
    const index = employees.findIndex(emp => emp.id === parseInt(id));
    if (index === -1) return null;

    const employee = employees[index];
    
    // Check if employee ID is being changed and if it already exists
    if (updateData.employeeId && updateData.employeeId !== employee.employee_id) {
      const existing = employees.find(emp => emp.employee_id === updateData.employeeId && emp.id !== parseInt(id));
      if (existing) {
        throw new Error('Employee ID already exists');
      }
    }

    // Hash password if provided
    let hashedPassword = employee.password;
    if (updateData.password) {
      hashedPassword = await bcrypt.hash(updateData.password, 10);
    }

    const updatedEmployee = {
      ...employee,
      name: updateData.name || employee.name,
      department: updateData.department || employee.department,
      position: updateData.position || employee.position,
      employee_id: updateData.employeeId || employee.employee_id,
      password: hashedPassword,
      updated_at: new Date().toISOString()
    };

    employees[index] = updatedEmployee;
    return updatedEmployee;
  },

  deleteEmployee: (id) => {
    const index = employees.findIndex(emp => emp.id === parseInt(id));
    if (index === -1) return false;
    employees.splice(index, 1);
    return true;
  },

  searchEmployees: (query, department) => {
    let results = employees;

    if (query) {
      results = results.filter(emp => 
        emp.name.toLowerCase().includes(query.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (department) {
      results = results.filter(emp => emp.department.toLowerCase() === department.toLowerCase());
    }

    return results.map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      position: emp.position,
      employee_id: emp.employee_id,
      date_created: emp.date_created
    }));
  },

  // Items
  getItems: () => {
    return items;
  },

  getItemById: (id) => {
    return items.find(item => item.id === parseInt(id));
  },

  createItem: (itemData) => {
    const newItem = {
      id: ++currentId.item,
      ...itemData,
      date_added: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.push(newItem);
    return newItem;
  },

  updateItem: (id, updateData) => {
    const index = items.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    items[index] = updatedItem;
    return updatedItem;
  },

  deleteItem: (id) => {
    const index = items.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;
    items.splice(index, 1);
    return true;
  },

  // Requests
  getRequests: () => {
    return requests;
  },

  getRequestById: (id) => {
    return requests.find(req => req.id === parseInt(id));
  },

  createRequest: (requestData) => {
    const newRequest = {
      id: ++currentId.request,
      ...requestData,
      status: 'Pending',
      date_added: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    requests.push(newRequest);
    return newRequest;
  },

  updateRequestStatus: (id, status) => {
    const index = requests.findIndex(req => req.id === parseInt(id));
    if (index === -1) return null;

    const updatedRequest = {
      ...requests[index],
      status,
      updated_at: new Date().toISOString()
    };

    // Set appropriate date based on status
    if (status === 'Approved') {
      updatedRequest.date_approved = new Date().toISOString();
    } else if (status === 'Finished') {
      updatedRequest.date_finished = new Date().toISOString();
    }

    requests[index] = updatedRequest;
    return updatedRequest;
  },

  deleteRequest: (id) => {
    const index = requests.findIndex(req => req.id === parseInt(id));
    if (index === -1) return false;
    requests.splice(index, 1);
    return true;
  },

  getRequestsByStatus: (status) => {
    return requests.filter(req => req.status === status);
  }
};

module.exports = mockDb;