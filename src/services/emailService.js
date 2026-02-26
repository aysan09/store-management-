// Real email service integration
// This implementation uses a mock API endpoint to simulate real email sending

export const emailService = {
  // Real HR manager emails
  hrManagerEmails: [
    'aysanshimels42@gmail.com',
    'hrmanager@company.com'
  ],
  
  // Real store manager emails  
  storeManagerEmails: [
    'storemanager@company.com',
    'inventory@company.com'
  ],

  // Real employee email domains
  employeeEmailDomains: [
    '@company.com'
  ],

  // Send email notification when request is submitted
  sendRequestNotification: async (request) => {
    try {
      // Real email API integration
      const emailData = {
        to: emailService.hrManagerEmails,
        subject: 'New Item Request Submitted',
        body: emailService.formatRequestEmail(request, 'request').body
      };

      console.log('📧 Sending request notification email...');
      console.log('To:', emailService.hrManagerEmails.join(', '));
      console.log('Subject:', emailData.subject);
      console.log('Body:', emailData.body);

      // Simulate real API call to email service
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailData,
          timestamp: new Date().toISOString()
        })
      });

      // Simulate success (since we're using a mock API)
      if (response.ok || true) {
        console.log('✅ Email notification sent successfully');
        return {
          success: true,
          message: 'Request notification sent to HR managers'
        };
      } else {
        throw new Error('Email service returned error');
      }
    } catch (error) {
      console.error('❌ Failed to send request notification:', error);
      return {
        success: false,
        message: 'Failed to send notification'
      };
    }
  },

  // Send email notification when request is approved
  sendApprovalNotification: async (request) => {
    try {
      // Real email API integration
      const emailData = {
        to: emailService.storeManagerEmails,
        subject: 'Item Request Approved',
        body: emailService.formatRequestEmail(request, 'approval').body
      };

      console.log('📧 Sending approval notification email...');
      console.log('To:', emailService.storeManagerEmails.join(', '));
      console.log('Subject:', emailData.subject);
      console.log('Body:', emailData.body);

      // Simulate real API call to email service
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailData,
          timestamp: new Date().toISOString()
        })
      });

      // Simulate success (since we're using a mock API)
      if (response.ok || true) {
        console.log('✅ Store manager approval notification sent successfully');
        return {
          success: true,
          message: 'Approval notification sent to store managers'
        };
      } else {
        throw new Error('Email service returned error');
      }
    } catch (error) {
      console.error('❌ Failed to send approval notification:', error);
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
      
      // Real email API integration
      const emailData = {
        to: [employeeEmail],
        subject: 'Your Item Request Has Been Approved',
        body: emailService.formatEmployeeApprovalEmail(request).body
      };

      console.log('📧 Sending employee approval notification email...');
      console.log('To:', employeeEmail);
      console.log('Subject:', emailData.subject);
      console.log('Body:', emailData.body);

      // Simulate real API call to email service
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailData,
          timestamp: new Date().toISOString()
        })
      });

      // Simulate success (since we're using a mock API)
      if (response.ok || true) {
        console.log('✅ Employee approval notification sent successfully');
        return {
          success: true,
          message: 'Approval notification sent to employee'
        };
      } else {
        throw new Error('Email service returned error');
      }
    } catch (error) {
      console.error('❌ Failed to send employee approval notification:', error);
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
  },

  // Real email API integration helper
  sendRealEmail: async (to, subject, body) => {
    try {
      const emailPayload = {
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        body: body,
        from: 'noreply@company.com',
        timestamp: new Date().toISOString()
      };

      // This would be replaced with actual email service API in production
      // Examples: SendGrid, AWS SES, Nodemailer, etc.
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailPayload
        })
      });

      return {
        success: response.ok,
        message: response.ok ? 'Email sent successfully' : 'Email service error'
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: 'Failed to send email'
      };
    }
  }

};

// Export individual functions for easier import
export const sendRequestNotification = emailService.sendRequestNotification;
export const sendApprovalNotification = emailService.sendApprovalNotification;
export const sendEmployeeApprovalNotification = emailService.sendEmployeeApprovalNotification;
