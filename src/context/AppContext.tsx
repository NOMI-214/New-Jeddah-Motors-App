import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Car, CarStatus, Customer, Transaction, Expense, Sale, Employee,
  AuditLog, Installment,
} from "../data/mockData";
import * as API from "../api";
import { logout as apiLogout, approveUser, rejectUser } from "../api";

type ThemeOverride = "light" | "dark" | "system";

interface AppContextValue {
  // Auth
  currentUser: Employee | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  // Theme
  themeOverride: ThemeOverride;
  setThemeOverride: (mode: ThemeOverride) => void;

  // Data
  cars: Car[];
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  sales: Sale[];
  employees: Employee[];
  auditLogs: AuditLog[];
  installments: Installment[];

  // Refresh
  refreshCars: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshSales: () => Promise<void>;
  refreshInstallments: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Actions
  addCar: (car: Partial<Car>) => Promise<string>;
  updateCarStatus: (carId: string, status: CarStatus) => Promise<void>;
  addCustomer: (customer: Partial<Customer>) => Promise<string>;
  addTransaction: (tx: Partial<Transaction>) => Promise<void>;
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  addSale: (sale: Partial<Sale> & { carIdNum: number; customerIdNum: number; salePriceNum: number; paymentType: string }) => Promise<string>;
  addEmployee: (employee: Partial<Employee> & { password: string }) => Promise<void>;
  toggleEmployeeStatus: (employeeId: string) => Promise<void>;
  approveEmployee: (employeeId: string) => Promise<void>;
  rejectEmployee: (employeeId: string) => Promise<void>;
  appendLog: (log: Omit<AuditLog, "id">) => void;
}

const AppContext = createContext<AppContextValue>(null as unknown as AppContextValue);

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmtRs(n: number): string {
  return `Rs ${Number(n).toLocaleString("en-PK")}`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

// ─── Adapters: API types → local mock-compatible types ───────────────────────

function apiCarToLocal(c: API.CarOut): Car {
  return {
    id: String(c.id),
    name: c.name,
    brand: c.brand,
    model: c.model,
    year: c.year,
    registrationNumber: c.registration_number,
    chassisNumber: c.chassis_number,
    engineNumber: c.engine_number,
    color: c.color,
    purchasePrice: fmtRs(c.purchase_price),
    purchasePriceNum: c.purchase_price,
    salePrice: fmtRs(c.sale_price),
    salePriceNum: c.sale_price,
    status: c.status as CarStatus,
  };
}

function apiCustomerToLocal(c: API.CustomerOut): Customer {
  return {
    id: String(c.id),
    name: c.name,
    phone: c.phone,
    cnic: c.cnic,
    email: c.email,
    address: c.address,
    carsPurchased: c.cars_purchased,
    outstandingAmount: fmtRs(c.outstanding_amount),
    outstandingAmountNum: c.outstanding_amount,
    joinDate: fmtDate(c.created_at),
  };
}

function apiTransactionToLocal(t: API.TransactionOut): Transaction {
  return {
    id: String(t.id),
    type: t.type as Transaction["type"],
    amount: fmtRs(t.amount),
    amountNum: t.amount,
    party: t.party || "—",
    category: t.category,
    date: fmtDate(t.date),
    notes: t.notes,
    createdBy: t.creator_name || "—",
  };
}

function apiExpenseToLocal(e: API.ExpenseOut): Expense {
  return {
    id: String(e.id),
    category: e.category,
    amount: fmtRs(e.amount),
    amountNum: e.amount,
    description: e.description,
    date: fmtDate(e.date),
    createdBy: e.creator_name || "—",
  };
}

function apiSaleToLocal(s: API.SaleOut): Sale {
  const profit = s.profit;
  return {
    id: String(s.id),
    carId: String(s.car_id),
    carName: s.car_name,
    customerId: String(s.customer_id),
    customerName: s.customer_name,
    salePrice: fmtRs(s.sale_price),
    salePriceNum: s.sale_price,
    purchasePrice: fmtRs(s.purchase_price),
    purchasePriceNum: s.purchase_price,
    profit: fmtRs(profit),
    profitNum: profit,
    date: fmtDate(s.date),
    salespersonId: String(s.salesperson_id),
    salespersonName: s.salesperson_name,
    paymentType: s.payment_type as Sale["paymentType"],
    status: s.status as Sale["status"],
    notes: s.notes,
  };
}

function apiEmployeeToLocal(u: API.UserOut): Employee {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role as Employee["role"],
    branch: u.branch,
    status: u.status as Employee["status"],
    joinDate: u.join_date || fmtDate(u.created_at),
    address: u.address,
    carsSold: u.cars_sold,
    revenueGenerated: fmtRs(u.revenue_generated),
    revenueGeneratedNum: u.revenue_generated,
    password: "", // not exposed by API
  };
}

function apiLogToLocal(l: API.AuditLogOut): AuditLog {
  return {
    id: String(l.id),
    userId: String(l.user_id),
    userName: l.user_name,
    action: l.action,
    module: l.module,
    description: l.description,
    timestamp: fmtDate(l.created_at),
    type: l.type as AuditLog["type"],
  };
}

function apiInstallmentToLocal(i: API.InstallmentOut): Installment {
  return {
    id: String(i.id),
    saleId: String(i.sale_id),
    customerId: String(i.customer_id),
    customerName: i.customer_name,
    carName: i.car_name,
    totalAmountNum: i.total_amount,
    totalAmount: fmtRs(i.total_amount),
    paidAmountNum: i.paid_amount,
    paidAmount: fmtRs(i.paid_amount),
    remainingAmountNum: i.remaining_amount,
    remainingAmount: fmtRs(i.remaining_amount),
    nextDueDate: i.next_due_date ? fmtDate(i.next_due_date) : "—",
    nextInstallmentAmountNum: i.next_installment_amount,
    nextInstallmentAmount: fmtRs(i.next_installment_amount),
    status: i.status as Installment["status"],
    payments: i.payments.map((p) => ({
      date: fmtDate(p.payment_date),
      amount: fmtRs(p.amount),
      amountNum: p.amount,
    })),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [themeOverride, setThemeOverride] = useState<ThemeOverride>("system");

  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);

  // ── Refresh helpers ──────────────────────────────────────────────────────────

  const refreshCars = useCallback(async () => {
    const data = await API.getCars();
    setCars(data.map(apiCarToLocal));
  }, []);

  const refreshCustomers = useCallback(async () => {
    const data = await API.getCustomers();
    setCustomers(data.map(apiCustomerToLocal));
  }, []);

  const refreshSales = useCallback(async () => {
    const data = await API.getSales();
    setSales(data.map(apiSaleToLocal));
  }, []);

  const refreshInstallments = useCallback(async () => {
    const data = await API.getInstallments();
    setInstallments(data.map(apiInstallmentToLocal));
  }, []);

  const refreshEmployees = useCallback(async () => {
    const data = await API.getUsers();
    setEmployees(data.map(apiEmployeeToLocal));
  }, []);

  const refreshAll = useCallback(async () => {
    const [carsData, customersData, txData, expData, salesData, usersData, logsData, instData] =
      await Promise.all([
        API.getCars(),
        API.getCustomers(),
        API.getTransactions(),
        API.getExpenses(),
        API.getSales(),
        API.getUsers(),
        API.getAuditLogs(),
        API.getInstallments(),
      ]);
    setCars(carsData.map(apiCarToLocal));
    setCustomers(customersData.map(apiCustomerToLocal));
    setTransactions(txData.map(apiTransactionToLocal));
    setExpenses(expData.map(apiExpenseToLocal));
    setSales(salesData.map(apiSaleToLocal));
    setEmployees(usersData.map(apiEmployeeToLocal));
    setLogs(logsData.map(apiLogToLocal));
    setInstallments(instData.map(apiInstallmentToLocal));
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await API.login(email, password);
      const emp = apiEmployeeToLocal(res.user);
      setCurrentUser(emp);
      // Load all data after login
      await refreshAll();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      return { ok: false, error: msg };
    }
  }, [refreshAll]);

  const logout = useCallback(() => {
    apiLogout();
    setCurrentUser(null);
    setCars([]); setCustomers([]); setTransactions([]);
    setExpenses([]); setSales([]); setEmployees([]);
    setLogs([]); setInstallments([]);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const addCar = useCallback(async (car: Partial<Car>): Promise<string> => {
    const created = await API.createCar({
      name: car.name ?? "",
      brand: car.brand ?? "",
      model: car.model ?? "",
      year: car.year ?? "",
      registration_number: (car as unknown as Record<string, string>).registrationNumber ?? "",
      chassis_number: (car as unknown as Record<string, string>).chassisNumber ?? "",
      engine_number: (car as unknown as Record<string, string>).engineNumber ?? "",
      color: car.color ?? "",
      purchase_price: (car as unknown as { purchasePriceNum?: number }).purchasePriceNum ?? 0,
      sale_price: (car as unknown as { salePriceNum?: number }).salePriceNum ?? 0,
      status: car.status ?? "available",
    });
    await refreshCars();
    return String(created.id);
  }, [refreshCars]);

  const updateCarStatus = useCallback(async (carId: string, status: CarStatus) => {
    await API.updateCarStatus(Number(carId), status);
    setCars((prev) => prev.map((c) => c.id === carId ? { ...c, status } : c));
  }, []);

  const addCustomer = useCallback(async (customer: Partial<Customer>): Promise<string> => {
    const created = await API.createCustomer({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      cnic: customer.cnic ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      branch: "Islamabad",
    });
    await refreshCustomers();
    return String(created.id);
  }, [refreshCustomers]);

  const addTransaction = useCallback(async (tx: Partial<Transaction>) => {
    await API.createTransaction({
      type: tx.type ?? "cashIn",
      amount: (tx as unknown as { amountNum?: number }).amountNum ?? 0,
      party: tx.party ?? "",
      category: tx.category ?? "",
      notes: tx.notes ?? "",
    });
    const data = await API.getTransactions();
    setTransactions(data.map(apiTransactionToLocal));
  }, []);

  const addExpense = useCallback(async (expense: Partial<Expense>) => {
    await API.createExpense({
      category: expense.category ?? "",
      amount: (expense as unknown as { amountNum?: number }).amountNum ?? 0,
      description: expense.description ?? "",
    });
    const data = await API.getExpenses();
    setExpenses(data.map(apiExpenseToLocal));
  }, []);

  const addSale = useCallback(async (
    sale: Partial<Sale> & { carIdNum: number; customerIdNum: number; salePriceNum: number; paymentType: string }
  ): Promise<string> => {
    const created = await API.createSale({
      car_id: sale.carIdNum,
      customer_id: sale.customerIdNum,
      sale_price: sale.salePriceNum,
      payment_type: sale.paymentType,
      notes: sale.notes ?? "",
    });
    await Promise.all([refreshCars(), refreshSales(), refreshCustomers()]);
    return String(created.id);
  }, [refreshCars, refreshSales, refreshCustomers]);

  const addEmployee = useCallback(async (employee: Partial<Employee> & { password: string }) => {
    await API.createUser({
      name: employee.name ?? "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      password: employee.password,
      role: employee.role ?? "salesperson",
      branch: employee.branch ?? "Islamabad",
      address: employee.address ?? "",
    });
    const data = await API.getUsers();
    setEmployees(data.map(apiEmployeeToLocal));
  }, []);

  const toggleEmployeeStatus = useCallback(async (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const newStatus = emp.status === "active" ? "inactive" : "active";
    await API.toggleUserStatus(Number(employeeId), newStatus);
    setEmployees((prev) =>
      prev.map((e) => e.id === employeeId ? { ...e, status: newStatus } : e)
    );
  }, [employees]);

  const approveEmployee = useCallback(async (employeeId: string) => {
    await approveUser(Number(employeeId));
    setEmployees((prev) =>
      prev.map((e) => e.id === employeeId ? { ...e, status: "active" as const } : e)
    );
  }, []);

  const rejectEmployee = useCallback(async (employeeId: string) => {
    await rejectUser(Number(employeeId));
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  }, []);

  const appendLog = useCallback((log: Omit<AuditLog, "id">) => {
    const id = `local-${Date.now()}`;
    setLogs((prev) => [{ ...log, id }, ...prev]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        themeOverride,
        setThemeOverride,
        cars,
        customers,
        transactions,
        expenses,
        sales,
        employees,
        auditLogs: logs,
        installments,
        refreshCars,
        refreshCustomers,
        refreshSales,
        refreshInstallments,
        refreshEmployees,
        refreshAll,
        addCar,
        updateCarStatus,
        addCustomer,
        addTransaction,
        addExpense,
        addSale,
        addEmployee,
        toggleEmployeeStatus,
        approveEmployee,
        rejectEmployee,
        appendLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
