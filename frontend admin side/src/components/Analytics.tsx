import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { RefreshCw, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../hooks/useToast';
import {
  fetchDailySales,
  fetchMostOrdered,
  fetchCategoryRevenue,
  fetchPeakHours,
  DailySalesData,
  MostOrderedData,
  CategoryRevenueData,
  PeakHoursData
} from '../services/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export function Analytics() {
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [mostOrdered, setMostOrdered] = useState<MostOrderedData[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenueData[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHoursData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToast } = useToast();

  const loadAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [salesData, orderedData, revenueData, hoursData] = await Promise.all([
        fetchDailySales(),
        fetchMostOrdered(),
        fetchCategoryRevenue(),
        fetchPeakHours()
      ]);

      setDailySales(salesData);
      setMostOrdered(orderedData);
      setCategoryRevenue(revenueData);
      setPeakHours(hoursData);

      if (isRefresh) {
        addToast('success', 'Analytics data refreshed successfully');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const handleRefresh = () => {
    loadAnalyticsData(true);
  };

  // Chart configurations
  const dailySalesChartData = {
    labels: dailySales.map(item => formatDate(item._id)),
    datasets: [
      {
        label: 'Daily Sales',
        data: dailySales.map(item => item.totalSales),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const mostOrderedChartData = {
    labels: mostOrdered.map(item => item.name),
    datasets: [
      {
        label: 'Orders',
        data: mostOrdered.map(item => item.totalOrdered),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const categoryRevenueChartData = {
    labels: categoryRevenue.map(item => item._id),
    datasets: [
      {
        data: categoryRevenue.map(item => item.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const peakHoursChartData = {
    labels: peakHours.map(item => formatHour(item._id)),
    datasets: [
      {
        label: 'Orders',
        data: peakHours.map(item => item.orders),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Restaurant performance insights</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Error loading analytics data</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => loadAnalyticsData()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Sales</h3>
                <p className="text-sm text-gray-600">Revenue over the past week</p>
              </div>
            </div>
            <div className="h-80">
              {dailySales.length > 0 ? (
                <Bar data={dailySalesChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Most Ordered Dishes */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Most Ordered Dishes</h3>
                <p className="text-sm text-gray-600">Top 5 popular items</p>
              </div>
            </div>
            <div className="h-80">
              {mostOrdered.length > 0 ? (
                <Bar 
                  data={mostOrderedChartData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y' as const,
                  }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No order data available
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
                <p className="text-sm text-gray-600">Income distribution by food type</p>
              </div>
            </div>
            <div className="h-80">
              {categoryRevenue.length > 0 ? (
                <Doughnut data={categoryRevenueChartData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Peak Ordering Hours */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Peak Ordering Hours</h3>
                <p className="text-sm text-gray-600">Busiest times of the day</p>
              </div>
            </div>
            <div className="h-80">
              {peakHours.length > 0 ? (
                <Line data={peakHoursChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hourly data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(categoryRevenue.reduce((sum, item) => sum + item.revenue, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">
                  {mostOrdered.reduce((sum, item) => sum + item.totalOrdered, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Daily Sales</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dailySales.length > 0 ? dailySales.reduce((sum, item) => sum + item.totalSales, 0) / dailySales.length : 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-xl font-bold text-gray-900">
                  {peakHours.length > 0 
                    ? formatHour(peakHours.reduce((max, item) => item.orders > max.orders ? item : max, peakHours[0])._id)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}