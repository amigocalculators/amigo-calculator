import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import ContactForm from './components/ContactForm';
import PaymentStatus from './pages/PaymentStatus';
import Event from './pages/Event';
import Corporate from './pages/Corporate';
// import { i } from 'framer-motion/client';
import Scroll from './pages/ScrollToTop';

function App() {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
      <Scroll />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about" element={<About />} />
              <Route path="/event" element={<Event />} />
              <Route path="/corporate" element={<Corporate />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
            </Routes>
          </main>
          <Footer />
          <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(!showContactForm)} />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;