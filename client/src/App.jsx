import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts & Guard Routes
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Public & Static Pages
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import DrugManagement from './pages/admin/DrugManagement';
import SupplierManagement from './pages/admin/SupplierManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ShipmentManagement from './pages/admin/ShipmentManagement';
import WarehouseManagement from './pages/admin/WarehouseManagement';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import AlertsCenter from './pages/admin/AlertsCenter';
import Settings from './pages/admin/Settings';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierShipments from './pages/supplier/SupplierShipments';
import SupplierProfile from './pages/supplier/SupplierProfile';

// Warehouse Pages
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import WarehouseInventory from './pages/warehouse/WarehouseInventory';
import WarehouseShipments from './pages/warehouse/WarehouseShipments';
import WarehouseAlerts from './pages/warehouse/WarehouseAlerts';

// Pharmacy Pages
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyOrders from './pages/pharmacy/PharmacyOrders';
import PharmacyAlerts from './pages/pharmacy/PharmacyAlerts';

const RootRedirect = () => {
  const { isAuthenticated, getRoleDashboardRoute } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleDashboardRoute()} replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="drugs" element={<DrugManagement />} />
        <Route path="suppliers" element={<SupplierManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="shipments" element={<ShipmentManagement />} />
        <Route path="warehouses" element={<WarehouseManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="alerts" element={<AlertsCenter />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* SUPPLIER ROUTES */}
      <Route
        path="/supplier"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN', 'SUPPLIER']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/supplier/dashboard" replace />} />
        <Route path="dashboard" element={<SupplierDashboard />} />
        <Route path="products" element={<SupplierProducts />} />
        <Route path="orders" element={<SupplierOrders />} />
        <Route path="shipments" element={<SupplierShipments />} />
        <Route path="profile" element={<SupplierProfile />} />
      </Route>

      {/* WAREHOUSE MANAGER ROUTES */}
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE_MANAGER']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/warehouse/dashboard" replace />} />
        <Route path="dashboard" element={<WarehouseDashboard />} />
        <Route path="inventory" element={<WarehouseInventory />} />
        <Route path="shipments" element={<WarehouseShipments />} />
        <Route path="alerts" element={<WarehouseAlerts />} />
      </Route>

      {/* PHARMACY MANAGER ROUTES */}
      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN', 'PHARMACY_MANAGER']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/pharmacy/dashboard" replace />} />
        <Route path="dashboard" element={<PharmacyDashboard />} />
        <Route path="inventory" element={<PharmacyInventory />} />
        <Route path="orders" element={<PharmacyOrders />} />
        <Route path="alerts" element={<PharmacyAlerts />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
