// src/pages/Expenses.tsx
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    TableCell,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { expenseTableColumns } from '../Components/Constants/Index';
import ExpenseForm from '../Components/ExpenseForm';
import TableComponent, { type Column } from '../Components/TableComponent';
import { expenseService } from '../Services/ExpenseService';
import { masterDataService } from '../Services/MasterDataService';
import type { Expense, ExpenseFilters, MasterData } from '../Types/Index';

const Expenses: React.FC = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
    const [filters, setFilters] = useState<ExpenseFilters>({});
    const [masterDataById, setMasterDataById] = useState<{ [key: string]: string }>({})
    const queryClient = useQueryClient();


    const { data: expenses = [], isLoading: expensesLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: expenseService.getExpenses,
    });

    const { data: masterData = [] } = useQuery({
        queryKey: ['masterData'],
        queryFn: masterDataService.getMasterData,
    });

    const deleteMutation = useMutation({
        mutationFn: expenseService.deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    const filteredExpenses = useMemo(() => {
        return expenses?.filter((expense) => {
            const matchesType = !filters.type || expense.type === filters.type;
            const matchesDescription = !filters.description ||
                expense.description.toLowerCase().includes(filters.description.toLowerCase());
            const matchesDateFrom = !filters.dateFrom ||
                new Date(expense.date) >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo ||
                new Date(expense.date) <= new Date(filters.dateTo);

            return matchesType && matchesDescription && matchesDateFrom && matchesDateTo;
        });
    }, [expenses, filters]);

    const currentMonthTotal = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return expenses?.reduce((total, expense) => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                return total + expense.amount;
            }
            return total;
        }, 0) || 0;
    }, [expenses]);

    useEffect(() => {
        if (masterData?.length > 0) {
            prepareMasterDataByObject()
        }
    }, [masterData])

    const prepareMasterDataByObject = () => {

        const masterDataById: { [key: string]: string } = {};

        masterData?.forEach((masterData: MasterData) => {
            masterDataById[masterData?._id] = masterData.title
        })

        setMasterDataById(masterDataById)
    }

    const handleEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setSelectedExpense(undefined);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    const columns: Column<Expense>[] = [
        {
            key: 'date',
            label: 'Date',
            render: (value) => new Date(value as string).toLocaleDateString(),
        },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount', align: 'right' },

    ];

    return (
        <Box>

            <ExpenseForm
                open={formOpen}
                onClose={handleFormClose}
                expense={selectedExpense}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Expenses
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setFormOpen(true)}
                >
                    Add Expense
                </Button>
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Current Month Total
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {formatCurrency(currentMonthTotal)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filters
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Expense Type"
                            value={filters.type || ''}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                            size="small"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {masterData?.map((item) => (
                                <MenuItem key={item._id} value={item._id}>
                                    {item.title}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={filters.description || ''}
                            onChange={(e) => setFilters({ ...filters, description: e.target.value || undefined })}
                            size="small"
                            InputProps={{
                                endAdornment: <SearchIcon />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="From Date"
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="To Date"
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {deleteMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to delete expense. Please try again.
                </Alert>
            )}

            <TableComponent
                isLoading={expensesLoading}
                isDeletePending={deleteMutation.isPending}
                onEdit={(row: Expense) => handleEdit(row)}
                onDelete={(id) => handleDelete(id)}
                columns={expenseTableColumns}
                rows={<>
                    {(expensesLoading || deleteMutation.isPending) ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                Loading expenses...
                            </TableCell>
                        </TableRow>
                    ) : filteredExpenses?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No expenses found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredExpenses?.map((expense) => (
                            <TableRow key={expense._id}>
                                <TableCell>
                                    {new Date(expense.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={masterDataById[expense?.type]}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell align="right">
                                    {formatCurrency(expense.amount)}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEdit(expense)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(expense._id!)}
                                        color="error"
                                        disabled={deleteMutation.isPending}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </>}
            />
        </Box>
    );
};

export default Expenses;