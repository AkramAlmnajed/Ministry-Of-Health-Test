import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ProductsPage from "./features/products/ProductsPage";
import ProductDetailsPage from "./features/products/ProductDetailsPage";
import { useAuth } from "./features/auth/useAuth";

export default function App() {
  const { isAuthed } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthed ? "/products" : "/login"} replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
