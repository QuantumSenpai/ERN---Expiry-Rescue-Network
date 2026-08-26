import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MarketplaceNavbar from "@/components/marketplace/MarketplaceNavbar";
import MarketplaceFooter from "@/components/marketplace/MarketplaceFooter";
import FloatingCart from "@/components/marketplace/FloatingCart";
import CartDrawer from "@/components/marketplace/CartDrawer";
import LocationModal from "@/components/marketplace/LocationModal";
import AccountSwitcherModal from "@/components/AccountSwitcherModal";
import MultiBatchModal from "@/components/marketplace/MultiBatchModal";
import { useCart } from "@/context/CartContext";
import { MASTER_PRODUCTS, type MarketplaceProduct, type ProductOffer } from "@/data/marketplaceData";

export default function MarketplaceLayout() {
  const navigate = useNavigate();
  const {
    cartItems,
    addToCart,
    updateQty,
    removeItem,
    totalCount,
    totalAmount,
    totalSavings,
    wishlist,
    isCartBouncing,
  } = useCart();

  // Search & Navigation State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("Central Warehouse / Main Branch");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedProductForMultiBatch, setSelectedProductForMultiBatch] = useState<MarketplaceProduct | null>(null);

  const handleAddToCart = (product: MarketplaceProduct, offer?: ProductOffer) => {
    addToCart(product, offer);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 selection:bg-primary selection:text-primary-foreground">
      {/* 1. STICKY MARKETPLACE NAVBAR */}
      <MarketplaceNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={MASTER_PRODUCTS}
        onSelectProduct={(p) => setSelectedProductForMultiBatch(p)}
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        wishlistCount={wishlist.size}
        cartItemCount={totalCount}
        cartTotal={totalAmount}
        isCartBouncing={isCartBouncing}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* 2. MAIN USER CONTENT CONTAINER */}
      <main className="flex-1 pb-12">
        <Outlet />
      </main>

      {/* 3. MARKETPLACE FOOTER */}
      <MarketplaceFooter />

      {/* 4. FLOATING CART PILL */}
      <FloatingCart
        itemCount={totalCount}
        totalAmount={totalAmount}
        totalSavings={totalSavings}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 5. CART SLIDE-OUT DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemoveItem={removeItem}
        totalAmount={totalAmount}
        totalSavings={totalSavings}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate("/customer/checkout");
        }}
      />

      {/* 6. MULTI-BATCH SELECTION MODAL */}
      <MultiBatchModal
        product={selectedProductForMultiBatch}
        onClose={() => setSelectedProductForMultiBatch(null)}
        onSelectBatch={handleAddToCart}
      />

      {/* 7. LOCATION SELECTOR MODAL */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
      />

      {/* 8. ACCOUNT SWITCHER MODAL */}
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}
