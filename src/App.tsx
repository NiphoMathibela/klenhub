import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerified from './pages/EmailVerified';
import { Dashboard } from './pages/admin/Dashboard';
import { Orders } from './pages/admin/Orders';
import { Products } from './pages/admin/Products';
import ShippingInfo from './pages/ShippingInfo';
import { ProductDetail } from './pages/ProductDetail';
import { CategoryPage } from './pages/CategoryPage';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';
import Contact from './pages/Contact';
import SizeGuide from './pages/SizeGuide';
import AdminLayout from './components/AdminLayout';
import PaymentVerify from './pages/PaymentVerify';
import ReturnsExchanges from './pages/ReturnsExchanges';
import FAQ from './pages/FAQ';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} />
          <Routes>
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="products" element={<Products />} />
            </Route>

            {/* Public and protected routes */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <main className="min-h-screen pt-16 lg:pt-[120px]">
                    <Outlet />
                  </main>
                  <Footer />
                </>
              }
            >
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="email-verified" element={<EmailVerified />} />
              <Route path="shipping" element={<ShippingInfo />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="category/:category" element={<CategoryPage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="size-guide" element={<SizeGuide />} />
              <Route path="returns-exchanges" element={<ReturnsExchanges />} />
              <Route path="faq" element={<FAQ />} />
              
              {/* Payment routes */}
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="payment/cancel" element={<PaymentCancel />} />
              <Route path="payment/verify" element={<PaymentVerify />} />
              
              {/* Protected customer routes */}
              <Route path="cart" element={<Cart />} />
              <Route 
                path="checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="orders" 
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="order/:id" 
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
