"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isRequestDifferentSizeId } from "@/lib/custom-size";

export type InquiryItemKind = "catalog" | "pattern_request";

export type InquiryItem = {
  id: string;
  kind: InquiryItemKind;
  productId: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  yarnId: string;
  yarnName: string;
  yarnSwatchSrc: string;
  /** Gift / label tag chosen on the product page (catalog only) */
  tagId?: string;
  tagLabel?: string;
  pomPomId?: string;
  pomPomLabel?: string;
  /** Hero product photo for cart confirmation panel */
  productImageSrc?: string;
  quantity: number;
  /** When set, cart + control cannot raise quantity above this (from product config). */
  quantityMax?: number;
  unitPrice: number;
  /** Custom size or quote pending; not included in cart subtotal. */
  priceTbd?: boolean;
  patternName?: string;
  designerName?: string;
  patternUrl?: string | null;
};

export type CartDrawerView = "closed" | "added" | "checkout";

type InquiryCartContextValue = {
  items: InquiryItem[];
  itemCount: number;
  total: number;
  subtotalTbd: boolean;
  drawerView: CartDrawerView;
  lastAddedItemId: string | null;
  pairsWellWithProductIds: string[];
  addItem: (item: Omit<InquiryItem, "id">) => string;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  openAddedDrawer: (itemId: string, relatedProductIds?: string[]) => void;
  openCheckoutDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

const InquiryCartContext = createContext<InquiryCartContextValue | null>(null);

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function InquiryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [drawerView, setDrawerView] = useState<CartDrawerView>("closed");
  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);
  const [pairsWellWithProductIds, setPairsWellWithProductIds] = useState<
    string[]
  >([]);

  const addItem = useCallback((item: Omit<InquiryItem, "id">) => {
    let resultId = makeId();
    setItems((prev) => {
      const existing = prev.find(
        (p) =>
          p.kind === item.kind &&
          p.productId === item.productId &&
          p.sizeId === item.sizeId &&
          (isRequestDifferentSizeId(item.sizeId)
            ? p.sizeLabel === item.sizeLabel
            : true) &&
          p.yarnId === item.yarnId &&
          p.tagId === item.tagId &&
          p.pomPomId === item.pomPomId
      );
      if (existing) {
        resultId = existing.id;
        const cap = item.quantityMax ?? existing.quantityMax;
        const nextQty = existing.quantity + item.quantity;
        return prev.map((p) =>
          p.id === existing.id
            ? {
                ...p,
                quantity:
                  cap != null ? Math.min(cap, nextQty) : nextQty,
                quantityMax: cap ?? p.quantityMax,
                productImageSrc: item.productImageSrc ?? p.productImageSrc,
              }
            : p
        );
      }
      const newItem = { ...item, id: resultId };
      return [...prev, newItem];
    });
    return resultId;
  }, []);

  const openAddedDrawer = useCallback(
    (itemId: string, relatedProductIds: string[] = []) => {
      setLastAddedItemId(itemId);
      setPairsWellWithProductIds(relatedProductIds);
      setDrawerView("added");
    },
    []
  );

  const openCheckoutDrawer = useCallback(() => {
    setDrawerView("checkout");
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    if (!open) {
      setDrawerView("closed");
      setLastAddedItemId(null);
      setPairsWellWithProductIds([]);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity } : p))
        .filter((p) => p.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<InquiryCartContextValue>(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    const subtotalTbd = items.some((i) => i.priceTbd);
    const total = subtotalTbd
      ? 0
      : items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
    return {
      items,
      itemCount,
      total,
      subtotalTbd,
      drawerView,
      lastAddedItemId,
      pairsWellWithProductIds,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      openAddedDrawer,
      openCheckoutDrawer,
      setDrawerOpen,
    };
  }, [
    items,
    drawerView,
    lastAddedItemId,
    pairsWellWithProductIds,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    openAddedDrawer,
    openCheckoutDrawer,
    setDrawerOpen,
  ]);

  return (
    <InquiryCartContext.Provider value={value}>
      {children}
    </InquiryCartContext.Provider>
  );
}

export function useInquiryCart() {
  const ctx = useContext(InquiryCartContext);
  if (!ctx) {
    throw new Error("useInquiryCart must be used within InquiryCartProvider");
  }
  return ctx;
}
