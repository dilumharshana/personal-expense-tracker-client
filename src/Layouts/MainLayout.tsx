import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    useTheme,
    useMediaQuery,
    ListItemButton,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Receipt as ExpenseIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { appConfigs } from '../Configs/AppConfigs';

const DRAWER_WIDTH = 240;

interface MenuItem {
    text: string;
    icon: React.ReactElement;
    path: string;
}

const MainLayout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems: MenuItem[] = [
        {
            text: appConfigs.menuItems.dashboard,
            icon: <DashboardIcon />,
            path: `/${appConfigs.routePaths.dashboard}`
        },
        {
            text: appConfigs.menuItems.expenses,
            icon: <ExpenseIcon />,
            path: `/${appConfigs.routePaths.expenses}`
        },
        {
            text: appConfigs.menuItems.masterData,
            icon: <SettingsIcon />,
            path: `/${appConfigs.routePaths.masterData}`
        },
    ];

    const isActiveRoute = (path: string): boolean => {
        return location.pathname === path;
    };

    const handleMenuItemClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <div>
            <List>
                {menuItems.map((item) => {
                    const isActive = isActiveRoute(item.path);

                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => handleMenuItemClick(item.path)}
                                className='dashboard-item'
                                selected={isActive}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                    backgroundColor: isActive
                                        ? theme.palette.action.selected
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive
                                            ? theme.palette.action.selected
                                            : theme.palette.action.hover,
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark,
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.primary.contrastText,
                                        },
                                    },
                                    borderRadius: 1,
                                    mx: 1,
                                    my: 0.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: 3,
                                        justifyContent: 'center',
                                        color: isActive
                                            ? theme.palette.primary.contrastText
                                            : 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        '& .MuiListItemText-primary': {
                                            fontWeight: isActive ? 600 : 400,
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top Navigation Bar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    width: '100%',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                        aria-label="open drawer"
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Expense Tracker
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box sx={{ display: 'flex', flexGrow: 1, mt: '64px' }}>
                {/* Side Navigation Drawer */}
                <Box
                    component="nav"
                    sx={{
                        width: { md: DRAWER_WIDTH },
                        flexShrink: { md: 0 },
                        display: { xs: 'none', md: 'block' }
                    }}
                >
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: DRAWER_WIDTH,
                                mt: '64px',
                                height: 'calc(100vh - 64px)',
                                borderRight: `1px solid ${theme.palette.divider}`,
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            mt: '64px',
                            height: 'calc(100vh - 64px)',
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: {
                            xs: '100%',
                            md: `calc(100% - ${DRAWER_WIDTH}px)`
                        },
                        minHeight: 'calc(100vh - 64px)',
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;