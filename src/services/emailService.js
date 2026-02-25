// Mock email service for demonstration purposes
// In a real application, this would integrate with an actual email service like SendGrid, Nodemailer, etc.

export const emailService = {
  // Mock HR manager emails
  hrManagerEmails: [
    'hrmanager@company.com',
    'hrassistant@company.com'
  ],
  
  // Mock store manager emails  
  storeManagerEmails: [
    'storemanager@company.com',
    'inventory@company.com'
  ],

  // Mock employee email domains (in real app, this would come from user database)
  employeeEmailDomains: [
    '@company.com'
  ],

  // Send email notification when request is submitted
  sendRequestNotification: async (request) => {
    try {
      // In a real application, this would send actual emails
      console.log('📧 Sending request notification email...');
      console.log('To:', emailService.hrManagerEmails.join(', '));
      console.log('Subject: New Item Request Submitted');
      console.log('Body:', {
        employeeName: request.employeeName,
        itemName: request.itemName,
        quantity: request.quantity,
        purpose: request.purpose,
        timestamp: new Date().toLocaleString()
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response
      return {
        success: true,
        message: 'Request notification sent to HR managers'
      };
    } catch (error) {
      console.error('Failed to send request notification:', error);
      return {
        success: false,
        message: 'Failed to send notification'
      };
    }
  },

  // Send email notification when request is approved
  sendApprovalNotification: async (request) => {
    try {
      // In a real application, this would send actual emails
      console.log('📧 Sending approval notification email...');
      console.log('To:', emailService.storeManagerEmails.join(', '));
      console.log('Subject: Item Request Approved');
      console.log('Body:', {
        employeeName: request.employeeName,
        itemName: request.itemName,
        quantity: request.quantity,
        purpose: request.purpose,
        timestamp: new Date().toLocaleString()
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response
      return {
        success: true,
        message: 'Approval notification sent to store managers'
      };
    } catch (error) {
      console.error('Failed to send approval notification:', error);
      return {
        success: false,
        message: 'Failed to send notification'
      };
    }
  },

  // Send email notification to employee when request is approved
  sendEmployeeApprovalNotification: async (request) => {
    try {
      // Generate employee email (in real app, this would come from user database)
      const employeeEmail = emailService.generateEmployeeEmail(request.employeeName);
      
      // In a real application, this would send actual emails
      console.log('📧 Sending employee approval notification email...');
      console.log('To:', employeeEmail);
      console.log('Subject: Your Item Request Has Been Approved');
      console.log('Body:', {
        employeeName: request.employeeName,
        itemName: request.itemName,
        quantity: request.quantity,
        purpose: request.purpose,
        timestamp: new Date().toLocaleString()
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response
      return {
        success: true,
        message: 'Approval notification sent to employee'
      };
    } catch (error) {
      console.error('Failed to send employee approval notification:', error);
      return {
        success: false,
        message: 'Failed to send notification'
      };
    }
  },

  // Generate employee email address from name
  generateEmployeeEmail: (employeeName) => {
    // Simple email generation for demo purposes
    // In real app, this would come from user database
    const cleanName = employeeName.toLowerCase().replace(/\s+/g, '.');
    return `${cleanName}@company.com`;
  },

  // Utility function to format email content
  formatRequestEmail: (request, type) => {
    const subject = type === 'request' 
      ? 'New Item Request Submitted' 
      : 'Item Request Approved';
    
    const action = type === 'request' ? 'submitted' : 'approved';
    
    return {
      subject,
      body: `
Dear Manager,

A new item request has been ${action}:

Employee: ${request.employeeName}
Item: ${request.itemName}
Quantity: ${request.quantity}
Purpose: ${request.purpose}
Status: ${request.status || 'Pending'}
Timestamp: ${new Date().toLocaleString()}

Please review and take appropriate action.

Best regards,
Inventory Management System
      `.trim()
    };
  },

  // Format employee approval email
  formatEmployeeApprovalEmail: (request) => {
    return {
      subject: 'Your Item Request Has Been Approved',
      body: `
Dear ${request.employeeName},

Great news! Your item request has been approved:

Item: ${request.itemName}
Quantity: ${request.quantity}
Purpose: ${request.purpose}
Status: Approved
Timestamp: ${new Date().toLocaleString()}

Your items are now ready for pickup from the store. Please contact the store manager to arrange collection.

Thank you for using our inventory management system.

Best regards,
Inventory Management System
      `.trim()
    };
  }
};

// Export individual functions for easier import
export const sendRequestNotification = emailService.sendRequestNotification;
export const sendApprovalNotification = emailService.sendApprovalNotification;
export const sendEmployeeApprovalNotification = emailService.sendEmployeeApprovalNotification;
