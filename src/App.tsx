import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import ShippingInfo from './pages/ShippingInfo';
import SizeGuide from './pages/SizeGuide';
import Contact from './pages/Contact';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Orders } from './pages/admin/Orders';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
              </Routes>
            </AdminLayout>
          }
        />

        {/* Client Routes */}
        <Route
          path="/*"
          element={
            <CartProvider>
              <Navbar />
              <Routes>
                <Route index element={<Home />} />
                <Route path="category/:category" element={<CategoryPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="shipping" element={<ShippingInfo />} />
                <Route path="size-guide" element={<SizeGuide />} />
                <Route path="contact" element={<Contact />} />
              </Routes>
              <Footer />
            </CartProvider>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
