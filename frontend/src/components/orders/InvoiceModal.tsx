import { X, Printer, Download, Leaf, ShieldCheck } from "lucide-react";
import type { Order } from "@/data/ordersData";

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-foreground space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <Leaf className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-foreground">
                TAX INVOICE / RESCUE RECEIPT
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                ERN — Expiry Rescue Network India Pvt. Ltd.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-110 active:scale-95"
            aria-label="Close invoice"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-secondary border border-border font-mono text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Invoice No</span>
            <span className="font-bold text-foreground">INV-{order.id.replace("ERN-", "")}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Order ID</span>
            <span className="font-bold text-foreground">{order.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Date & Time</span>
            <span className="text-foreground">{order.orderDateSimple}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Payment Method</span>
            <span className="font-bold text-[#10B981]">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Billed To & Shipped To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-secondary border border-border">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block mb-1">
              Billed & Shipped To:
            </span>
            <p className="font-bold text-foreground">{order.shippingAddress.recipientName}</p>
            <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
            <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-muted-foreground font-mono mt-1">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary border border-border flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block mb-1">
                Fulfillment Facility:
              </span>
              <p className="font-bold text-foreground">Central Warehouse Logistics Hub</p>
              <p className="text-muted-foreground">Gate 2, MIDC Industrial Corridor, Mumbai 400093</p>
              <p className="text-muted-foreground font-mono mt-1">GSTIN: 27AABCE1234F1Z5</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-mono font-bold mt-2">
              <ShieldCheck className="size-3.5" />
              <span>Verified Batch Quality Checked</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-border rounded-2xl overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-secondary border-b border-border text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Item & Expiry Tier</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Discount</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/40">
                  <td className="p-3 font-sans">
                    <p className="font-bold text-foreground text-xs">{item.name}</p>
                    <p className="text-[10px] font-mono text-amber-500">
                      {item.batchType} &bull; {item.shelfLifeAtPurchase}
                    </p>
                  </td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right text-muted-foreground">₹{item.originalPrice}</td>
                  <td className="p-3 text-right text-emerald-500 font-semibold">-₹{item.savings}</td>
                  <td className="p-3 text-right font-bold text-foreground">
                    ₹{item.paidPrice * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="p-4 rounded-2xl bg-secondary border border-border space-y-1.5 font-mono text-xs max-w-xs ml-auto">
          <div className="flex justify-between text-muted-foreground">
            <span>Items Subtotal:</span>
            <span className="text-foreground">₹{order.itemsSubtotal}</span>
          </div>
          <div className="flex justify-between text-[#10B981]">
            <span>Total ERN Discount:</span>
            <span>-₹{order.ernDiscount}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee:</span>
            <span className="text-foreground">{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxes (GST 0% Included):</span>
            <span className="text-muted-foreground">₹0</span>
          </div>
          <div className="flex justify-between text-foreground font-bold text-sm pt-2 border-t border-border">
            <span>Total Paid:</span>
            <span className="text-[#10B981]">₹{order.totalPaid}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="size-3.5" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => {
              alert(`Downloading Invoice for ${order.id}...`);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-foreground font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#10B981]/20"
          >
            <Download className="size-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
