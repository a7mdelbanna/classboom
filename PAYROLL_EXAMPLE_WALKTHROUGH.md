# Payroll System Example Walkthrough

## Scenario: ClassBoom Music School - July 2025 Payroll

### Staff Members:

1. **Sarah Johnson** (Music Teacher)
   - Role: Teacher
   - Employment Type: Full-time
   - Compensation Model: Monthly Salary
   - Base Salary: $4,500/month
   - Department: Music

2. **Mike Chen** (Part-time Guitar Instructor)
   - Role: Teacher
   - Employment Type: Part-time
   - Compensation Model: Per Session
   - Session Rate: $75/session
   - Department: Music

3. **Emma Williams** (Admin Manager)
   - Role: Manager
   - Employment Type: Full-time
   - Compensation Model: Monthly Salary
   - Base Salary: $5,200/month
   - Department: Administration

4. **John Davis** (Hourly Support Staff)
   - Role: Support
   - Employment Type: Part-time
   - Compensation Model: Hourly
   - Hourly Rate: $25/hour
   - Department: Operations

## Step-by-Step Payroll Process

### Step 1: Generate Payroll (School Admin Action)

**Date**: July 31, 2025
**Period**: July 1-31, 2025

1. Admin clicks "Generate Payroll" button
2. Selects period dates (July 1-31)
3. System shows eligible staff:

```
✓ Sarah Johnson - Monthly: $4,500.00
✓ Mike Chen - Per Session: $75.00
✓ Emma Williams - Monthly: $5,200.00
✓ John Davis - Hourly: $25.00
```

4. Admin selects all staff and clicks "Generate Payroll"

### Step 2: System Calculations

The system calls `calculate_staff_payroll` RPC function for each staff member:

#### Sarah Johnson (Monthly Salary):
```javascript
{
  staff_id: "uuid-sarah",
  period_start: "2025-07-01",
  period_end: "2025-07-31",
  base_amount: 4500.00,
  hours_worked: null,
  sessions_taught: null,
  overtime_hours: 0,
  overtime_amount: 0,
  bonuses: [],
  deductions: [],
  gross_amount: 4500.00,
  net_amount: 4500.00,
  currency: "USD"
}
```

#### Mike Chen (Per Session):
Assuming Mike taught 18 sessions in July:
```javascript
{
  staff_id: "uuid-mike",
  period_start: "2025-07-01",
  period_end: "2025-07-31",
  base_amount: 1350.00,  // 18 sessions × $75
  hours_worked: null,
  sessions_taught: 18,
  overtime_hours: 0,
  overtime_amount: 0,
  bonuses: [],
  deductions: [],
  gross_amount: 1350.00,
  net_amount: 1350.00,
  currency: "USD"
}
```

#### Emma Williams (Monthly + Bonus):
Emma gets a performance bonus this month:
```javascript
{
  staff_id: "uuid-emma",
  period_start: "2025-07-01",
  period_end: "2025-07-31",
  base_amount: 5200.00,
  hours_worked: null,
  sessions_taught: null,
  overtime_hours: 0,
  overtime_amount: 0,
  bonuses: [
    {
      type: "performance_bonus",
      amount: 500.00,
      description: "Q2 Performance Bonus"
    }
  ],
  deductions: [],
  gross_amount: 5700.00,  // 5200 + 500
  net_amount: 5700.00,
  currency: "USD"
}
```

#### John Davis (Hourly + Overtime):
John worked 92 regular hours + 8 overtime hours:
```javascript
{
  staff_id: "uuid-john",
  period_start: "2025-07-01",
  period_end: "2025-07-31",
  base_amount: 2300.00,  // 92 hours × $25
  hours_worked: 92,
  sessions_taught: null,
  overtime_hours: 8,
  overtime_amount: 300.00,  // 8 hours × $37.50 (1.5x rate)
  bonuses: [],
  deductions: [],
  gross_amount: 2600.00,  // 2300 + 300
  net_amount: 2600.00,
  currency: "USD"
}
```

### Step 3: Payroll Records Created

The system creates payroll records with status "pending":

```
Total Payroll for July 2025: $14,150.00
- Pending Approval: 4 records
- Total Staff: 4
```

### Step 4: Review & Approval Process

**Date**: August 1, 2025

1. Finance Manager reviews each payroll record
2. Clicks on each card to view details
3. Verifies:
   - Hours/sessions are correct
   - Bonuses are approved
   - No errors in calculations
4. Clicks "Approve" on each record

Status changes: `pending` → `approved`

### Step 5: Payment Processing

**Date**: August 5, 2025

1. Finance team processes payments through bank
2. For each approved payroll:
   - Clicks "Mark as Paid"
   - System records:
     - Payment date
     - Payment method (e.g., "bank_transfer")
     - Payment reference (e.g., "BTX-2025-08-001")
     - Paid by (current user)

Status changes: `approved` → `paid`

### Step 6: Payroll Dashboard View

After processing, the dashboard shows:

```
Payroll Statistics - July 2025
┌─────────────────┬────────────┐
│ Total Payroll   │ $14,150.00 │
│ Pending         │ 0          │
│ Approved        │ 0          │
│ Paid            │ 4          │
└─────────────────┴────────────┘
```

## Database Schema in Action

### 1. **Payroll Table Record Example**:
```sql
{
  id: "pay-001",
  school_id: "school-123",
  staff_id: "uuid-sarah",
  period_start: "2025-07-01",
  period_end: "2025-07-31",
  base_amount: 4500.00,
  hours_worked: null,
  sessions_taught: null,
  overtime_hours: 0,
  overtime_amount: 0.00,
  bonuses: null,
  deductions: null,
  gross_amount: 4500.00,
  net_amount: 4500.00,
  currency: "USD",
  payment_status: "paid",
  payment_date: "2025-08-05",
  payment_method: "bank_transfer",
  payment_reference: "BTX-2025-08-001",
  notes: null,
  submitted_at: "2025-07-31T18:00:00Z",
  submitted_by: "admin-user-id",
  approved_at: "2025-08-01T10:30:00Z",
  approved_by: "manager-user-id",
  paid_at: "2025-08-05T14:00:00Z",
  paid_by: "finance-user-id",
  created_at: "2025-07-31T18:00:00Z",
  updated_at: "2025-08-05T14:00:00Z"
}
```

## Advanced Features

### 1. **Filtering & Search**
- Filter by staff member
- Filter by payment status
- Filter by date range
- Search by name or staff code

### 2. **Bulk Operations**
- Generate payroll for all eligible staff at once
- Approve multiple records
- Export payroll data (coming soon)

### 3. **Audit Trail**
Every action is tracked:
- Who generated the payroll
- Who approved it
- Who marked it as paid
- Timestamps for each action

### 4. **Permissions & Security**
- Only admins/managers can generate payroll
- Approval requires manager role
- Payment marking requires finance permission
- Staff can only see their own payroll (in staff portal)

## Real-World Considerations

### 1. **Tax Deductions** (Future Enhancement)
```javascript
deductions: [
  { type: "federal_tax", amount: 450.00 },
  { type: "state_tax", amount: 225.00 },
  { type: "social_security", amount: 279.00 },
  { type: "medicare", amount: 65.25 }
]
```

### 2. **Benefits Deductions**
```javascript
deductions: [
  { type: "health_insurance", amount: 200.00 },
  { type: "401k", amount: 225.00 }
]
```

### 3. **Multiple Currencies**
The system supports different currencies per staff member:
- USD for US-based staff
- EUR for European branches
- GBP for UK operations

### 4. **Integration Points** (Future)
- Export to accounting software (QuickBooks, Xero)
- Direct deposit integration
- Payslip generation and email
- Tax form generation (W-2, 1099)

## Error Handling

### Common Scenarios:
1. **Duplicate Payroll**: System prevents creating payroll for same period
2. **Missing Hours**: For hourly staff, system requires hours input
3. **Approval Required**: Can't mark as paid without approval
4. **Permission Denied**: Role-based access control

### Recovery Options:
- Delete pending payroll and regenerate
- Edit hours/sessions before approval
- Add notes for special circumstances
- Void and recreate if needed