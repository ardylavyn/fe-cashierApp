export interface RevenueChart {
  date: string;
  revenue: number;
}

export interface BestSellingProduct {
  product_id: number;
  name: string;
  image: string;
  price: string;
  total_sold: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  image: string;
  stock: number;
  price: string;
}

export interface DashboardStatistics {
  todays_revenue: number;
  todays_transactions: number;
  product_sold_today: number;

  revenue_chart: RevenueChart[];

  best_selling_products: BestSellingProduct[];

  low_stock_products: LowStockProduct[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStatistics;
}
