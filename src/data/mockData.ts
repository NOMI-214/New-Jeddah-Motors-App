// ─── Existing types ───────────────────────────────────────────────────────────

export const dashboardStats = {
  currentBalance: "Rs 4,82,500",
  cashInToday: "Rs 1,25,000",
  cashOutToday: "Rs 38,200",
  totalExpenses: "Rs 96,400",
  carsAvailable: "12",
  carsSold: "4",
  pendingPayments: "Rs 2,10,000",
};

export const recentActivity = [
  { id: "1", title: "Sale recorded", subtitle: "Toyota Corolla 2021 — Ahmed Khan", time: "12m ago", type: "sale" as const },
  { id: "2", title: "Cash in", subtitle: "Bank transfer — Bilal Motors", time: "45m ago", type: "cashIn" as const },
  { id: "3", title: "Expense added", subtitle: "Fuel — Rs 8,000", time: "2h ago", type: "cashOut" as const },
  { id: "4", title: "Car status updated", subtitle: "Honda Civic 2020 → Reserved", time: "3h ago", type: "update" as const },
];

export type CarStatus = "available" | "reserved" | "sold";

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  color: string;
  purchasePrice: string;
  purchasePriceNum: number;
  salePrice: string;
  salePriceNum: number;
  status: CarStatus;
}

export const cars: Car[] = [
  {
    id: "c1",
    name: "Toyota Corolla Altis",
    brand: "Toyota",
    model: "Corolla Altis",
    year: "2021",
    registrationNumber: "ISB-4521",
    chassisNumber: "JT2BF22K1W0123456",
    engineNumber: "2ZR-4456789",
    color: "Pearl White",
    purchasePrice: "Rs 38,50,000",
    purchasePriceNum: 3850000,
    salePrice: "Rs 42,00,000",
    salePriceNum: 4200000,
    status: "available",
  },
  {
    id: "c2",
    name: "Honda Civic Oriel",
    brand: "Honda",
    model: "Civic Oriel",
    year: "2020",
    registrationNumber: "PWR-1187",
    chassisNumber: "SHHFK7660LU234567",
    engineNumber: "R18Z2-998877",
    color: "Lunar Silver",
    purchasePrice: "Rs 41,20,000",
    purchasePriceNum: 4120000,
    salePrice: "Rs 44,80,000",
    salePriceNum: 4480000,
    status: "reserved",
  },
  {
    id: "c3",
    name: "Suzuki Swift GLX",
    brand: "Suzuki",
    model: "Swift GLX",
    year: "2022",
    registrationNumber: "ISB-7790",
    chassisNumber: "MA3FJEB1S00345678",
    engineNumber: "K12M-665544",
    color: "Champion Red",
    purchasePrice: "Rs 26,40,000",
    purchasePriceNum: 2640000,
    salePrice: "Rs 28,90,000",
    salePriceNum: 2890000,
    status: "available",
  },
  {
    id: "c4",
    name: "Toyota Hilux Revo",
    brand: "Toyota",
    model: "Hilux Revo",
    year: "2019",
    registrationNumber: "MDN-3302",
    chassisNumber: "MR0FZ22G900456789",
    engineNumber: "GD-112233",
    color: "Attitude Black",
    purchasePrice: "Rs 68,00,000",
    purchasePriceNum: 6800000,
    salePrice: "Rs 73,50,000",
    salePriceNum: 7350000,
    status: "sold",
  },
  {
    id: "c5",
    name: "Kia Sportage AWD",
    brand: "Kia",
    model: "Sportage AWD",
    year: "2023",
    registrationNumber: "ISB-9912",
    chassisNumber: "KNAPC81ADP0567890",
    engineNumber: "G4NA-334455",
    color: "Gravity Grey",
    purchasePrice: "Rs 84,00,000",
    purchasePriceNum: 8400000,
    salePrice: "Rs 89,90,000",
    salePriceNum: 8990000,
    status: "available",
  },
  {
    id: "c6",
    name: "Suzuki Alto VXL",
    brand: "Suzuki",
    model: "Alto VXL",
    year: "2023",
    registrationNumber: "ISB-2245",
    chassisNumber: "MA3EN3A15P0678901",
    engineNumber: "F8D-778899",
    color: "Silky Silver",
    purchasePrice: "Rs 18,50,000",
    purchasePriceNum: 1850000,
    salePrice: "Rs 20,20,000",
    salePriceNum: 2020000,
    status: "available",
  },
  {
    id: "c7",
    name: "Honda BR-V i-VTEC",
    brand: "Honda",
    model: "BR-V i-VTEC",
    year: "2022",
    registrationNumber: "ISB-5531",
    chassisNumber: "MRHRU5840NP789012",
    engineNumber: "L15B4-441122",
    color: "Meteoroid Grey",
    purchasePrice: "Rs 51,00,000",
    purchasePriceNum: 5100000,
    salePrice: "Rs 55,50,000",
    salePriceNum: 5550000,
    status: "available",
  },
  {
    id: "c8",
    name: "Toyota Fortuner Legender",
    brand: "Toyota",
    model: "Fortuner Legender",
    year: "2022",
    registrationNumber: "ISB-8874",
    chassisNumber: "MR0FR22G900890123",
    engineNumber: "2GD-556677",
    color: "Super White",
    purchasePrice: "Rs 1,25,00,000",
    purchasePriceNum: 12500000,
    salePrice: "Rs 1,32,00,000",
    salePriceNum: 13200000,
    status: "sold",
  },
];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  address: string;
  email: string;
  carsPurchased: number;
  outstandingAmount: string;
  outstandingAmountNum: number;
  joinDate: string;
}

export const customers: Customer[] = [
  {
    id: "u1",
    name: "Ahmed Khan",
    phone: "0301-2345678",
    cnic: "61101-1234567-1",
    address: "F-10, Islamabad",
    email: "ahmed.khan@gmail.com",
    carsPurchased: 2,
    outstandingAmount: "Rs 0",
    outstandingAmountNum: 0,
    joinDate: "Mar 2024",
  },
  {
    id: "u2",
    name: "Bilal Motors (Dealer)",
    phone: "0333-9876543",
    cnic: "37405-7654321-2",
    address: "Saddar, Peshawar",
    email: "bilalmotors@business.pk",
    carsPurchased: 5,
    outstandingAmount: "Rs 1,20,000",
    outstandingAmountNum: 120000,
    joinDate: "Jan 2023",
  },
  {
    id: "u3",
    name: "Sana Tariq",
    phone: "0345-1122334",
    cnic: "61101-9988776-3",
    address: "Bahria Town, Islamabad",
    email: "sana.tariq@hotmail.com",
    carsPurchased: 1,
    outstandingAmount: "Rs 90,000",
    outstandingAmountNum: 90000,
    joinDate: "Nov 2024",
  },
  {
    id: "u4",
    name: "Imran Yousaf",
    phone: "0312-5566778",
    cnic: "17301-4455667-4",
    address: "University Road, Mardan",
    email: "imran.yousaf@yahoo.com",
    carsPurchased: 1,
    outstandingAmount: "Rs 0",
    outstandingAmountNum: 0,
    joinDate: "Feb 2025",
  },
  {
    id: "u5",
    name: "Faisal Nawaz",
    phone: "0321-7788990",
    cnic: "61101-5544332-5",
    address: "G-11, Islamabad",
    email: "faisal.nawaz@gmail.com",
    carsPurchased: 3,
    outstandingAmount: "Rs 2,50,000",
    outstandingAmountNum: 250000,
    joinDate: "Aug 2023",
  },
];

export type TransactionType = "cashIn" | "cashOut";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  amountNum: number;
  party: string;
  category: string;
  date: string;
  notes: string;
  createdBy: string;
}

export const transactions: Transaction[] = [
  { id: "t1", type: "cashIn", amount: "Rs 1,25,000", amountNum: 125000, party: "Bilal Motors", category: "Bank Transfer", date: "Today", notes: "Partial payment for Hilux Revo", createdBy: "Nadia Khan" },
  { id: "t2", type: "cashOut", amount: "Rs 8,000", amountNum: 8000, party: "—", category: "Fuel", date: "Today", notes: "Showroom fleet refuel", createdBy: "Asad Iqbal" },
  { id: "t3", type: "cashOut", amount: "Rs 45,000", amountNum: 45000, party: "—", category: "Salary", date: "Yesterday", notes: "Sales staff salary advance", createdBy: "Nadia Khan" },
  { id: "t4", type: "cashIn", amount: "Rs 4,20,000", amountNum: 420000, party: "Ahmed Khan", category: "Cash", date: "Yesterday", notes: "Full payment — Corolla Altis", createdBy: "Nadia Khan" },
  { id: "t5", type: "cashOut", amount: "Rs 15,000", amountNum: 15000, party: "—", category: "Maintenance", date: "2 days ago", notes: "Showroom AC servicing", createdBy: "Asad Iqbal" },
  { id: "t6", type: "cashIn", amount: "Rs 73,50,000", amountNum: 7350000, party: "Faisal Nawaz", category: "Bank Transfer", date: "Last week", notes: "Full payment — Fortuner Legender", createdBy: "Nadia Khan" },
  { id: "t7", type: "cashOut", amount: "Rs 95,000", amountNum: 95000, party: "Property Owner", category: "Rent", date: "15 Jun", notes: "Monthly showroom rent", createdBy: "Nadia Khan" },
];

// ─── New types ────────────────────────────────────────────────────────────────

export type EmployeeRole = "owner" | "manager" | "accountant" | "salesperson" | "admin";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  branch: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  address: string;
  carsSold: number;
  revenueGenerated: string;
  revenueGeneratedNum: number;
  password: string; // demo only
}

export const employees: Employee[] = [
  {
    id: "e1",
    name: "Tariq Mehmood",
    email: "owner@showroom.pk",
    phone: "0300-1112222",
    role: "owner",
    branch: "Islamabad",
    status: "active",
    joinDate: "Jan 2020",
    address: "E-7, Islamabad",
    carsSold: 0,
    revenueGenerated: "Rs 2,40,00,000",
    revenueGeneratedNum: 24000000,
    password: "demo1234",
  },
  {
    id: "e2",
    name: "Asad Iqbal",
    email: "manager@showroom.pk",
    phone: "0311-3334444",
    role: "manager",
    branch: "Islamabad",
    status: "active",
    joinDate: "Mar 2021",
    address: "F-7, Islamabad",
    carsSold: 14,
    revenueGenerated: "Rs 84,50,000",
    revenueGeneratedNum: 8450000,
    password: "demo1234",
  },
  {
    id: "e3",
    name: "Nadia Khan",
    email: "accountant@showroom.pk",
    phone: "0322-5556666",
    role: "accountant",
    branch: "Islamabad",
    status: "active",
    joinDate: "Jun 2021",
    address: "G-9, Islamabad",
    carsSold: 0,
    revenueGenerated: "Rs 0",
    revenueGeneratedNum: 0,
    password: "demo1234",
  },
  {
    id: "e4",
    name: "Zubair Ahmed",
    email: "zubair@showroom.pk",
    phone: "0333-7778888",
    role: "salesperson",
    branch: "Islamabad",
    status: "active",
    joinDate: "Jan 2022",
    address: "I-8, Islamabad",
    carsSold: 8,
    revenueGenerated: "Rs 52,00,000",
    revenueGeneratedNum: 5200000,
    password: "demo1234",
  },
  {
    id: "e5",
    name: "Kamran Siddiqui",
    email: "kamran@showroom.pk",
    phone: "0345-9990001",
    role: "salesperson",
    branch: "Peshawar",
    status: "active",
    joinDate: "Apr 2022",
    address: "Hayatabad, Peshawar",
    carsSold: 6,
    revenueGenerated: "Rs 38,40,000",
    revenueGeneratedNum: 3840000,
    password: "demo1234",
  },
  {
    id: "e6",
    name: "Sarah Raza",
    email: "admin@showroom.pk",
    phone: "0301-2223334",
    role: "admin",
    branch: "Islamabad",
    status: "active",
    joinDate: "Sep 2022",
    address: "F-11, Islamabad",
    carsSold: 0,
    revenueGenerated: "Rs 0",
    revenueGeneratedNum: 0,
    password: "demo1234",
  },
  {
    id: "e7",
    name: "Usman Farooq",
    email: "usman@showroom.pk",
    phone: "0312-4445556",
    role: "salesperson",
    branch: "Mardan",
    status: "inactive",
    joinDate: "Feb 2023",
    address: "Mardan City",
    carsSold: 3,
    revenueGenerated: "Rs 19,20,000",
    revenueGeneratedNum: 1920000,
    password: "demo1234",
  },
];

export interface Sale {
  id: string;
  carId: string;
  carName: string;
  customerId: string;
  customerName: string;
  salePrice: string;
  salePriceNum: number;
  purchasePrice: string;
  purchasePriceNum: number;
  profit: string;
  profitNum: number;
  date: string;
  salespersonId: string;
  salespersonName: string;
  paymentType: "cash" | "bank_transfer" | "cheque" | "installment";
  status: "completed" | "pending";
  notes: string;
}

export const sales: Sale[] = [
  {
    id: "s1",
    carId: "c4",
    carName: "Toyota Hilux Revo",
    customerId: "u2",
    customerName: "Bilal Motors",
    salePrice: "Rs 73,50,000",
    salePriceNum: 7350000,
    purchasePrice: "Rs 68,00,000",
    purchasePriceNum: 6800000,
    profit: "Rs 5,50,000",
    profitNum: 550000,
    date: "10 Jun 2025",
    salespersonId: "e4",
    salespersonName: "Zubair Ahmed",
    paymentType: "installment",
    status: "pending",
    notes: "Partial payment received, installment plan agreed",
  },
  {
    id: "s2",
    carId: "c8",
    carName: "Toyota Fortuner Legender",
    customerId: "u5",
    customerName: "Faisal Nawaz",
    salePrice: "Rs 1,32,00,000",
    salePriceNum: 13200000,
    purchasePrice: "Rs 1,25,00,000",
    purchasePriceNum: 12500000,
    profit: "Rs 7,00,000",
    profitNum: 700000,
    date: "08 Jun 2025",
    salespersonId: "e2",
    salespersonName: "Asad Iqbal",
    paymentType: "bank_transfer",
    status: "completed",
    notes: "Full payment received via bank transfer",
  },
  {
    id: "s3",
    carId: "c1",
    carName: "Toyota Corolla Altis",
    customerId: "u1",
    customerName: "Ahmed Khan",
    salePrice: "Rs 42,00,000",
    salePriceNum: 4200000,
    purchasePrice: "Rs 38,50,000",
    purchasePriceNum: 3850000,
    profit: "Rs 3,50,000",
    profitNum: 350000,
    date: "02 Jun 2025",
    salespersonId: "e4",
    salespersonName: "Zubair Ahmed",
    paymentType: "cash",
    status: "completed",
    notes: "",
  },
];

export interface Expense {
  id: string;
  category: string;
  amount: string;
  amountNum: number;
  description: string;
  date: string;
  createdBy: string;
}

export const expenses: Expense[] = [
  { id: "x1", category: "Rent", amount: "Rs 95,000", amountNum: 95000, description: "Monthly showroom rent — June", date: "15 Jun 2025", createdBy: "Nadia Khan" },
  { id: "x2", category: "Electricity", amount: "Rs 12,400", amountNum: 12400, description: "IESCO bill — May", date: "12 Jun 2025", createdBy: "Nadia Khan" },
  { id: "x3", category: "Fuel", amount: "Rs 8,000", amountNum: 8000, description: "Showroom fleet refuel", date: "18 Jun 2025", createdBy: "Asad Iqbal" },
  { id: "x4", category: "Salary", amount: "Rs 45,000", amountNum: 45000, description: "Sales staff salary advance", date: "17 Jun 2025", createdBy: "Nadia Khan" },
  { id: "x5", category: "Maintenance", amount: "Rs 15,000", amountNum: 15000, description: "Showroom AC servicing", date: "16 Jun 2025", createdBy: "Asad Iqbal" },
  { id: "x6", category: "Marketing", amount: "Rs 25,000", amountNum: 25000, description: "Facebook & OLX ads — June", date: "10 Jun 2025", createdBy: "Asad Iqbal" },
  { id: "x7", category: "Office Supplies", amount: "Rs 4,500", amountNum: 4500, description: "Stationery and printer ink", date: "05 Jun 2025", createdBy: "Sarah Raza" },
];

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "auth" | "view";
}

export const auditLogs: AuditLog[] = [
  { id: "a1", userId: "e3", userName: "Nadia Khan", action: "created", module: "Transactions", description: "Cash in of Rs 1,25,000 from Bilal Motors recorded", timestamp: "Today, 11:32 AM", type: "create" },
  { id: "a2", userId: "e4", userName: "Zubair Ahmed", action: "created", module: "Sales", description: "Sale of Toyota Hilux Revo to Bilal Motors recorded", timestamp: "Today, 10:15 AM", type: "create" },
  { id: "a3", userId: "e2", userName: "Asad Iqbal", action: "updated", module: "Cars", description: "Honda Civic Oriel status changed to Reserved", timestamp: "Today, 09:48 AM", type: "update" },
  { id: "a4", userId: "e1", userName: "Tariq Mehmood", action: "logged in", module: "Auth", description: "Owner logged in from iPhone", timestamp: "Today, 09:00 AM", type: "auth" },
  { id: "a5", userId: "e3", userName: "Nadia Khan", action: "created", module: "Expenses", description: "Expense of Rs 8,000 added under Fuel", timestamp: "Today, 08:55 AM", type: "create" },
  { id: "a6", userId: "e2", userName: "Asad Iqbal", action: "created", module: "Cars", description: "New car added: Suzuki Alto VXL 2023", timestamp: "Yesterday, 04:30 PM", type: "create" },
  { id: "a7", userId: "e4", userName: "Zubair Ahmed", action: "created", module: "Customers", description: "New customer added: Faisal Nawaz", timestamp: "Yesterday, 02:10 PM", type: "create" },
  { id: "a8", userId: "e3", userName: "Nadia Khan", action: "created", module: "Transactions", description: "Cash out of Rs 45,000 under Salary recorded", timestamp: "Yesterday, 11:00 AM", type: "create" },
  { id: "a9", userId: "e2", userName: "Asad Iqbal", action: "updated", module: "Cars", description: "Sale price of Kia Sportage AWD updated", timestamp: "2 days ago, 03:20 PM", type: "update" },
  { id: "a10", userId: "e6", userName: "Sarah Raza", action: "created", module: "Users", description: "New employee Usman Farooq added", timestamp: "3 days ago, 10:05 AM", type: "create" },
];

export interface Installment {
  id: string;
  saleId: string;
  customerId: string;
  customerName: string;
  carName: string;
  totalAmountNum: number;
  totalAmount: string;
  paidAmountNum: number;
  paidAmount: string;
  remainingAmountNum: number;
  remainingAmount: string;
  nextDueDate: string;
  nextInstallmentAmountNum: number;
  nextInstallmentAmount: string;
  status: "current" | "overdue" | "completed";
  payments: { date: string; amount: string; amountNum: number }[];
}

export const installments: Installment[] = [
  {
    id: "i1",
    saleId: "s1",
    customerId: "u2",
    customerName: "Bilal Motors",
    carName: "Toyota Hilux Revo",
    totalAmountNum: 7350000,
    totalAmount: "Rs 73,50,000",
    paidAmountNum: 6230000,
    paidAmount: "Rs 62,30,000",
    remainingAmountNum: 1120000,
    remainingAmount: "Rs 11,20,000",
    nextDueDate: "25 Jun 2025",
    nextInstallmentAmountNum: 560000,
    nextInstallmentAmount: "Rs 5,60,000",
    status: "overdue",
    payments: [
      { date: "10 Jun 2025", amount: "Rs 25,00,000", amountNum: 2500000 },
      { date: "20 May 2025", amount: "Rs 25,00,000", amountNum: 2500000 },
      { date: "10 May 2025", amount: "Rs 12,30,000", amountNum: 1230000 },
    ],
  },
  {
    id: "i2",
    saleId: "s2",
    customerId: "u5",
    customerName: "Faisal Nawaz",
    carName: "Toyota Fortuner Legender",
    totalAmountNum: 13200000,
    totalAmount: "Rs 1,32,00,000",
    paidAmountNum: 7700000,
    paidAmount: "Rs 77,00,000",
    remainingAmountNum: 5500000,
    remainingAmount: "Rs 55,00,000",
    nextDueDate: "30 Jun 2025",
    nextInstallmentAmountNum: 1100000,
    nextInstallmentAmount: "Rs 11,00,000",
    status: "current",
    payments: [
      { date: "08 Jun 2025", amount: "Rs 73,50,000", amountNum: 7350000 },
      { date: "01 Jun 2025", amount: "Rs 3,50,000", amountNum: 350000 },
    ],
  },
  {
    id: "i3",
    saleId: "s3",
    customerId: "u3",
    customerName: "Sana Tariq",
    carName: "Honda Civic Oriel",
    totalAmountNum: 4480000,
    totalAmount: "Rs 44,80,000",
    paidAmountNum: 3880000,
    paidAmount: "Rs 38,80,000",
    remainingAmountNum: 600000,
    remainingAmount: "Rs 6,00,000",
    nextDueDate: "05 Jul 2025",
    nextInstallmentAmountNum: 300000,
    nextInstallmentAmount: "Rs 3,00,000",
    status: "current",
    payments: [
      { date: "02 Jun 2025", amount: "Rs 20,00,000", amountNum: 2000000 },
      { date: "15 May 2025", amount: "Rs 18,80,000", amountNum: 1880000 },
    ],
  },
];
