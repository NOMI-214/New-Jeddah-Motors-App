export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  CarDetail: { carId: string };
  AddCar: undefined;
  CustomerDetail: { customerId: string };
  AddCustomer: undefined;
  SaleDetail: { saleId: string };
  AddSale: { carId?: string };
  Sales: undefined;
  AddTransaction: { type: "cashIn" | "cashOut" };
  AddExpense: undefined;
  Reports: undefined;
  AuditLogs: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Installments: undefined;
  Users: undefined;
  UserDetail: { userId: string };
  AddEmployee: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Cars: undefined;
  Finance: undefined;
  Customers: undefined;
  More: undefined;
};
