export type PackagingType = 'ROLL' | 'REAM' | 'SKID' | 'BOX';
export type OfficialPriceType = 'NONE' | 'MANUAL' | 'RETAIL' | 'WHOLESALE';
export type ShippingType = 'DELIVERY' | 'PICKUP' | 'STORE';
export type StockEventStatus = 'NORMAL' | 'CANCELLED' | 'PENDING';
export type TaskType = 'CONVERTING' | 'GUILLOTINE';
export type DiscountType = 'DEFAULT' | 'SPECIAL';

export interface List<T> {
  items: T[];
  count: number;
}

export type BusinessRelationshipRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED';

export type OrderStatus =
  | 'PREPARING'
  | 'CANCELLED'
  | 'ESTIMATE'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED';

export interface StaticData {
  product: Product[];
  paperColorGroup: PaperColorGroup[];
  paperColor: PaperColor[];
  paperPattern: PaperPattern[];
  paperCert: PaperCert[];
  packaging: Packaging[];
}

export interface User {
  id: number;
  companyId: number;
  username: string;
  name: string;
  email: string | null;
}

export interface Warehouse {
  id: number;
  name: string;
  isPublic: boolean;
  address: string;
}

export interface WarehouseStats {
  publicCount: number;
  privateCount: number;
}

export interface Location {
  id: number;
  name: string;
  isPublic: boolean;
  address: string;
}

export interface LocationStats {
  publicCount: number;
  privateCount: number;
}

export interface PaperDomain {
  id: number;
  name: string;
}

export interface Manufacturer {
  id: number;
  name: string;
}

export interface PaperGroup {
  id: number;
  name: string;
}

export interface PaperType {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  paperDomain: PaperDomain;
  manufacturer: Manufacturer;
  paperGroup: PaperGroup;
  paperType: PaperType;
}

export interface PaperColorGroup {
  id: number;
  name: string;
}

export interface PaperColor {
  id: number;
  name: string;
}

export interface PaperPattern {
  id: number;
  name: string;
}

export interface PaperCert {
  id: number;
  name: string;
}

export interface Packaging {
  id: number;
  name: string;
  type: PackagingType;
  packA: number;
  packB: number;
}

export interface Stock {
  id: number;
  serial: string;
  warehouse: Warehouse | null;
  product: Product;
  packaging: Packaging;
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroup: PaperColorGroup | null;
  paperColor: PaperColor | null;
  paperPattern: PaperPattern | null;
  paperCert: PaperCert[];
  officialPriceType: OfficialPriceType;
  officialPrice: number;
  discountType: DiscountType;
  stockPrice: number;
  cachedQuantity: number;
  cachedQuantityAvailable: number;
}

export interface StockEvent {
  id: number;
  status: StockEventStatus;
  stock: Stock;
}
export interface VendorStock {
  id: number;
  company: Company;
  warehouse: Warehouse | null;
  product: Product;
  packaging: Packaging;
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroup: PaperColorGroup | null;
  paperColor: PaperColor | null;
  paperPattern: PaperPattern | null;
  paperCert: PaperCert[];
  officialPriceType: OfficialPriceType;
  officialPrice: number;
  discountType: DiscountType;
  stockPrice: number;
  cachedQuantity: number;
  cachedQuantityAvailable: number;
}

export interface TradePrice {
  orderStockId: number;
  companyId: number;
  officialPriceType: OfficialPriceType;
  officialPrice: number;
  discountType: DiscountType;
  stockPrice: number;
}

export interface StockStats {
  stockCount: number;
  exstoreStockCount: number;
}

export interface BusinessRelationship {
  srcCompany: Company;
  dstCompany: Company;
}

export interface BusinessRelationshipStats {
  count: number;
  virtualCount: number;
}

export interface Company {
  id: number;
  businessName: string;
  companyRegistrationNumber: string;
  phoneNo: string;
  faxNo: string;
  managedById: number | null;
}

export interface VirtualCompanyStats {
  count: number;
}

export interface BusinessRelationshipRequest {
  srcCompany: Company;
  dstCompany: Company;
  status: BusinessRelationshipRequestStatus;
  memo: string;
}

export interface BusinessRelationshipRequestStats {
  pendingCount: number;
}

export interface Order {
  id: number;
  orderNo: string;
  srcCompany: Company;
  dstCompany: Company;
  status: OrderStatus;
  memo: string;
  wantedDate: string | null;
  isEntrusted: boolean;
}

export interface OrderStats {
  preparingCount: number;
}

export interface OrderStock {
  id: number;
  order: Order;
  product: Product;
  packaging: Packaging;
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroup: PaperColorGroup | null;
  paperColor: PaperColor | null;
  paperPattern: PaperPattern | null;
  paperCert: PaperCert[];
  quantity: number;
  memo: string;
  dstLocation: Location | null;
  tradePrice: TradePrice[];
  plan: Plan | null;
}

export type PlanStatus =
  | 'PREPARING'
  | 'PROGRESSING'
  | 'PROGRESSED'
  | 'RELEASED';

export interface Plan {
  id: number;
  planNo: string;
  company: Company;
  stockEventIn: StockEvent[];
  createdAt: string;
  status: PlanStatus;
}

export interface PlanStats {
  count: number;
}

export interface Task {
  id: number;
  taskNo: string;
  type: TaskType;
  taskConverting: TaskConverting | null;
  taskGuillotine: TaskGuillotine | null;
}

export interface TaskStats {
  count: number;
}

export interface TaskDetail extends Task {
  plan: Plan;
}

export interface TaskConverting {
  taskId: number;
  sizeX: number;
  sizeY: number;
  memo: string;
}

export interface TaskGuillotine {
  taskId: number;
  sizeX: number;
  sizeY: number;
  memo: string;
}

export interface Shipping {
  id: number;
  shippingNo: string;
  company: Company;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  shipping: Shipping;
  stockEvent: StockEvent;
}
