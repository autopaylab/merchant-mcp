export type Currency = "PLN" | "EUR" | "USD";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: Currency;
  availability: boolean;
  category: string;
  image_url?: string;
}

export interface GetCatalogParams {
  merchant_id: string;
  category?: string;
  limit: number;
}

export type CatalogResult = Product[];

export interface CheckoutItem {
  sku: string;
  quantity: number;
}

export interface CreateCheckoutParams {
  merchant_id: string;
  items: CheckoutItem[];
  buyer_token?: string;
  return_url?: string;
  currency: Currency;
}

export interface LineItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CheckoutSession {
  session_id: string;
  checkout_url: string;
  expires_at: string;
  status: "pending";
  total_amount: number;
  currency: string;
  line_items: LineItem[];
}

export interface StatusParams {
  session_id: string;
}

export type TransactionStatusCode = "pending" | "completed" | "failed" | "expired";

export interface TransactionStatus {
  session_id: string;
  status: TransactionStatusCode;
  merchant_id: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  failure_reason?: string;
}

export interface MerchantAdapter {
  getCatalog(params: GetCatalogParams): Promise<CatalogResult>;
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
  getTransactionStatus(params: StatusParams): Promise<TransactionStatus>;
}
