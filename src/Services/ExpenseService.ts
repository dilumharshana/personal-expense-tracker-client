// src/services/expenseService.ts
import { apiClient } from "../Utilis/ApiClient";
import { API_ENDPOINTS } from "../Configs/Api";
import type { Expense, ExpenseFormData, DashboardData } from "../Types/Index";
import { appConfigs } from "../Configs/AppConfigs";

export const expenseService = {
  getExpenses: async (): Promise<Expense[]> => {
    return await apiClient.get<Expense[]>(API_ENDPOINTS.EXPENSES.BASE);
  },

  createExpense: async (expense: ExpenseFormData): Promise<Expense> => {
    return await apiClient.post<Expense>(API_ENDPOINTS.EXPENSES.BASE, expense);
  },

  updateExpense: async (
    id: string,
    expense: ExpenseFormData
  ): Promise<Expense> => {
    return await apiClient.patch<Expense>(
      `${API_ENDPOINTS.EXPENSES.BASE}/${id}`,
      expense
    );
  },

  deleteExpense: async (id: string): Promise<void> => {
    return await apiClient.delete<void>(`${API_ENDPOINTS.EXPENSES.BASE}/${id}`);
  },

  getDashboardData: async (
    month: number,
    year: number,
    dateTo?: string
  ): Promise<DashboardData> => {
    const params = new URLSearchParams();
    params.append(appConfigs.params.month, month.toString());
    params.append(appConfigs.params.year, year.toString());

    if (dateTo) {
      params.append(appConfigs.params.dateTo, dateTo);
    }

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.EXPENSES.DASHBOARD}?${queryString}`;

    return await apiClient.get(url);
  }
};
