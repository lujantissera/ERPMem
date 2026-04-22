import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';

import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminSupplierOrders from './pages/admin/AdminSupplierOrders';

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login / Register — sin navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Tienda pública con navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={<ProtectedRoute><Checkout /></ProtectedRoute>}
          />
          <Route
            path="/my-orders"
            element={<ProtectedRoute><MyOrders /></ProtectedRoute>}
          />
          <Route
            path="/my-orders/:id"
            element={<ProtectedRoute><OrderDetail /></ProtectedRoute>}
          />
        </Route>

        {/* Panel de administración */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="supplier-orders" element={<AdminSupplierOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
