// src/components/ExpenseForm.tsx
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import * as Yup from "yup";
import { expenseService } from "../../Services/ExpenseService";
import { masterDataService } from "../../Services/MasterDataService";
import type { Expense, ExpenseFormData } from "../../Types/Index";

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  type: Yup.string().required("Expense type is required"),
  description: Yup.string().required("Description is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  date: Yup.string().required("Date is required"),
});

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  expense,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const { data: masterData = [], isLoading: masterDataLoading } = useQuery({
    queryKey: ["masterData"],
    queryFn: masterDataService.getMasterData,
  });

  const createMutation = useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseFormData }) =>
      expenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onSuccess?.();
      onClose();
    },
  });

  const formik = useFormik<ExpenseFormData>({
    initialValues: {
      type: expense?.type || "",
      description: expense?.description || "",
      amount: expense?.amount || "",
      date:
        expense?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const data = {
        ...values,
        amount: Number(values.amount),
      };

      if (expense?._id) {
        updateMutation.mutate({ id: expense._id, data });
      } else {
        createMutation.mutate(data);
      }
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {expense ? "Update Expense" : "Add New Expense"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {expense
                ? "Failed to update expense"
                : "Failed to create expense"}
            </Alert>
          )}

          <TextField
            select
            fullWidth
            id="type"
            name="type"
            label="Expense Type"
            value={formik.values.type}
            onChange={formik.handleChange}
            error={formik.touched.type && Boolean(formik.errors.type)}
            helperText={formik.touched.type && formik.errors.type}
            margin="normal"
            disabled={masterDataLoading}
            required
          >
            {masterData?.map((item) => (
              <MenuItem key={item?._id} value={item?._id}>
                {item?.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
            margin="normal"
            multiline
            rows={3}
            required
          />

          <TextField
            fullWidth
            id="amount"
            name="amount"
            label="Amount (LKR)"
            type="number"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            margin="normal"
            inputProps={{ min: 0, step: "0.01" }}
            required
          />

          <TextField
            fullWidth
            id="date"
            name="date"
            label="Date"
            type="date"
            value={formik.values.date}
            onChange={formik.handleChange}
            error={formik.touched.date && Boolean(formik.errors.date)}
            helperText={formik.touched.date && formik.errors.date}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: todayDate,
            }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading
              ? expense
                ? "Updating..."
                : "Adding..."
              : expense
                ? "Update"
                : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm;
