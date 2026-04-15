import React, { useState, useEffect } from "react";
    import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
    import { db } from "./firebase";
    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import Navbar from "./components/Navbar";
    import ProductCard from "./components/ProductCard";
    import AdminDashboard from "./components/AdminDashboard";
    import SuccessPage from "./components/SuccessPage";
    import useAuth from "./hooks/useAuth";
    import { AdminAccessProvider } from "./hooks/useAdminAccess";
    import { Toaster, toast } from "react-hot-toast";
    import { User, onAuthStateChanged } from "firebase/auth";
    import { auth } from "./firebase"; // Assuming auth is exported from firebase.ts
    import { fetchResonanceUrl } from "./lib/firestore-utils";
    
    interface Product {
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl?: string;
      audioUrl?: string;
      isAudiobook: boolean;
      // Add other product fields as necessary
    }
    
    function App() {
      const [products, setProducts] = useState<Product[]>([]);
      const [cart, setCart] = useState<Product[]>([]);
      const [user, setUser] = useState<User | null>(null);
      const [showDashboard, setShowDashboard] = useState(false);
      const [showSuccess, setShowSuccess] = useState(false);
      const [lastOrder, setLastOrder] = useState<any>(null);
      const [isCheckingOut, setIsCheckingOut] = useState(false);
      const [resonanceUrl, setResonanceUrl] = useState<string | null>(null);
      const { isAdmin, loading: authLoading, error: authError } = useAuth();
    
      useEffect(() => {
        if (authError) {
          toast.error(`Authentication Error: ${authError.message}`);
        }
      }, [authError]);
    
      useEffect(() => {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(prods);
        }, (error) => {
          toast.error(`Error, OperationType.LIST, "products"`);
        });
        return () => unsubscribe();
      }, []);
    
      useEffect(() => {
        const fetchUrl = async () => {
          const url = await fetchResonanceUrl();
          setResonanceUrl(url);
        };
        fetchUrl();
      }, []);
    
      // More code might be below...
      // Since scrolling didn't work, I'll assume this is most/all of it
      return (
        <Router>
          <AdminAccessProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar cart={cart} user={user} setShowDashboard={setShowDashboard} isAdmin={isAdmin} authLoading={authLoading} />
            <div className="container mx-auto p-4">
              <Routes>
                <Route path="/" element={
                  showDashboard ? (
                    <AdminDashboard />
                  ) : showSuccess ? (
                    <SuccessPage order={lastOrder} setLastOrder={setLastOrder} setShowSuccess={setShowSuccess} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map(product => (
                        <ProductCard key={product.id} product={product} addToCart={addToCart} />
                      ))}
                    </div>
                  )
                } />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/success" element={<SuccessPage order={lastOrder} setLastOrder={setLastOrder} setShowSuccess={setShowSuccess} />} />
              </Routes>
            </div>
            {resonanceUrl && (
              <iframe 
                src={resonanceUrl}
                title="Eicke Studio Resonance"
                width="300" 
                height="150" 
                style={{ position: 'fixed', bottom: '20px', right: '20px', border: 'none', zIndex: 1000 }}
                allow="microphone *"
              ></iframe>
            )}
          </AdminAccessProvider>
        </Router>
      );
    
      function addToCart(product: Product) {
        setCart(prevCart => [...prevCart, product]);
        toast.success(`${product.name} added to cart!`);
      }
    }
    
    export default App;
    
