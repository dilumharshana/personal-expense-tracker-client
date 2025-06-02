// src/pages/Expenses.tsx
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
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
import TableComponent from '../Components/Common/TableComponent';
import ExpenseForm from '../Components/Expenses/ExpenseForm';
import { expenseService } from '../Services/ExpenseService';
import { masterDataService } from '../Services/MasterDataService';
import type { Expense, ExpenseFilters, MasterData } from '../Types/Index';

const ExpensesPage: React.FC = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
    const [frontendFilters, setFrontendFilters] = useState<Omit<ExpenseFilters, 'dateTo'>>({});
    const [backendDateFilter, setBackendDateFilter] = useState<string>('');
    const [masterDataById, setMasterDataById] = useState<{ [key: string]: string }>({});

    const queryClient = useQueryClient();

    // Backend query with date filter - refetches when backendDateFilter changes
    const { data: expenses = [], isLoading: expensesLoading } = useQuery({
        queryKey: ['expenses', backendDateFilter],
        queryFn: () => expenseService.getExpenses(backendDateFilter ? { dateTo: backendDateFilter } : undefined),
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

    // Frontend filtering (excluding dateTo which is handled by backend)
    const filteredExpenses = useMemo(() => {
        return expenses?.filter((expense) => {
            const matchesType = !frontendFilters.type || expense.type === frontendFilters.type;
            const matchesDescription = !frontendFilters.description ||
                expense.description.toLowerCase().includes(frontendFilters.description.toLowerCase());
            const matchesDateFrom = !frontendFilters.dateFrom ||
                new Date(expense.date) >= new Date(frontendFilters.dateFrom);

            return matchesType && matchesDescription && matchesDateFrom;
        });
    }, [expenses, frontendFilters]);

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
            prepareMasterDataByObject();
        }
    }, [masterData]);

    const prepareMasterDataByObject = () => {
        const masterDataById: { [key: string]: string } = {};

        masterData?.forEach((masterData: MasterData) => {
            masterDataById[masterData?._id] = masterData.title;
        });

        setMasterDataById(masterDataById);
    };

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

    const handleFrontendFilterChange = (filterKey: keyof Omit<ExpenseFilters, 'dateTo'>, value: string | undefined) => {
        setFrontendFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    const handleDateToFilterChange = (dateTo: string) => {
        setBackendDateFilter(dateTo);
        // Also invalidate dashboard queries when date filter changes
        if (dateTo) {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    };

    const handleClearFilters = () => {
        setFrontendFilters({});
        setBackendDateFilter('');
        // Refetch dashboard data to reset to initial state
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return !!(frontendFilters.type || frontendFilters.description || frontendFilters.dateFrom || backendDateFilter);
    }, [frontendFilters, backendDateFilter]);


    const todayDate = new Date().toISOString().split('T')[0];

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
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Filters
                    </Typography>
                    {hasActiveFilters && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                            color="secondary"
                        >
                            Clear Filters
                        </Button>
                    )}
                </Box>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Expense Type"
                            value={frontendFilters.type || ''}
                            onChange={(e) => handleFrontendFilterChange('type', e.target.value || undefined)}
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
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={frontendFilters.description || ''}
                            onChange={(e) => handleFrontendFilterChange('description', e.target.value || undefined)}
                            size="small"
                            InputProps={{
                                endAdornment: <SearchIcon />,
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="From Date"
                            type="date"
                            value={frontendFilters.dateFrom || ''}
                            onChange={(e) => handleFrontendFilterChange('dateFrom', e.target.value || undefined)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="To Date"
                            inputProps={{
                                max: todayDate,
                            }}
                            type="date"
                            value={backendDateFilter || ''}
                            onChange={(e) => handleDateToFilterChange(e.target.value)}
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
                columns={['Date', 'Type', 'Description', 'Amount', 'Actions']}
                isLoading={expensesLoading || deleteMutation.isPending}
                onEdit={(row: unknown) => handleEdit(row as Expense)}
                onDelete={(id) => handleDelete(id)}
                tableRows={<>
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
                                <TableCell>
                                    {formatCurrency(expense.amount)}
                                </TableCell>
                                <TableCell>
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

export default ExpensesPage;