import React from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Grid,
    Paper,
    Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import BarChartComponent from '../Components/Common/BarChartComponent';
import PieChartComponent from '../Components/Common/PieChartComponent';
import { expenseService } from '../Services/ExpenseService';
import { masterDataService } from '../Services/MasterDataService';
import { formatCurrency, generateColorScale } from '../Utilis/Helpers';


// prepare dates for send with Dashboard data fetch end points 
const date = new Date();
const month = date.getMonth()
const year = date.getFullYear();

const Dashboard: React.FC = () => {
    const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
        queryKey: ['dashboard', month, year],
        queryFn: () => expenseService.getDashboardData(month, year),
        refetchInterval: 30000,
    });

    const { data: masterData = [] } = useQuery({
        queryKey: ['masterData'],
        queryFn: masterDataService.getMasterData,
    });

    // get master data title 
    const getMasterDataTitle = (id: string) => {
        return masterData?.find((item) => item._id === id)?.title || 'Unknown';
    };

    // Prepare expense patterns data for pie chart
    const expensePatterns = React.useMemo(() => {
        if (!dashboardData?.dashBoardData) return null;

        const typeAmounts = dashboardData?.dashBoardData?.reduce((acc, expense) => {
            const typeTitle = expense?.type ? getMasterDataTitle(expense?.type) : 'Uncategorized';
            acc[typeTitle] = (acc[typeTitle] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(typeAmounts);
        const data = Object.values(typeAmounts);
        const colors = generateColorScale(dashboardData?.dashBoardData?.length)

        return {
            labels,
            datasets: [
                {
                    label: 'Expenses by Type',
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                },
            ],
        };
    }, [dashboardData, masterData]);

    // Prepare daily expenses data for bar chart
    const dailyExpenses = React.useMemo(() => {
        if (!dashboardData?.dashBoardData) return null;

        const dailyAmounts = dashboardData.dashBoardData.reduce((acc, expense) => {
            const date = new Date(expense.date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        const sortedDates = Object.keys(dailyAmounts).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        return {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Daily Expenses (LKR)',
                    data: sortedDates.map((date) => dailyAmounts[date]),
                    backgroundColor: '#36A2EB',
                    borderColor: '#36A2EB',
                    borderWidth: 1,
                },
            ],
        };
    }, [dashboardData]);

    // dashboard loading state 
    if (dashboardLoading) {
        return (
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Typography>Loading dashboard data...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>

            {dashboardData?.hasExceedExpenseLimit && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Warning: You have exceeded or are close to your monthly expense limit!
                </Alert>
            )}

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 6 }} >
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Monthly Total Expenses
                            </Typography>
                            <Typography variant="h3" component="div">
                                {formatCurrency(dashboardData?.monthlyTotalExpense || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} >
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Total Transactions
                            </Typography>
                            <Typography variant="h3" component="div">
                                {dashboardData?.dashBoardData?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }} >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Expense Patterns by Type
                        </Typography>
                        {expensePatterns && expensePatterns.labels.length > 0 ? (
                            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                                {/* pie chart for Expense Patterns by Type */}
                                <PieChartComponent expensePatterns={expensePatterns} />
                            </Box>
                        ) : (
                            <Typography color="text.secondary">
                                No expense data available for chart
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Daily Expenses
                        </Typography>
                        {dailyExpenses && dailyExpenses.labels.length > 0 ? (
                            <Box sx={{ height: 400 }}>
                                {/* bar chart for Daily Expenses  */}
                                <BarChartComponent dailyExpenses={dailyExpenses} />

                            </Box>
                        ) : (
                            <Typography color="text.secondary">
                                No expense data available for chart
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Recent Expenses
                </Typography>
                {dashboardData?.dashBoardData?.slice(0, 5).map((expense) => (
                    <Box
                        key={expense._id}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1,
                            borderBottom: '1px solid #eee',
                        }}
                    >
                        <Box>
                            <Typography variant="body1">{expense.description}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {expense.type ? getMasterDataTitle(expense.type) : 'Uncategorized'} • {' '}
                                {new Date(expense.date).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                            {formatCurrency(expense.amount)}
                        </Typography>
                    </Box>
                ))}
                {(!dashboardData?.dashBoardData || dashboardData.dashBoardData.length === 0) && (
                    <Typography color="text.secondary">No recent expenses</Typography>
                )}
            </Paper>
        </Box>
    );
};

export default Dashboard;