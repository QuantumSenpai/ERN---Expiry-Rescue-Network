import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles,
  MapPin,
  Truck,
  CreditCard,
  Zap,
  Clock,
  Plus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  X,
  Store,
  AlertTriangle,
  Edit2,
  Trash2,
  Phone,
  User,
  Building,
  Info,
} from "lucide-react";
import { useCart, type SavedAddress } from "@/context/CartContext";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";

export default function CustomerCheckout() {
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
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    deliveryOptions,
    selectedDeliveryId,
    setSelectedDeliveryId,
    selectedDelivery,
    paymentMethods,
    selectedPaymentId,
    setSelectedPaymentId,
    validateCart,
    createOrder,
  } = useCart();

  // 3-Step Indicator: 1 = Delivery, 2 = Payment, 3 = Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    type: "Home" as "Home" | "Office" | "Warehouse",
    tagline: "Primary Residence",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

function isValidLuhn(val: string): boolean {
  const sanitized = val.replace(/\D/g, "");
  if (sanitized.length !== 16) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(val: string): boolean {
  const match = val.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(`20${match[2]}`, 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

  // Mock Payment Sub-inputs
  const [upiId, setUpiId] = useState("customer@oksbi");
  const [upiError, setUpiError] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState("Rohan Sharma");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("452");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formatted);
    if (cardErrors.number) {
      setCardErrors((prev) => ({ ...prev, number: "" }));
    }
  };

  const handleExpiryChange = (val: string) => {
    let cleaned = val.replace(/[^\d/]/g, "");
    const digits = cleaned.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      cleaned = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      cleaned = digits;
    }
    setCardExpiry(cleaned);
    if (cardErrors.expiry) {
      setCardErrors((prev) => ({ ...prev, expiry: "" }));
    }
  };

  const handleCvvChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setCardCvv(digits);
    if (cardErrors.cvv) {
      setCardErrors((prev) => ({ ...prev, cvv: "" }));
    }
  };

  // Place Order Loading State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deliveryFee = selectedDelivery.fee;
  const grandTotal = totalAmount + deliveryFee;

  // Address Form Actions
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      recipientName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "",
      type: "Home",
      tagline: "Home Delivery Address",
      isDefault: addresses.length === 0,
    });
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      recipientName: addr.recipientName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      tagline: addr.tagline,
      isDefault: addr.isDefault,
    });
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!addressForm.recipientName.trim()) {
      errors.recipientName = "Full name is required";
    }
    const cleanPhone = addressForm.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!addressForm.addressLine1.trim()) {
      errors.addressLine1 = "Street address / building name is required";
    }
    if (!addressForm.city.trim()) {
      errors.city = "City is required";
    }
    const cleanPin = addressForm.pincode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      errors.pincode = "Please enter a valid 6-digit PIN code";
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
      showToast("Address updated successfully");
    } else {
      const created = addAddress(addressForm);
      setSelectedAddressId(created.id);
      showToast("New delivery address added");
    }

    setIsAddressModalOpen(false);
  };

  // Step Validation & Progression
  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      showToast("Please select or add a delivery address");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToReview = () => {
    if (selectedPaymentId === "upi") {
      if (!upiId.includes("@") || upiId.length < 4) {
        setUpiError("Please enter a valid UPI ID (e.g. yourname@upi)");
        return;
      }
      setUpiError("");
    } else if (selectedPaymentId === "card") {
      const errors: Record<string, string> = {};
      if (!cardName.trim() || cardName.trim().length < 2) {
        errors.name = "Full name on card is required";
      }
      const rawCard = cardNumber.replace(/\D/g, "");
      if (rawCard.length !== 16 || !isValidLuhn(rawCard)) {
        errors.number = "Please enter a valid 16-digit card number (Luhn verified)";
      }
      if (!isValidExpiry(cardExpiry)) {
        errors.expiry = "Valid MM/YY required (unexpired)";
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        errors.cvv = "3 or 4-digit CVV required";
      }
      setCardErrors(errors);
      if (Object.keys(errors).length > 0) {
        showToast("Please correct card details before continuing");
        return;
      }
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      showToast("Your cart is empty. Please add items to checkout.");
      navigate("/marketplace");
      return;
    }

    if (selectedPaymentId === "card") {
      const rawCard = cardNumber.replace(/\D/g, "");
      if (rawCard.length !== 16 || !isValidLuhn(rawCard) || !isValidExpiry(cardExpiry) || !/^\d{3,4}$/.test(cardCvv)) {
        showToast("Invalid card information. Please update payment details.");
        setCurrentStep(2);
        return;
      }
    }

    // Run live cart validation
    const validation = validateCart();
    if (!validation.isValid) {
      showToast("Some items in your cart have changed. Please review your cart.");
      navigate("/customer/cart");
      return;
    }

    setIsPlacingOrder(true);
    setLoadingText("Verifying batch inventory & shelf life...");

    setTimeout(() => {
      setLoadingText("Generating verified ERN rescue order pass...");
    }, 900);

    setTimeout(() => {
      createOrder();
      setIsPlacingOrder(false);
      navigate("/customer/order-success");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-6 px-4 sm:px-6 lg:px-8 font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-2xl text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link to="/marketplace" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="size-3.5" />
            <span>Marketplace</span>
          </Link>
          <span>/</span>
          <Link to="/customer/cart" className="hover:text-foreground transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Checkout</span>
        </nav>

        {/* Checkout Header & Steps Indicator */}
        <div className="space-y-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Customer Checkout
          </h1>

          {/* 3-Step Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-mono">
              {/* Step 1: Delivery */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  currentStep === 1
                    ? "text-primary font-bold"
                    : currentStep > 1
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === 1
                      ? "bg-primary text-primary-foreground"
                      : currentStep > 1
                      ? "bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {currentStep > 1 ? "✓" : "1"}
                </div>
                <span>1. Delivery</span>
              </button>

              <span className="text-border">──────</span>

              {/* Step 2: Payment */}
              <button
                type="button"
                onClick={() => {
                  if (selectedAddress) setCurrentStep(2);
                }}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  currentStep === 2
                    ? "text-primary font-bold"
                    : currentStep > 2
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === 2
                      ? "bg-primary text-primary-foreground"
                      : currentStep > 2
                      ? "bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {currentStep > 2 ? "✓" : "2"}
                </div>
                <span>2. Payment</span>
              </button>

              <span className="text-border">──────</span>

              {/* Step 3: Review */}
              <button
                type="button"
                onClick={() => {
                  if (selectedAddress) setCurrentStep(3);
                }}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  currentStep === 3 ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === 3
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span>3. Review Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty Cart Warning */}
        {cartItems.length === 0 ? (
          <div className="py-16 px-4 max-w-md mx-auto text-center rounded-3xl bg-card border border-border space-y-4 shadow-sm">
            <div className="size-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
              <Sparkles className="size-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Your cart is empty
            </h2>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Please add fresh products or rescue clearance deals before proceeding to checkout.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase hover:bg-primary/90 transition-all shadow-sm"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          /* Main 2-Column Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Active Step Details (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* ══════════════════════════════════════════ */}
              {/* STEP 1: DELIVERY ADDRESS & METHOD         */}
              {/* ══════════════════════════════════════════ */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Delivery Address Section */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
                            1. Select Delivery Address
                          </h2>
                          <p className="text-xs text-muted-foreground font-sans">
                            Choose where you want your grocery order delivered
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddAddress}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs font-bold transition-colors cursor-pointer border border-border"
                      >
                        <Plus className="size-3.5" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    {/* Saved Addresses Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-2 ${
                              isSelected
                                ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs"
                                : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px] font-mono font-bold uppercase">
                                  {addr.type}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditAddress(addr);
                                  }}
                                  className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Edit Address"
                                >
                                  <Edit2 className="size-3" />
                                </button>
                                {addresses.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAddress(addr.id);
                                      showToast("Address removed");
                                    }}
                                    className="p-1 rounded-md text-muted-foreground hover:text-destructive cursor-pointer"
                                    title="Delete Address"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-0.5 text-xs font-sans">
                              <p className="font-bold text-foreground">{addr.recipientName}</p>
                              <p className="text-muted-foreground line-clamp-2">
                                {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ""}{addr.city} - {addr.pincode}
                              </p>
                              <p className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center gap-1">
                                <Phone className="size-3" />
                                <span>{addr.phone}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Speed / Fulfillment Method */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Truck className="size-4" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
                          Delivery Method
                        </h2>
                        <p className="text-xs text-muted-foreground font-sans">
                          Select standard delivery, express dispatch, or instant store pickup
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      {deliveryOptions.map((opt) => {
                        const isSelected = selectedDeliveryId === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedDeliveryId(opt.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                              isSelected
                                ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs"
                                : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{opt.title}</span>
                              {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                            </div>

                            <p className="text-[11px] text-muted-foreground font-sans">{opt.subtitle}</p>

                            <div className="pt-2 border-t border-border flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">{opt.duration}</span>
                              <span className="font-bold text-foreground">
                                {opt.fee === 0 ? "FREE" : formatINR(opt.fee)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 1 Action CTA */}
                  <div className="flex justify-end pt-2 font-mono">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>CONTINUE TO PAYMENT</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════ */}
              {/* STEP 2: PAYMENT METHOD                    */}
              {/* ══════════════════════════════════════════ */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <CreditCard className="size-4" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
                            2. Choose Payment Method
                          </h2>
                          <p className="text-xs text-muted-foreground font-sans">
                            Select UPI, Credit/Debit Card, or Cash on Delivery
                          </p>
                        </div>
                      </div>

                      {/* Demo Payment Notice */}
                      <span className="px-3 py-1 rounded-full bg-secondary text-foreground text-[10.5px] font-mono font-medium border border-border">
                        Demo Simulation Active
                      </span>
                    </div>

                    {/* Payment Mode Selector Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      {paymentMethods.map((pm) => {
                        const isSelected = selectedPaymentId === pm.id;
                        return (
                          <div
                            key={pm.id}
                            onClick={() => setSelectedPaymentId(pm.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                              isSelected
                                ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs"
                                : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{pm.title}</span>
                              {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-sans">{pm.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sub-form based on selected payment */}
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3 font-sans text-xs">
                      {selectedPaymentId === "upi" && (
                        <div className="space-y-2">
                          <label className="font-mono font-bold text-foreground uppercase text-[11px] block">
                            Enter UPI ID (Google Pay, PhonePe, Paytm, BHIM)
                          </label>
                          <div className="flex gap-2 max-w-md">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="username@okhdfcbank"
                              className="flex-1 p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-mono text-xs"
                            />
                          </div>
                          {upiError && <p className="text-destructive font-mono text-[11px]">{upiError}</p>}
                          <p className="text-[11px] text-muted-foreground">
                            A demo payment request notification will be simulated upon placing order.
                          </p>
                        </div>
                      )}

                      {selectedPaymentId === "card" && (
                        <div className="space-y-3 max-w-md">
                          <div>
                            <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                              Name on Card
                            </label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => {
                                setCardName(e.target.value);
                                if (cardErrors.name) setCardErrors((prev) => ({ ...prev, name: "" }));
                              }}
                              className={`w-full p-2.5 rounded-xl bg-background border ${cardErrors.name ? "border-destructive" : "border-border"} focus:border-primary text-foreground outline-none font-mono text-xs`}
                            />
                            {cardErrors.name && <p className="text-destructive font-mono text-[10.5px] mt-1">{cardErrors.name}</p>}
                          </div>

                          <div>
                            <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              className={`w-full p-2.5 rounded-xl bg-background border ${cardErrors.number ? "border-destructive" : "border-border"} focus:border-primary text-foreground outline-none font-mono text-xs`}
                            />
                            {cardErrors.number && <p className="text-destructive font-mono text-[10.5px] mt-1">{cardErrors.number}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-3 font-mono">
                            <div>
                              <label className="font-bold text-foreground uppercase text-[11px] block mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => handleExpiryChange(e.target.value)}
                                placeholder="MM/YY"
                                className={`w-full p-2.5 rounded-xl bg-background border ${cardErrors.expiry ? "border-destructive" : "border-border"} focus:border-primary text-foreground outline-none text-xs`}
                              />
                              {cardErrors.expiry && <p className="text-destructive font-mono text-[10.5px] mt-1">{cardErrors.expiry}</p>}
                            </div>
                            <div>
                              <label className="font-bold text-foreground uppercase text-[11px] block mb-1">
                                CVV
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => handleCvvChange(e.target.value)}
                                className={`w-full p-2.5 rounded-xl bg-background border ${cardErrors.cvv ? "border-destructive" : "border-border"} focus:border-primary text-foreground outline-none text-xs`}
                              />
                              {cardErrors.cvv && <p className="text-destructive font-mono text-[10.5px] mt-1">{cardErrors.cvv}</p>}
                            </div>
                          </div>
                          <p className="text-[10.5px] text-muted-foreground">
                            Demo sandbox mode: card info is validated via Luhn checksum and kept in local component memory.
                          </p>
                        </div>
                      )}

                      {selectedPaymentId === "cod" && (
                        <div className="space-y-1">
                          <p className="font-bold text-foreground">Cash on Delivery Available</p>
                          <p className="text-muted-foreground">
                            Please keep exact cash ({formatINR(grandTotal)}) ready for contactless handover at delivery time.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2 Action CTAs */}
                  <div className="flex items-center justify-between pt-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                      ← Back to Delivery
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToReview}
                      className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>REVIEW ORDER</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════ */}
              {/* STEP 3: REVIEW ORDER & CONFIRMATION       */}
              {/* ══════════════════════════════════════════ */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Summary Cards of Steps 1 & 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Delivery Summary */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-2 text-xs font-sans">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="font-mono font-bold text-foreground uppercase flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" />
                          <span>Delivery Details</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-mono font-bold text-primary hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                      <p className="font-bold text-foreground">{selectedAddress.recipientName}</p>
                      <p className="text-muted-foreground">
                        {selectedAddress.addressLine1}, {selectedAddress.city} - {selectedAddress.pincode}
                      </p>
                      <p className="font-mono text-muted-foreground text-[11px]">{selectedAddress.phone}</p>
                      <p className="font-mono text-[11px] text-primary font-medium pt-1">
                        Method: {selectedDelivery.title} ({selectedDelivery.duration})
                      </p>
                    </div>

                    {/* Payment Summary */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-2 text-xs font-sans">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="font-mono font-bold text-foreground uppercase flex items-center gap-1.5">
                          <CreditCard className="size-3.5 text-primary" />
                          <span>Payment Details</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs font-mono font-bold text-primary hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                      <p className="font-bold text-foreground">
                        {paymentMethods.find((p) => p.id === selectedPaymentId)?.title || "Selected Payment"}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedPaymentId === "upi" ? `UPI ID: ${upiId}` : selectedPaymentId === "card" ? `Card ending in •••• ${cardNumber.slice(-4)}` : "Pay on Delivery"}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10.5px] font-semibold mt-1">
                        Verified Simulation Ready
                      </span>
                    </div>
                  </div>

                  {/* Order Items Review */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
                        Ordered Items ({totalCount})
                      </h2>
                      <Link
                        to="/customer/cart"
                        className="text-xs font-mono font-bold text-primary hover:underline"
                      >
                        Edit Cart
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {cartItems.map((item, idx) => {
                        if (!item) return null;
                        const rawProduct = item.product || (item as any);
                        const product = {
                          id: rawProduct?.id || (item as any)?.productId || `prod-${idx}`,
                          name: rawProduct?.name || (item as any)?.title || "Grocery Item",
                          imageUrl:
                            rawProduct?.imageUrl ||
                            (item as any)?.imageUrl ||
                            (rawProduct as any)?.image ||
                            (item as any)?.image ||
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
                          mrp: Number(rawProduct?.mrp ?? (item as any)?.mrp ?? 0),
                          price: Number((rawProduct as any)?.price ?? (item as any)?.price ?? 0),
                        };

                        const rawOffer = item.selectedOffer || (item as any)?.offer || {};
                        const offer = {
                          id: rawOffer?.id || `offer-${product.id}-${idx}`,
                          batchNumber: rawOffer?.batchNumber || (item as any)?.batchNumber || `BAT-${idx + 1}`,
                          expiryDate: rawOffer?.expiryDate || (item as any)?.expiryDate || "",
                          price: Number(rawOffer?.price ?? product.price ?? 0),
                          mrp: Number(rawOffer?.mrp ?? product.mrp ?? rawOffer?.price ?? product.price ?? 0),
                          type: rawOffer?.type || (item as any)?.type || "Rescue Deal",
                        };

                        const hasValidDate = Boolean(offer.expiryDate && !isNaN(new Date(offer.expiryDate).getTime()));
                        const expiry = hasValidDate ? calculateExpiryStatus(offer.expiryDate) : null;

                        const safeMrp = offer.mrp || product.mrp || offer.price || 0;
                        const safeSellingPrice = offer.price ?? product.price ?? safeMrp;
                        const pricing = calculatePricing(safeMrp, {
                          sellingPrice: safeSellingPrice,
                        });
                        const quantity = Math.max(1, item.quantity || 1);

                        return (
                          <div
                            key={`${product.id}-${offer.id}-${idx}`}
                            className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border text-xs font-sans gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="size-12 rounded-xl object-contain bg-white border border-border p-1 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">{product.name}</p>
                                <p className="text-[11px] font-mono text-muted-foreground">
                                  {offer.type} • {hasValidDate && expiry ? expiry.expiryText : "Expiry date unavailable"} (Batch #{offer.batchNumber})
                                </p>
                              </div>
                            </div>

                            <div className="text-right font-mono shrink-0">
                              <p className="font-bold text-foreground">
                                {formatINR(pricing.sellingPrice * quantity)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatINR(pricing.sellingPrice)} × {quantity}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Place Order Actions */}
                  <div className="flex items-center justify-between pt-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                      ← Back to Payment
                    </button>

                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                    >
                      {isPlacingOrder ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>{loadingText}</span>
                        </>
                      ) : (
                        <>
                          <Check className="size-4" />
                          <span>PLACE RESCUE ORDER ({formatINR(grandTotal)})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Order Summary (4 cols) */}
            <aside className="lg:col-span-4 space-y-4 sticky top-24">
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-md space-y-5">
                <h3 className="font-display font-bold text-lg text-foreground pb-3 border-b border-border">
                  Order Summary
                </h3>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Items Total ({totalCount} items):</span>
                    <span>{formatINR(originalTotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discounted Subtotal:</span>
                    <span className="text-foreground font-semibold">{formatINR(totalAmount)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3" />
                        <span>Rescue Savings:</span>
                      </span>
                      <span>-{formatINR(totalSavings)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Delivery Fee:</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                      ) : (
                        formatINR(deliveryFee)
                      )}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="pt-3 border-t border-border flex items-baseline justify-between">
                    <div>
                      <span className="font-sans font-bold text-base text-foreground block">
                        Total Payable:
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Inclusive of all taxes
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold font-sans text-foreground">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Assurance Highlights */}
                <div className="pt-3 border-t border-border space-y-2.5 text-[11px] font-sans text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                    <span>Quality & Expiry Guarantee</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed">
                    Every batch has verified shelf life timestamps. Zero expired items are ever fulfilled.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs font-body animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close address modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                  />
                  {addressErrors.recipientName && (
                    <p className="text-destructive font-mono text-[10px] mt-0.5">{addressErrors.recipientName}</p>
                  )}
                </div>

                <div>
                  <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-mono"
                  />
                  {addressErrors.phone && (
                    <p className="text-destructive font-mono text-[10px] mt-0.5">{addressErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                  Flat, House No., Building Name *
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 402, Green Valley Apts"
                  className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                />
                {addressErrors.addressLine1 && (
                  <p className="text-destructive font-mono text-[10px] mt-0.5">{addressErrors.addressLine1}</p>
                )}
              </div>

              <div>
                <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                  Street, Area, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  placeholder="e.g. 12th Main Road, Indiranagar"
                  className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                  />
                  {addressErrors.city && (
                    <p className="text-destructive font-mono text-[10px] mt-0.5">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-foreground uppercase text-[11px] block mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="560038"
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-mono"
                  />
                  {addressErrors.pincode && (
                    <p className="text-destructive font-mono text-[10px] mt-0.5">{addressErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 font-mono text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addrType"
                    checked={addressForm.type === "Home"}
                    onChange={() => setAddressForm({ ...addressForm, type: "Home" })}
                    className="accent-primary"
                  />
                  <span>Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addrType"
                    checked={addressForm.type === "Office"}
                    onChange={() => setAddressForm({ ...addressForm, type: "Office" })}
                    className="accent-primary"
                  />
                  <span>Office</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border font-mono">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
