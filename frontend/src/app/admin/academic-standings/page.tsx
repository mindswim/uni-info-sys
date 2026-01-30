'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuthHeaders } from '@/lib/api-client';
import { Award, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

interface StandingSummary {
  good_standing: number;
  academic_probation: number;
  deans_list: number;
  academic_suspension: number;
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

export default function AcademicStandingsPage() {
  const [summary, setSummary] = useState<StandingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/academic-standings/summary`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch academic standings summary');
      }

      const data = await response.json();
      setSummary(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm('This will recalculate academic standings for all students. This may take several minutes. Continue?')) {
      return;
    }

    try {
      setRecalculating(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/academic-standings/recalculate-all`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to recalculate academic standings');
      }

      await fetchSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error recalculating standings:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const calculatePercentage = (count: number, total: number): string => {
    if (total === 0) return '0';
    return ((count / total) * 100).toFixed(1);
  };

  const summaryCards = summary
    ? [
        {
          title: 'Good Standing',
          value: summary.good_standing,
          description: 'Students in good academic standing',
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        },
        {
          title: 'Academic Probation',
          value: summary.academic_probation,
          description: 'Students on academic probation',
          icon: AlertTriangle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        },
        {
          title: 'Dean\'s List',
          value: summary.deans_list,
          description: 'Students on the dean\'s list',
          icon: Award,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        },
        {
          title: 'Academic Suspension',
          value: summary.academic_suspension,
          description: 'Students under academic suspension',
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        },
      ]
    : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Standings</h1>
            <p className="text-gray-600 mt-1">Monitor and manage student academic performance</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleRecalculateAll}
            disabled={recalculating || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {recalculating ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                Recalculating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Recalculate All
              </span>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && !summary ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading academic standings...</p>
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                const percentage = calculatePercentage(card.value, summary.total);
                return (
                  <Card key={card.title} className={`border-2 ${card.borderColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-sm font-medium text-gray-600">
                          {card.title}
                        </CardDescription>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <div className={`text-3xl font-bold ${card.color}`}>
                          {card.value.toLocaleString()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{card.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Total student academic standings distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="font-semibold text-gray-900">Total Students</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {summary.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {summaryCards.map((card) => {
                      const percentage = calculatePercentage(card.value, summary.total);
                      return (
                        <div key={card.title} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{card.title}</span>
                            <span className="font-medium text-gray-900">
                              {card.value.toLocaleString()} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${card.bgColor.replace('50', '500')}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
