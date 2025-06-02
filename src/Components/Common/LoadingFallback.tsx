import { Box, CircularProgress } from "@mui/material";

// react suspense loading component
const LoadingFallback: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

export default LoadingFallback;
