import { api, setToken } from "./client";

// ─── Types mirroring backend schemas ─────────────────────────────────────────

export interface UserOut {
  id: number; name: string; email: string; phone: string;
  role: string; branch: string; status: string; address: string;
  join_date: string; cars_sold: number; revenue_generated: number;
  created_at: string;
}

export interface CarOut {
  id: number; name: string; brand: string; model: string; year: string;
  registration_number: string; chassis_number: string; engine_number: string;
  color: string; purchase_price: number; sale_price: number;
  status: string; branch: string; created_at: string;
}

export interface CustomerOut {
  id: number; name: string; phone: string; cnic: string; email: string;
  address: string; branch: string; created_at: string;
  cars_purchased: number; outstanding_amount: number;
}

export interface TransactionOut {
  id: number; type: string; amount: number; party: string;
  category: string; notes: string; date: string;
  customer_id: number | null; car_id: number | null;
  created_by: number | null; branch: string; creator_name: string;
}

export interface ExpenseOut {
  id: number; category: string; amount: number; description: string;
  date: string; created_by: number | null; branch: string; creator_name: string;
}

export interface SaleOut {
  id: number; car_id: number | null; customer_id: number | null;
  sale_price: number; purchase_price: number; profit: number;
  payment_type: string; status: string; notes: string;
  salesperson_id: number | null; date: string; branch: string;
  car_name: string; customer_name: string; salesperson_name: string;
}

export interface InstallmentPaymentOut {
  id: number; amount: number; payment_date: string;
}

export interface InstallmentOut {
  id: number; sale_id: number | null; customer_id: number | null;
  total_amount: number; paid_amount: number; remaining_amount: number;
  next_due_date: string | null; next_installment_amount: number;
  status: string; created_at: string;
  customer_name: string; car_name: string;
  payments: InstallmentPaymentOut[];
}

export interface AuditLogOut {
  id: number; user_id: number | null; action: string; module: string;
  description: string; type: string; created_at: string; user_name: string;
}

export interface DashboardStats {
  total_cars: number; available_cars: number; reserved_cars: number; sold_cars: number;
  total_customers: number; total_sales: number; total_revenue: number; total_profit: number;
  total_expenses: number; cash_in: number; cash_out: number;
  pending_installments: number; outstanding_amount: number; net_balance: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await api.post<{ access_token: string; token_type: string; user: UserOut }>(
    "/auth/login", { email, password }
  );
  setToken(res.access_token);
  return res;
}

export async function register(body: {
  name: string; email: string; phone: string; password: string;
  role: string; branch: string; address?: string;
}) {
  return api.post<UserOut>("/auth/register", body);
}

export function logout() {
  setToken(null);
}

export const getMe = () => api.get<UserOut>("/auth/me");

export const changePassword = (current_password: string, new_password: string, confirm_password: string) =>
  api.put<{ message: string }>("/auth/change-password", { current_password, new_password, confirm_password });

export const resetUserPassword = (userId: number, new_password: string) =>
  api.patch<{ message: string }>(`/auth/users/${userId}/reset-password`, { new_password });

// ─── Cars ────────────────────────────────────────────────────────────────────

export const getCars = (params?: { status?: string; q?: string; branch?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<CarOut[]>(`/cars${q ? "?" + q : ""}`);
};

export const getCar = (id: number) => api.get<CarOut>(`/cars/${id}`);

export const createCar = (body: Partial<CarOut>) => api.post<CarOut>("/cars", body);

export const updateCar = (id: number, body: Partial<CarOut>) => api.put<CarOut>(`/cars/${id}`, body);

export const updateCarStatus = (id: number, status: string) =>
  api.patch<CarOut>(`/cars/${id}/status`, { status });

export const deleteCar = (id: number) => api.delete(`/cars/${id}`);

// ─── Customers ───────────────────────────────────────────────────────────────

export const getCustomers = (params?: { q?: string; branch?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<CustomerOut[]>(`/customers${q ? "?" + q : ""}`);
};

export const getCustomer = (id: number) => api.get<CustomerOut>(`/customers/${id}`);

export const createCustomer = (body: Omit<CustomerOut, "id" | "created_at" | "cars_purchased" | "outstanding_amount">) =>
  api.post<CustomerOut>("/customers", body);

export const updateCustomer = (id: number, body: Partial<CustomerOut>) =>
  api.put<CustomerOut>(`/customers/${id}`, body);

export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`);

// ─── Transactions ────────────────────────────────────────────────────────────

export const getTransactions = (params?: { type?: string; branch?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<TransactionOut[]>(`/transactions${q ? "?" + q : ""}`);
};

export const createTransaction = (body: {
  type: string; amount: number; party?: string;
  category?: string; notes?: string; customer_id?: number; car_id?: number; branch?: string;
}) => api.post<TransactionOut>("/transactions", body);

// ─── Expenses ────────────────────────────────────────────────────────────────

export const getExpenses = (params?: { category?: string; branch?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<ExpenseOut[]>(`/expenses${q ? "?" + q : ""}`);
};

export const createExpense = (body: { category: string; amount: number; description?: string; branch?: string }) =>
  api.post<ExpenseOut>("/expenses", body);

export const deleteExpense = (id: number) => api.delete(`/expenses/${id}`);

// ─── Sales ───────────────────────────────────────────────────────────────────

export const getSales = (params?: { status?: string; branch?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<SaleOut[]>(`/sales${q ? "?" + q : ""}`);
};

export const getSale = (id: number) => api.get<SaleOut>(`/sales/${id}`);

export const createSale = (body: {
  car_id: number; customer_id: number; sale_price: number;
  payment_type?: string; notes?: string; branch?: string;
  installment_data?: Record<string, unknown>;
}) => api.post<SaleOut>("/sales", body);

// ─── Installments ────────────────────────────────────────────────────────────

export const getInstallments = () => api.get<InstallmentOut[]>("/installments");

export const getInstallment = (id: number) => api.get<InstallmentOut>(`/installments/${id}`);

export const recordPayment = (
  installmentId: number,
  body: { amount: number; payment_date?: string; next_due_date?: string; next_installment_amount?: number }
) => api.post<InstallmentPaymentOut>(`/installments/${installmentId}/payments`, body);

// ─── Users ───────────────────────────────────────────────────────────────────

export const getUsers = (params?: { role?: string; status?: string; branch?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<UserOut[]>(`/users${q ? "?" + q : ""}`);
};

export const getUser = (id: number) => api.get<UserOut>(`/users/${id}`);

export const createUser = (body: {
  name: string; email: string; phone?: string; password: string;
  role: string; branch?: string; address?: string;
}) => api.post<UserOut>("/users", body);

export const updateUser = (id: number, body: Partial<UserOut>) => api.put<UserOut>(`/users/${id}`, body);

export const toggleUserStatus = (id: number, status: string) =>
  api.patch<UserOut>(`/users/${id}/status`, { status });

export const approveUser = (id: number) => api.patch<UserOut>(`/users/${id}/status`, { status: "active" });
export const rejectUser = (id: number) => api.delete(`/users/${id}`);

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const getAuditLogs = (params?: { module?: string; q?: string; type?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<AuditLogOut[]>(`/audit-logs${q ? "?" + q : ""}`);
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getDashboardStats = (branch?: string) => {
  const q = branch ? `?branch=${branch}` : "";
  return api.get<DashboardStats>(`/reports/dashboard${q}`);
};

export const getSalesByMonth = () => api.get<{ month: string; count: number; revenue: number; profit: number }[]>("/reports/sales-by-month");

export const getExpensesByCategory = () =>
  api.get<{ category: string; count: number; total: number }[]>("/reports/expenses-by-category");

export const getTopSalespeople = () =>
  api.get<{ id: number; name: string; role: string; cars_sold: number; revenue_generated: number }[]>("/reports/top-salespeople");
