import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import LoadingFallback from "./Components/Common/LoadingFallback";
import ProtectedRoute from "./Components/Routes/ProtectedRoute";
import { styleTheme } from "./Configs/StyleConfigs";
import MainLayout from "./Layouts/MainLayout";
import Dashboard from "./Pages/DashboardPage";
import Expenses from "./Pages/ExpensePage";
import MasterData from "./Pages/MasterDataPage";
import { appConfigs } from "./Configs/AppConfigs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={styleTheme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <Navigate
                      to={`/${appConfigs.routePaths.dashboard}`}
                      replace
                    />
                  }
                />
                <Route
                  path={appConfigs.routePaths.dashboard}
                  element={<Dashboard />}
                />
                <Route
                  path={appConfigs.routePaths.expenses}
                  element={<Expenses />}
                />
                <Route
                  path={appConfigs.routePaths.masterData}
                  element={<MasterData />}
                />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
