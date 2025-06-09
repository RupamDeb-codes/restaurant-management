const API_BASE_URL = 'https://restaurant-management-backend-tw4c.onrender.com';

export interface DailySalesData {
  _id: string;
  totalSales: number;
}

export interface MostOrderedData {
  name: string;
  totalOrdered: number;
}

export interface CategoryRevenueData {
  _id: string;
  revenue: number;
}

export interface PeakHoursData {
  _id: number;
  orders: number;
}

// Helper function to add delay between retries
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generic fetch function with retry logic
async function fetchWithRetry<T>(endpoint: string): Promise<T> {
  const maxRetries = 3;
  const retryDelay = 2000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${endpoint}:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
      }
      
      const waitTime = retryDelay * attempt;
      await delay(waitTime);
    }
  }
  
  throw new Error('Unexpected error in fetchWithRetry');
}

export async function fetchDailySales(): Promise<DailySalesData[]> {
  return fetchWithRetry<DailySalesData[]>('/api/analytics/sales-daily');
}

export async function fetchMostOrdered(): Promise<MostOrderedData[]> {
  return fetchWithRetry<MostOrderedData[]>('/api/analytics/most-ordered');
}

export async function fetchCategoryRevenue(): Promise<CategoryRevenueData[]> {
  return fetchWithRetry<CategoryRevenueData[]>('/api/analytics/category-revenue');
}

export async function fetchPeakHours(): Promise<PeakHoursData[]> {
  return fetchWithRetry<PeakHoursData[]>('/api/analytics/peak-hours');
}