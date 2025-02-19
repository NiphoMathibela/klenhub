import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { DashboardPage } from './pages/admin/DashboardPage';
import { Orders } from './pages/admin/Orders';
import { Products } from './pages/admin/Products';
import ShippingInfo from './pages/ShippingInfo';
import { ProductDetail } from './pages/ProductDetail';
import { CategoryPage } from './pages/CategoryPage';
import { Cart } from './pages/Cart';
import Contact from './pages/Contact';
import SizeGuide from './pages/SizeGuide';
import { Customers } from './pages/admin/Customers';
import { Marketing } from './pages/admin/Marketing';
import { Content } from './pages/admin/Content';
import { Analytics } from './pages/admin/Analytics';
import { Settings } from './pages/admin/Settings';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:status" element={<Orders />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/new" element={<Products />} />
                      <Route path="/products/categories" element={<Products />} />
                      <Route path="/products/inventory" element={<Products />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/reviews" element={<Customers />} />
                      <Route path="/customers/messages" element={<Customers />} />
                      <Route path="/marketing" element={<Marketing />} />
                      <Route path="/marketing/discounts" element={<Marketing />} />
                      <Route path="/marketing/promotions" element={<Marketing />} />
                      <Route path="/marketing/email" element={<Marketing />} />
                      <Route path="/content" element={<Content />} />
                      <Route path="/content/pages" element={<Content />} />
                      <Route path="/content/blog" element={<Content />} />
                      <Route path="/content/media" element={<Content />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/analytics/sales" element={<Analytics />} />
                      <Route path="/analytics/traffic" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/general" element={<Settings />} />
                      <Route path="/settings/users" element={<Settings />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/category/:category" element={<CategoryPage />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/size-guide" element={<SizeGuide />} />

                      {/* Protected Routes */}
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/shipping"
                        element={
                          <ProtectedRoute>
                            <ShippingInfo />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
