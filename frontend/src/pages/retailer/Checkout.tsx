import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles,
  MapPin,
  Truck,
  CreditCard,
  Zap,
  Coins,
  Wallet,
  Clock,
  Plus,
  Lock,
  ArrowRight,
  Loader2,
  Leaf,
} from "lucide-react";
import { useCart, type SavedAddress } from "@/context/CartContext";

export default function RetailerCheckout() {
  const navigate = useNavigate();
  const {
    cartItems,
    totalCount,
    totalAmount,
    totalSavings,
    originalTotal,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    selectedAddress,
    deliveryOptions,
    selectedDeliveryId,
    setSelectedDeliveryId,
    selectedDelivery,
    paymentMethods,
    selectedPaymentId,
    setSelectedPaymentId,
    createOrder,
  } = useCart();

  // Step indicator state (1: Cart, 2: Delivery, 3: Payment, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(2);

  // Address modal / edit state
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    recipientName: "Alex",
    type: "Office" as const,
    tagline: "Retail Outlet Annex",
    addressLine1: "",
    addressLine2: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    phone: "+91 ",
  });

  // Mock Payment Sub-inputs
  const [upiId, setUpiId] = useState("alex@okaxis");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("452");

  // Place Order Loading State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const finalPayable = totalAmount + selectedDelivery.fee;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      navigate("/marketplace");
      return;
    }

    setIsPlacingOrder(true);
    setLoadingText("Securing your rescue batch inventory...");

    setTimeout(() => {
      setLoadingText("Verifying quality checks & batch timestamps...");
    }, 800);

    setTimeout(() => {
      setLoadingText("Generating verified ERN rescue order pass...");
    }, 1600);

    setTimeout(() => {
      createOrder();
      setIsPlacingOrder(false);
      navigate("/customer/order-success");
    }, 2400);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* ─── CHECKOUT PROGRESS INDICATOR ─── */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 border border-border rounded-2xl bg-card/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-mono">
            {/* Step 1: Cart */}
            <div className="flex items-center gap-2 text-[#10B981]">
              <div className="size-6 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[11px] font-bold">
                ✓
              </div>
              <span className="font-bold hidden sm:inline">1. Cart Items</span>
            </div>

            <span className="text-[#10B981]">──────</span>

            {/* Step 2: Delivery */}
            <div
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 cursor-pointer ${
                currentStep >= 2 ? "text-[#10B981]" : "text-muted-foreground"
              }`}
            >
              <div
                className={`size-6 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                  currentStep >= 2
                    ? "bg-[#10B981] text-foreground border-[#10B981]"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="font-bold">2. Delivery</span>
            </div>

            <span
              className={currentStep >= 3 ? "text-[#10B981]" : "text-muted-foreground/60"}
            >
              ──────
            </span>

            {/* Step 3: Payment */}
            <div
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 cursor-pointer ${
                currentStep >= 3 ? "text-[#10B981]" : "text-muted-foreground"
              }`}
            >
              <div
                className={`size-6 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                  currentStep >= 3
                    ? "bg-[#10B981] text-foreground border-[#10B981]"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="font-bold">3. Payment</span>
            </div>

            <span
              className={currentStep >= 4 ? "text-[#10B981]" : "text-muted-foreground/60"}
            >
              ──────
            </span>

            {/* Step 4: Review */}
            <div
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-2 cursor-pointer ${
                currentStep >= 4 ? "text-[#10B981]" : "text-muted-foreground"
              }`}
            >
              <div
                className={`size-6 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                  currentStep >= 4
                    ? "bg-[#10B981] text-foreground border-[#10B981]"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                4
              </div>
              <span className="font-bold">4. Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CHECKOUT TWO-COLUMN LAYOUT ─── */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        {cartItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border max-w-lg mx-auto space-y-4 shadow-xl">
            <div className="size-16 rounded-full bg-secondary text-[#10B981] mx-auto flex items-center justify-center">
              <Leaf className="size-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Your Cart is Empty</h2>
            <p className="text-xs text-muted-foreground">
              Please add fresh products or rescue clearance deals from the
              marketplace before proceeding to checkout.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] text-foreground font-bold text-xs"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* LEFT COLUMN: DELIVERY ADDRESS, OPTIONS, PAYMENT & REVIEW    */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* ─── SECTION 1: DELIVERY ADDRESS CARD ─── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                      <MapPin className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                        1. Delivery Address
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Select fulfillment dispatch address
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingAddress(!isChangingAddress)}
                      className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer font-sans"
                    >
                      {isChangingAddress ? "Cancel" : "Change"}
                    </button>
                    <span className="text-muted-foreground">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(!isAddingAddress)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer font-sans flex items-center gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Add New</span>
                    </button>
                  </div>
                </div>

                {/* Address Selection List (if changing) */}
                {isChangingAddress ? (
                  <div className="space-y-3 pt-1">
                    {addresses.map((addr: SavedAddress) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setIsChangingAddress(false);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          selectedAddressId === addr.id
                            ? "bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]/40 shadow-xs"
                            : "bg-secondary border-border hover:border-[#10B981]/40"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#10B981]/20 text-[#10B981] text-[10px] font-mono font-bold">
                              {addr.type}
                            </span>
                            <span className="font-bold text-xs text-foreground">
                              {addr.recipientName}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground font-sans">
                              ({addr.tagline})
                            </span>
                          </div>
                          <p className="text-xs text-foreground font-sans">
                            {addr.addressLine1}, {addr.addressLine2}
                          </p>
                          <p className="text-xs text-muted-foreground font-sans">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            Phone: {addr.phone}
                          </p>
                        </div>

                        <div
                          className={`size-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedAddressId === addr.id
                              ? "bg-[#10B981] border-[#10B981] text-foreground"
                              : "border-border"
                          }`}
                        >
                          {selectedAddressId === addr.id && (
                            <Check className="size-3 stroke-[3]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Saved Address Display Card */
                  <div className="p-4 rounded-xl bg-secondary border border-border flex items-start justify-between gap-3 shadow-2xs">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#10B981]/20 text-[#10B981] text-[10px] font-mono font-bold">
                          {selectedAddress.type}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {selectedAddress.recipientName}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-sans">
                          ({selectedAddress.tagline})
                        </span>
                      </div>

                      <p className="text-xs text-foreground font-sans leading-relaxed">
                        {selectedAddress.addressLine1},{" "}
                        {selectedAddress.addressLine2}
                      </p>
                      <p className="text-xs text-muted-foreground font-sans">
                        {selectedAddress.city}, {selectedAddress.state} -{" "}
                        {selectedAddress.pincode}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Contact:{" "}
                        <span className="text-foreground font-medium">
                          {selectedAddress.phone}
                        </span>
                      </p>

                      <div className="pt-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[11px] font-mono text-[#10B981] font-semibold">
                          Deliver to this address
                        </span>
                      </div>
                    </div>

                    <div className="size-5 rounded-full bg-[#10B981] text-foreground flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  </div>
                )}

                {/* Add New Address Form Modal/Expander */}
                {isAddingAddress && (
                  <div className="p-4 rounded-xl bg-secondary border border-[#10B981]/40 space-y-3 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Add New Delivery Destination
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Recipient / Facility Name"
                        value={newAddressForm.recipientName}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            recipientName: e.target.value,
                          })
                        }
                        className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number (+91...)"
                        value={newAddressForm.phone}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            phone: e.target.value,
                          })
                        }
                        className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1 (Street, Sector)"
                        value={newAddressForm.addressLine1}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            addressLine1: e.target.value,
                          })
                        }
                        className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981] sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddressForm.city}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            city: e.target.value,
                          })
                        }
                        className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddressForm.pincode}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            pincode: e.target.value,
                          })
                        }
                        className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false);
                          alert("Address saved and selected for delivery!");
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#10B981] text-foreground font-bold text-xs cursor-pointer"
                      >
                        Save & Use Address
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── SECTION 2: DELIVERY OPTIONS ─── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="size-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Truck className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      2. Delivery Option
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Choose your preferred fulfillment speed
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {deliveryOptions.map((opt) => {
                    const isSelected = selectedDeliveryId === opt.id;
                    const isFree =
                      opt.fee === 0 ||
                      (opt.id === "standard" && totalAmount >= 500);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedDeliveryId(opt.id)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-3 relative ${
                          isSelected
                            ? "bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]/40 shadow-xs"
                            : "bg-secondary border-border hover:border-[#10B981]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="leading-tight">
                            <span className="font-display font-bold text-xs sm:text-sm text-foreground block">
                              {opt.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                              {opt.duration}
                            </span>
                          </div>

                          <div
                            className={`size-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#10B981] border-[#10B981] text-foreground"
                                : "border-border"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-[3]" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                          {opt.subtitle}
                        </p>

                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Charge:</span>
                          <span
                            className={`font-bold ${
                              isFree ? "text-[#10B981]" : "text-foreground"
                            }`}
                          >
                            {isFree ? "FREE" : `₹${opt.fee}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── SECTION 3: PAYMENT METHOD ─── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="size-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
                    <CreditCard className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      3. Payment Method
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Select your preferred simulated checkout method
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentId === method.id;

                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentId(method.id)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer space-y-3 ${
                          isSelected
                            ? "bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]/40 shadow-xs"
                            : "bg-secondary border-border hover:border-[#10B981]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-[#10B981]">
                              {method.id === "upi" && (
                                <Zap className="size-4" />
                              )}
                              {method.id === "card" && (
                                <CreditCard className="size-4" />
                              )}
                              {method.id === "cod" && (
                                <Coins className="size-4" />
                              )}
                              {method.id === "wallet" && (
                                <Wallet className="size-4" />
                              )}
                            </div>

                            <div className="leading-tight">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-foreground">
                                  {method.title}
                                </span>
                                {method.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-[9.5px] font-mono font-bold">
                                    {method.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground font-sans mt-0.5 block">
                                {method.description}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`size-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#10B981] border-[#10B981] text-foreground"
                                : "border-border"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-[3]" />
                            )}
                          </div>
                        </div>

                        {/* Interactive mock sub-inputs if method is selected */}
                        {isSelected && method.id === "upi" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-2 border-t border-border flex items-center gap-2 text-xs"
                          >
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="Enter UPI ID (e.g. mobile@upi)"
                              className="flex-1 p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981] font-mono"
                            />
                            <span className="px-3 py-2 rounded-lg bg-[#10B981]/15 text-[#10B981] font-mono font-bold text-[11px]">
                              Verified ✓
                            </span>
                          </div>
                        )}

                        {isSelected && method.id === "card" && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-2 border-t border-border grid grid-cols-3 gap-2 text-xs font-mono"
                          >
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="Card Number"
                              className="col-span-3 sm:col-span-2 p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                            />
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                            />
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              maxLength={3}
                              className="p-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-[#10B981]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── SECTION 4: ORDER REVIEW CONFIRMATION SUMMARY ─── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                      4. Order Review & Confirmation
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Verify final fulfillment parameters
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-secondary border border-border space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                      Delivery Address
                    </span>
                    <p className="font-bold text-foreground">
                      {selectedAddress.recipientName}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {selectedAddress.addressLine1}, {selectedAddress.city}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary border border-border space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                      Delivery Method
                    </span>
                    <p className="font-bold text-foreground">
                      {selectedDelivery.title}
                    </p>
                    <p className="text-[#10B981] font-mono">
                      {selectedDelivery.duration} &bull;{" "}
                      {selectedDelivery.fee === 0
                        ? "FREE"
                        : `₹${selectedDelivery.fee}`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary border border-border space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                      Payment Mode
                    </span>
                    <p className="font-bold text-foreground">
                      {
                        paymentMethods.find((p) => p.id === selectedPaymentId)
                          ?.title
                      }
                    </p>
                    <p className="text-muted-foreground">Zero transaction surcharge</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary border border-border space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                      Batch Summary
                    </span>
                    <p className="font-bold text-foreground">
                      {cartItems.length} Products &bull; {totalCount} Units
                    </p>
                    <p className="text-emerald-500 font-mono font-bold">
                      Saved ₹{totalSavings} in Expiry Discounts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* RIGHT COLUMN: ORDER SUMMARY, ERN SAVINGS & PRIMARY CTA      */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24">
              {/* ─── ERN PROMINENT SAVINGS CARD ─── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-[#0F291E] via-[#122B20] to-[#0A1A13] border border-[#10B981]/50 shadow-2xl relative overflow-hidden space-y-3 text-snow-white"
              >
                {/* Glow effect */}
                <div className="absolute top-0 right-0 size-32 bg-[#10B981]/20 blur-2xl rounded-full pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                      <Sparkles className="size-4 text-amber-400" />
                    </div>
                    <h3 className="font-display font-black text-sm text-snow-white tracking-wide uppercase">
                      Your ERN Savings
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-foreground text-[10.5px] font-mono font-black animate-pulse">
                    RESCUE REWARD
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="p-2 rounded-xl bg-[#2F4156]/40 border border-[#10B981]/40">
                    <span className="text-[9.5px] text-zinc-300 block font-sans">
                      Original MRP
                    </span>
                    <span className="font-bold text-xs text-zinc-300 line-through mt-0.5 block">
                      ₹{originalTotal}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#2F4156]/40 border border-[#10B981]/40">
                    <span className="text-[9.5px] text-zinc-300 block font-sans">
                      ERN Discount
                    </span>
                    <span className="font-bold text-xs text-rose-400 mt-0.5 block">
                      -₹{totalSavings}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#10B981]/20 border border-[#10B981]/50">
                    <span className="text-[9.5px] text-[#10B981] font-bold block font-sans">
                      You Save
                    </span>
                    <span className="font-black text-sm text-[#10B981] mt-0.5 block">
                      ₹{totalSavings}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-200 font-sans leading-relaxed">
                  🌱 By rescuing these {totalCount} grocery batches, you prevent
                  food waste write-offs while unlocking maximum daily savings.
                </p>
              </motion.div>

              {/* ─── ITEMS IN CART WITH BATCH DETAILS ─── */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-foreground">
                    Order Items ({totalCount})
                  </h4>
                  <Link
                    to="/marketplace"
                    className="text-[11px] font-bold text-[#10B981] hover:underline"
                  >
                    Edit Cart
                  </Link>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => {
                    const isRescue = item.selectedOffer.type === "Rescue Deal";
                    const isClearance =
                      item.selectedOffer.type === "Clearance";
                    const itemSavings =
                      item.selectedOffer.savings * item.quantity;

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedOffer.id}-${idx}`}
                        className="p-2.5 rounded-xl bg-secondary border border-border flex items-center justify-between gap-3"
                      >
                        <div className="size-12 rounded-lg overflow-hidden bg-card border border-border shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                isClearance
                                  ? "bg-rose-500 text-snow-white"
                                  : isRescue
                                  ? "bg-amber-500 text-foreground"
                                  : "bg-[#10B981]/20 text-[#10B981]"
                              }`}
                            >
                              {item.selectedOffer.type}
                            </span>
                            <span className="text-[9.5px] font-mono text-muted-foreground flex items-center gap-0.5">
                              <Clock className="size-2.5" />
                              <span>{item.selectedOffer.expiryText}</span>
                            </span>
                          </div>

                          <p className="font-bold text-xs text-foreground truncate mt-0.5">
                            {item.product.name}
                          </p>

                          <div className="flex items-baseline justify-between font-mono mt-0.5 text-[11px]">
                            <span className="text-foreground">
                              ₹{item.selectedOffer.price} &times;{" "}
                              {item.quantity}
                            </span>
                            {itemSavings > 0 && (
                              <span className="text-[10px] text-[#10B981] font-sans">
                                Saved ₹{itemSavings}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── PRICE BREAKDOWN CARD ─── */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xl space-y-3 font-mono">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-foreground font-sans">
                  Price Breakdown
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal:</span>
                    <span className="text-foreground">
                      ₹{totalAmount + totalSavings}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#10B981]">
                    <span>Total ERN Discount:</span>
                    <span>-₹{totalSavings}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee:</span>
                    <span
                      className={
                        selectedDelivery.fee === 0
                          ? "text-[#10B981] font-bold"
                          : "text-foreground"
                      }
                    >
                      {selectedDelivery.fee === 0
                        ? "FREE"
                        : `₹${selectedDelivery.fee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & GST:</span>
                    <span className="text-muted-foreground">₹0 (Included in MRP)</span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-baseline text-foreground">
                    <span className="font-bold text-sm font-sans">
                      Total Payable:
                    </span>
                    <span className="font-black text-lg text-[#10B981]">
                      ₹{finalPayable}
                    </span>
                  </div>
                </div>

                {/* ─── PRIMARY CTA: PLACE ORDER ─── */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cartItems.length === 0}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-bold text-sm font-sans transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                    isPlacingOrder
                      ? "bg-[#10B981]/70 text-foreground cursor-wait"
                      : "bg-[#10B981] hover:bg-[#10B981]/90 text-foreground shadow-[#10B981]/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  }`}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin" />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order &bull; ₹{finalPayable}</span>
                      <ArrowRight className="size-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-muted-foreground font-sans text-center mt-1">
                  🔒 Zero-risk simulated checkout. No real payment charged.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
