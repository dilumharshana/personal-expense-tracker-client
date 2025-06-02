import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TableCell,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { ExpenseTypesTableColumns } from '../Constants/Index';
import TableComponent from '../Components/Common/TableComponent';
import { masterDataService } from '../Services/MasterDataService';
import type { MasterData } from '../Types/Index';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
});

const MasterDataPage: React.FC = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MasterData | undefined>();
    const queryClient = useQueryClient();

    const { data: masterData = [], isLoading } = useQuery({
        queryKey: ['masterData'],
        queryFn: masterDataService.getMasterData,
    });

    const createMutation = useMutation({
        mutationFn: masterDataService.createMasterData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masterData'] });
            setDialogOpen(false);
            formik.resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { title: string } }) =>
            masterDataService.updateMasterData(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masterData'] });
            setDialogOpen(false);
            setSelectedItem(undefined);
            formik.resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: masterDataService.deleteMasterData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masterData'] });
        },
    });

    const formik = useFormik({
        initialValues: {
            title: selectedItem?.title || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (selectedItem) {
                updateMutation.mutate({ id: selectedItem._id, data: values });
            } else {
                createMutation.mutate(values);
            }
        },
    });

    const handleAdd = () => {
        setSelectedItem(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (item: MasterData) => {
        setSelectedItem(item);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense type?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedItem(undefined);
        formik.resetForm();
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const submitError = createMutation.error || updateMutation.error;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Expense Types
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Add Type
                </Button>
            </Box>

            {deleteMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to delete expense type. It might be in use by existing expenses.
                </Alert>
            )}

            {/* expense table component  */}
            <TableComponent isLoading={isLoading} onEdit={(row: unknown) => handleEdit(row as MasterData)} onDelete={handleDelete} isDeletePending={deleteMutation.isPending} columns={ExpenseTypesTableColumns} tableRows={<>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={2} align="center">
                            Loading expense types...
                        </TableCell>
                    </TableRow>
                ) : masterData?.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} align="center">
                            No expense types found
                        </TableCell>
                    </TableRow>
                ) : (
                    masterData?.map((item) => (
                        <TableRow key={item._id}>
                            <TableCell>
                                <Typography variant="body1">{item.title}</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <IconButton
                                    size="small"
                                    onClick={() => handleEdit(item)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(item._id)}
                                    color="error"
                                    disabled={deleteMutation.isPending}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))
                )}</>} />

            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedItem ? 'Edit Expense Type' : 'Add New Expense Type'}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        {submitError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {selectedItem ? 'Failed to update expense type' : 'Failed to create expense type'}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            id="title"
                            name="title"
                            label="Title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                            margin="normal"
                            required
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting
                                ? selectedItem
                                    ? 'Updating...'
                                    : 'Adding...'
                                : selectedItem
                                    ? 'Update'
                                    : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default MasterDataPage;