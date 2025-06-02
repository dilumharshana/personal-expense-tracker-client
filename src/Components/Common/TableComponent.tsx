import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { memo, useMemo } from "react";

export interface Column<T> {
  key: keyof T;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableComponentProps<T> {
  tableRows: React.ReactNode;
  columns: string[];
  isLoading: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  isDeletePending?: boolean;
}

// Memoized EmptyState component
const MemoizedEmptyState = memo(({ message }: { message: string }) => (
  <TableRow>
    <TableCell align="center">{message}</TableCell>
  </TableRow>
));

// Memoized TableHeader component
const MemoizedTableHeader = memo(({ columns }: { columns: string[] }) => (
  <TableHead>
    {columns?.map((label) => (
      <TableCell key={String(label)}>{label}</TableCell>
    ))}
  </TableHead>
));

function TableComponent<T>({
  tableRows,
  columns,
  isLoading,
  onEdit,
  onDelete,
  isDeletePending = false,
}: TableComponentProps<T>) {
  // Memoize table body content
  const tableBody = useMemo(() => {
    if (isLoading) {
      return <MemoizedEmptyState message="Loading..." />;
    }

    if (!tableRows) {
      return <MemoizedEmptyState message="No data found" />;
    }

    return tableRows;
  }, [tableRows, columns, onEdit, onDelete, isDeletePending, isLoading]);

  // Memoize table header
  const tableHeader = useMemo(
    () => <MemoizedTableHeader columns={columns} />,
    [columns],
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        {tableHeader}
        <TableBody>{tableBody}</TableBody>
      </Table>
    </TableContainer>
  );
}

// Export the main component with memo to prevent re-renders when props haven't changed
export default memo(TableComponent);
