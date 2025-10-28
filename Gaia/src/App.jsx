import React, { useState } from 'react'
import MainPage from './pages/MainPage'
import ConnectDevice from './pages/ConnectDevice'
import HealthCheck from './pages/HealthCheck'
import Exercises from './pages/Exercises'
import Accessories from './pages/Accessories'
import PillowPreview from './pages/PillowPreview'
import ScentPreview from './pages/ScentPreview'
import AirPreview from './pages/AirPreview'
import ShoesPreview from './pages/ShoesPreview'
import './components/ImagePreviewModal.css';
import NeckAvatarPreview from './pages/NeckAvatarPreview'
import NeckPreview from './pages/NeckPreview'
import ShoesAvatarPreview from './pages/ShoesAvatarPreview'
import InCarPreview from './pages/InCarPreview'
// Replaced wishlist by cart
import Cart from './pages/Cart'
import History from './pages/History'
import AIRecommendations from './pages/AIRecommendations'
import './App.css'

import ExerciseDetail from './pages/ExerciseDetail';
import AccessoryDetail from './pages/AccessoryDetail';
import Toast from './components/Toast';

function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [pageContext, setPageContext] = useState(null);
  const [gender, setGender] = useState('male');
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const handleNavigate = (page, context = null) => {
    setCurrentPage(page);
    setPageContext(context);
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
  };

  // cart helpers
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p);
      }
      setToast({ visible: true, message: `${item.name} added to cart`, type: 'success' });
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const replaceCartWithSingle = (item) => {
    setCart([{ ...item, quantity: 1 }]);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));
  const updateCartQty = (id, qty) => setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p));
  const purchaseItem = (item) => {
    // simple confirmation for now
    alert(`Purchased: ${item.name}`);
    removeFromCart(item.id);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return <MainPage onNavigate={handleNavigate} onGenderChange={handleGenderChange} gender={gender} />;
      case 'health':
        return <HealthCheck onNavigate={handleNavigate} gender={gender} />;
      case 'exercises':
        return <Exercises onNavigate={handleNavigate} onGenderChange={handleGenderChange} />;
      case 'exerciseDetail':
        return <ExerciseDetail onNavigate={handleNavigate} exerciseId={pageContext?.exerciseId} />;
      case 'accessories':
        return <Accessories onNavigate={handleNavigate} addToCart={addToCart} />;
      case 'accessoryDetail':
        return (
          <AccessoryDetail
            onNavigate={handleNavigate}
            addToCart={addToCart}
            buyNow={(item) => { replaceCartWithSingle(item); handleNavigate('cart', { openPayment: true }); }}
            accessoryId={pageContext?.accessoryId}
          />
        );
      case 'pillowPreview':
        return <PillowPreview onNavigate={handleNavigate} />;
      case 'scentPreview':
        return <ScentPreview onNavigate={handleNavigate} />;
      case 'airPreview':
        return <AirPreview onNavigate={handleNavigate} />;
      case 'shoesPreview':
        return <ShoesPreview onNavigate={handleNavigate} />;
      case 'neckPreview':
        return <NeckPreview onNavigate={handleNavigate} />;
      case 'inCarPreview':
        return <InCarPreview onNavigate={handleNavigate} accessoryName={pageContext?.accessoryName} />;
      case 'neckAvatarPreview':
        return <NeckAvatarPreview onNavigate={handleNavigate} gender={gender} />;
      case 'shoesAvatarPreview':
        return <ShoesAvatarPreview onNavigate={handleNavigate} gender={gender} />;
      case 'connectDevice':
        return <ConnectDevice onNavigate={handleNavigate} />;
      case 'cart':
        return <Cart items={cart} onNavigate={handleNavigate} onCheckout={() => alert('Checkout simulation')} onRemove={removeFromCart} onUpdateQty={updateCartQty} openPayment={pageContext?.openPayment} />;
      case 'history':
        return <History onNavigate={handleNavigate} data={pageContext?.data} popups={pageContext?.popups} />;
      case 'aiRecommendations':
        return <AIRecommendations onNavigate={handleNavigate} healthHistory={pageContext?.healthHistory} onGenderChange={handleGenderChange} />;
      case 'dashboard':
        // Backward compatibility if something still navigates to 'dashboard'
        return <History onNavigate={handleNavigate} data={pageContext?.data} popups={pageContext?.popups} />;
      default:
        return <MainPage onNavigate={handleNavigate} onGenderChange={handleGenderChange} gender={gender} />;
    }
  };

  return (
    <div className="app">
      {currentPage === 'main' && (
        <button
          className="bluetooth-connect-btn"
          onClick={() => handleNavigate('connectDevice')}
          title="Connect your device"
          style={{ position:'absolute', top: 18, right: 24, zIndex: 20 }}
        >
          <span className="bt-icon" style={{ fontSize:'1.25rem', marginRight:8 }}>🔵</span>
          <span className="bt-label" style={{ fontWeight:600 }}>Connect your Device</span>
        </button>
      )}
      {renderPage()}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}

export default App
