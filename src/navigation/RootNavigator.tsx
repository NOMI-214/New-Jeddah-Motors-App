import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useApp } from "../context/AppContext";
import { toNavigationTheme } from "../theme/navigationTheme";

import { LoginScreen } from "../screens/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { CarsScreen } from "../screens/CarsScreen";
import { CarDetailScreen } from "../screens/CarDetailScreen";
import { AddCarScreen } from "../screens/AddCarScreen";
import { FinanceScreen } from "../screens/FinanceScreen";
import { AddTransactionScreen } from "../screens/AddTransactionScreen";
import { AddExpenseScreen } from "../screens/AddExpenseScreen";
import { CustomersScreen } from "../screens/CustomersScreen";
import { CustomerDetailScreen } from "../screens/CustomerDetailScreen";
import { AddCustomerScreen } from "../screens/AddCustomerScreen";
import { SalesScreen } from "../screens/SalesScreen";
import { SaleDetailScreen } from "../screens/SaleDetailScreen";
import { AddSaleScreen } from "../screens/AddSaleScreen";
import { InstallmentsScreen } from "../screens/InstallmentsScreen";
import { UsersScreen } from "../screens/UsersScreen";
import { UserDetailScreen } from "../screens/UserDetailScreen";
import { AddEmployeeScreen } from "../screens/AddEmployeeScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { AuditLogsScreen } from "../screens/AuditLogsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ChangePasswordScreen } from "../screens/ChangePasswordScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { MoreScreen } from "../screens/MoreScreen";

import { AuthStackParamList, RootStackParamList, TabParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "grid",
  Cars: "car-sport",
  Finance: "swap-vertical",
  Customers: "people",
  More: "menu",
};

const TabNavigator: React.FC = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof TabParamList]} size={size - 2} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Cars" component={CarsScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated } = useApp();

  return (
    <NavigationContainer theme={toNavigationTheme(theme)}>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      {!isAuthenticated ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="SignUp" component={SignUpScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      ) : (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
          <MainStack.Screen name="Tabs" component={TabNavigator} />
          <MainStack.Screen name="CarDetail" component={CarDetailScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="AddCar" component={AddCarScreen} options={{ presentation: "modal" }} />
          <MainStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ presentation: "modal" }} />
          <MainStack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="AddSale" component={AddSaleScreen} options={{ presentation: "modal" }} />
          <MainStack.Screen name="Sales" component={SalesScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: "modal" }} />
          <MainStack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: "modal" }} />
          <MainStack.Screen name="Installments" component={InstallmentsScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="Users" component={UsersScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="UserDetail" component={UserDetailScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ presentation: "modal" }} />
          <MainStack.Screen name="Reports" component={ReportsScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="AuditLogs" component={AuditLogsScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="Settings" component={SettingsScreen} options={{ presentation: "card" }} />
          <MainStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ presentation: "card" }} />
        </MainStack.Navigator>
      )}
    </NavigationContainer>
  );
};
