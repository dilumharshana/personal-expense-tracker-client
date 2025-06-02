// src/services/expenseService.ts
import { apiClient } from "../Utilis/ApiClient";
import { API_ENDPOINTS } from "../Configs/Api";
import type { Expense, ExpenseFormData, DashboardData } from "../Types/Index";

export const expenseService = {
  getExpenses: async (filters?: { dateTo?: string }): Promise<Expense[]> => {
    const params = new URLSearchParams();

    if (filters?.dateTo) {
      params.append("dateTo", filters.dateTo);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.EXPENSES.BASE}?${queryString}`
      : API_ENDPOINTS.EXPENSES.BASE;

    return await apiClient.get<Expense[]>(url);
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
    params.append("month", month.toString());
    params.append("year", year.toString());

    if (dateTo) {
      params.append("dateTo", dateTo);
    }

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.EXPENSES.DASHBOARD}?${queryString}`;

    return await apiClient.get(url);
  }
};
