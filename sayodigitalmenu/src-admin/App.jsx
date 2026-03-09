import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MainSections } from './pages/MainSections';
import { Classifications } from './pages/Classifications';
import { MenuItems } from './pages/MenuItems';
import { FiltersTags } from './pages/FiltersTags';
import { Countries } from './pages/Countries';
import { HeroOpening } from './pages/HeroOpening';
import { Settings } from './pages/Settings';
import { UserRoles } from './pages/UserRoles';
import { RolePermissions } from './pages/RolePermissions';
import { Users } from './pages/Users';
import { ActivityLog } from './pages/ActivityLog';
import { Customers } from './pages/Customers';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="main-sections" element={<MainSections />} />
            <Route path="classifications" element={<Classifications />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="filters-tags" element={<FiltersTags />} />
            <Route path="countries" element={<Countries />} />
            <Route path="hero-opening" element={<HeroOpening />} />
            <Route path="settings" element={<Settings />} />
            <Route path="user-roles" element={<UserRoles />} />
            <Route path="role-permissions" element={<RolePermissions />} />
            <Route path="users" element={<Users />} />
            <Route path="customers" element={<Customers />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
