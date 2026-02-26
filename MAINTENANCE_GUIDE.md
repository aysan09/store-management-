# Inventory Management System - Maintenance Guide

This guide provides a comprehensive breakdown of each module in the application for maintenance and development purposes.

## 📁 Project Structure

```
src/
├── components/          # Reusable components
├── services/            # External services and utilities
├── styles.css          # Global styles
├── main.jsx            # Application entry point
├── App.jsx             # Main application component
├── Login.jsx           # Authentication component
├── HeroPage.jsx        # Landing page
├── StorePage.jsx       # Employee store view
├── StoreManagerPage.jsx # Store manager dashboard
├── AddItemPage.jsx     # Add new inventory items
├── RequestForm.jsx     # Employee request form
├── RequestStatus.jsx   # Request status tracking
├── HRReview.jsx        # HR approval interface
├── HRRecords.jsx       # HR historical records
├── approvedrequests.jsx # Approved requests view
├── FinishedRequests.jsx # Completed requests view
└── AddItemModal.jsx    # Modal for adding items
```

## 🔧 Module Breakdown

### 1. **Core Application Module** (`src/App.jsx`)

**Purpose**: Main application orchestrator and state management

**Key Responsibilities**:

- Global state management (inventory, requests, user)
- Route handling and navigation
- User authentication flow
- Component routing and rendering

**State Management**:

```javascript
// Inventory items with date tracking
const [inventory, setInventory] = useState([...])

// Request lifecycle tracking
const [requests, setRequests] = useState([])

// User authentication state
const [user, setUser] = useState(null)
const [view, setView] = useState('hero')
```

**Key Functions**:

- `handleLoginSuccess()` - User authentication and role-based routing
- `markRequestFinished()` - Request completion workflow
- View rendering logic for all application states

**Maintenance Notes**:

- Add new routes here
- Modify global state structure here
- Update authentication logic here

---

### 2. **Authentication Module** (`src/Login.jsx`)

**Purpose**: User login and authentication interface

**Key Features**:

- Role-based authentication (HR, Store Manager, Employee)
- Mock user database
- Login validation and error handling

**User Roles**:

- `HR100` - HR Manager access
- `STORE100` - Store Manager access
- Any other ID - Employee access

**Maintenance Notes**:

- Add new user roles here
- Modify authentication logic here
- Update mock user database here

---

### 3. **Store Management Module** (`src/StorePage.jsx`)

**Purpose**: Employee-facing store interface

**Key Features**:

- Product catalog display
- Request submission interface
- Inventory status visibility

**Components**:

- Product cards with images and details
- Request form integration
- Status navigation

**Maintenance Notes**:

- Modify product display layout here
- Update request form integration here
- Change store interface styling here

---

### 4. **Store Manager Module** (`src/StoreManagerPage.jsx`)

**Purpose**: Store manager dashboard for inventory and request management

**Key Features**:

- Inventory management with quantity editing
- Approved requests tracking
- Item addition and deletion
- Finished requests navigation

**Functionality**:

- Real-time quantity updates
- Item deletion with confirmation
- Navigation to different views

**Maintenance Notes**:

- Modify inventory editing logic here
- Update approved requests display here
- Add new store manager features here

---

### 5. **Inventory Management Module** (`src/AddItemPage.jsx` + `src/AddItemModal.jsx`)

**Purpose**: Adding and managing inventory items

**Key Features**:

- Form-based item addition
- Image upload and preview
- Category and brand management
- Integration with inventory state

**Components**:

- `AddItemModal` - Modal dialog for adding items
- `AddItemPage` - Full-page item management

**Maintenance Notes**:

- Modify form fields here
- Update validation logic here
- Change image handling here

---

### 6. **Request Management Module** (`src/RequestForm.jsx` + `src/RequestStatus.jsx`)

**Purpose**: Employee request submission and tracking

**Key Features**:

- Dynamic item selection
- Quantity and purpose input
- Real-time preview
- Status tracking

**Request Lifecycle**:

1. **Pending** - Request submitted
2. **Approved** - HR approval
3. **Finished** - Distribution completed

**Maintenance Notes**:

- Modify request form fields here
- Update validation rules here
- Change request workflow here

---

### 7. **HR Management Module** (`src/HRReview.jsx` + `src/HRRecords.jsx`)

**Purpose**: HR interface for request approval and record keeping

**Key Features**:

- Pending request review
- Approval/rejection workflow
- Historical records access
- Email notification integration

**HR Actions**:

- Approve requests (triggers notifications)
- Reject requests
- View historical records

**Maintenance Notes**:

- Modify approval workflow here
- Update notification triggers here
- Change record filtering here

---

### 8. **Request Tracking Module** (`src/approvedrequests.jsx` + `src/FinishedRequests.jsx`)

**Purpose**: Tracking request progress through completion

**Key Features**:

- Approved requests display
- Finished requests archive
- Complete date tracking
- Request completion workflow

**Date Tracking**:

- `dateAdded` - When request was submitted
- `dateApproved` - When HR approved
- `dateFinished` - When distribution completed

**Maintenance Notes**:

- Modify date tracking logic here
- Update completion workflow here
- Change tracking fields here

---

### 9. **Email Service Module** (`src/services/emailService.js`)

**Purpose**: Email notification system for request lifecycle

**Key Features**:

- Mock email service for demonstration
- Role-based recipient targeting
- Request lifecycle notifications
- Error handling and logging

**Notification Types**:

- Request submission → HR managers
- Request approval → Store managers + Employee
- Request completion → (Future enhancement)

**Email Recipients**:

- HR Managers: hrmanager@company.com, hrassistant@company.com
- Store Managers: storemanager@company.com, inventory@company.com
- Employees: Generated from employee names

**Maintenance Notes**:

- Replace mock service with real email provider
- Update recipient lists here
- Modify email templates here
- Add new notification types here

---

### 10. **Testing Module** (`src/components/EmailTest.jsx`)

**Purpose**: Testing interface for email functionality

**Key Features**:

- Manual email testing
- Test result display
- Console logging verification
- Error simulation

**Maintenance Notes**:

- Add new test cases here
- Update test scenarios here
- Modify test interface here

---

### 11. **Styling Module** (`src/styles.css`)

**Purpose**: Global styling and component themes

**Key Features**:

- Component-specific styles
- Responsive design
- Color themes and typography
- Layout and spacing

**Maintenance Notes**:

- Update global styles here
- Modify component themes here
- Add responsive breakpoints here
- Change color schemes here

---

## 🔗 Module Dependencies

### Core Dependencies:

- `App.jsx` → All components (orchestrates the application)
- `Login.jsx` → `App.jsx` (authentication flow)
- `StorePage.jsx` → `RequestForm.jsx`, `RequestStatus.jsx`

### State Dependencies:

- `StoreManagerPage.jsx` → `App.jsx` (inventory state)
- `HRReview.jsx` → `App.jsx` (requests state)
- `RequestForm.jsx` → `App.jsx` (request creation)

### Service Dependencies:

- `HRReview.jsx` → `emailService.js` (notifications)
- `RequestForm.jsx` → `emailService.js` (notifications)

## 🛠️ Maintenance Procedures

### Adding New Features:

1. **Identify the module** that needs modification
2. **Update the component** with new functionality
3. **Modify state management** if needed (in `App.jsx`)
4. **Update routing** if new views are added
5. **Test the integration** thoroughly

### Bug Fixes:

1. **Identify the affected module**
2. **Reproduce the issue**
3. **Fix the component logic**
4. **Test the fix** in isolation
5. **Verify integration** with other modules

### Performance Optimization:

1. **Identify bottlenecks** in component rendering
2. **Optimize state updates** to prevent unnecessary re-renders
3. **Review data fetching** and caching strategies
4. **Update rendering logic** for better performance

### Security Updates:

1. **Review authentication logic** in `Login.jsx`
2. **Validate input handling** in forms
3. **Check state management** for data integrity
4. **Update email service** for security best practices

## 📋 Module Contact Points

### State Management Changes:

- **Primary**: `src/App.jsx`
- **Secondary**: Component-specific state files

### UI/UX Changes:

- **Primary**: Individual component files
- **Secondary**: `src/styles.css`

### Business Logic Changes:

- **Primary**: Component logic files
- **Secondary**: `src/services/` for external integrations

### Data Structure Changes:

- **Primary**: `src/App.jsx` (state definitions)
- **Secondary**: Component prop interfaces

This modular structure ensures that each component has a clear responsibility and can be maintained independently while maintaining the overall application integrity.
