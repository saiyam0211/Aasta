'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  RefreshCw,
  Calendar,
  PieChart,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentAnalytics {
  overview: {
    totalRevenue: number;
    platformRevenue: number;
    restaurantRevenue: number;
    totalTransactions: number;
    completedPayments: number;
    failedPayments: number;
    successRate: number;
    averageOrderValue: number;
    totalRefunds: number;
    refundCount: number;
  };
  paymentMethods: Array<{
    method: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  period: {
    start: string;
    end: string;
    period: string;
  };
}

export default function FinancialDashboard() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/payments?period=${period}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Financial Dashboard</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Dashboard</h2>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.overview.platformRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(analytics.overview.successRate)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.overview.averageOrderValue)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Transaction Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="font-bold">{analytics.overview.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-bold text-green-600">
                {analytics.overview.completedPayments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="font-bold text-red-600">
                {analytics.overview.failedPayments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Refunds</span>
              <span className="font-bold text-orange-600">
                {analytics.overview.refundCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.paymentMethods.map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{method.method}</span>
                  <span className="text-sm text-gray-600">
                    {formatPercentage(method.percentage)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${method.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatCurrency(method.revenue)}</span>
                  <span>{method.transactions} transactions</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Refund Information */}
      {analytics.overview.totalRefunds > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Refund Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(analytics.overview.totalRefunds)}
                </p>
                <p className="text-sm text-gray-600">Total Refunded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {analytics.overview.refundCount}
                </p>
                <p className="text-sm text-gray-600">Refund Count</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatPercentage(
                    (analytics.overview.totalRefunds / analytics.overview.totalRevenue) * 100
                  )}
                </p>
                <p className="text-sm text-gray-600">Refund Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.revenueByDay.slice(0, 10).map((day: any, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="font-bold">
                    {formatCurrency(Number(day.revenue))}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({day.transactions} orders)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
