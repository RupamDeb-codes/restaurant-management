const API_BASE_URL = 'https://restaurant-management-backend-tw4c.onrender.com';

export interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  tags: string[];
  ingredients: string[];
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemData {
  name: string;
  category: string;
  price: number;
  tags: string[];
  ingredients: string[];
  available: boolean;
}

export interface UpdateMenuItemData extends CreateMenuItemData {}

// Custom error class to handle HTTP errors
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

// Helper function to add delay between retries
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generic fetch function with retry logic
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<T> {
  const retryDelay = 2000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = new HttpError(response.status, `HTTP error! status: ${response.status}`);
        
        // Don't retry for 404 errors - the resource doesn't exist
        if (response.status === 404) {
          throw error;
        }
        
        throw error;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${url}:`, error);
      
      // If it's an HttpError with 404, don't retry
      if (error instanceof HttpError && error.status === 404) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        if (error instanceof HttpError) {
          throw error;
        }
        throw new Error(`Failed to fetch data from ${url}`);
      }
      
      const waitTime = retryDelay * attempt;
      await delay(waitTime);
    }
  }
  
  throw new Error('Unexpected error in fetchWithRetry');
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  return fetchWithRetry<MenuItem[]>(`${API_BASE_URL}/api/menu/admin/all`);
}

// ✅ FIXED: Changed from /api/menu/admin to /api/menu/add
export async function createMenuItem(data: CreateMenuItemData): Promise<MenuItem> {
  return fetchWithRetry<MenuItem>(`${API_BASE_URL}/api/menu/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(id: string, data: UpdateMenuItemData): Promise<MenuItem> {
  return fetchWithRetry<MenuItem>(`${API_BASE_URL}/api/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await fetchWithRetry(`${API_BASE_URL}/api/menu/${id}`, {
    method: 'DELETE',
  });
}

// Quick availability toggle function
export async function toggleMenuItemAvailability(id: string, available: boolean): Promise<MenuItem> {
  return fetchWithRetry<MenuItem>(`${API_BASE_URL}/api/menu/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ available }),
  });
}