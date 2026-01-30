'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

interface Installment {
  id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
}

interface PaymentPlan {
  id: number;
  invoice_id: number;
  total_amount: number;
  installment_count: number;
  start_date: string;
  status: 'active' | 'completed' | 'cancelled';
  installments: Installment[];
}

interface PaymentPlanDetailsProps {
  planId: number;
}

export function PaymentPlanDetails({ planId }: PaymentPlanDetailsProps) {
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payment-plans/${planId}`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch payment plan details');
      }

      const data = await response.json();
      setPlan(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: number) => {
    try {
      setProcessingPayment(installmentId);
      setError(null);

      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/payment-plans/${planId}/installments/${installmentId}/pay`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      await fetchPlanDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (installment: Installment) => {
    if (installment.status === 'paid') return false;
    const dueDate = new Date(installment.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading payment plan...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !plan) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Payment plan not found'}</AlertDescription>
      </Alert>
    );
  }

  const paidInstallments = plan.installments.filter((i) => i.status === 'paid').length;
  const totalPaid = plan.installments
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const remainingBalance = plan.total_amount - totalPaid;
  const progressPercentage = (totalPaid / plan.total_amount) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Plan Overview</span>
            {plan.status === 'active' && <Badge variant="default">Active</Badge>}
            {plan.status === 'completed' && (
              <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
            )}
            {plan.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
          </CardTitle>
          <CardDescription>
            {paidInstallments} of {plan.installment_count} installments paid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Amount</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(plan.total_amount)}</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Paid</span>
              </div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Remaining</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(remainingBalance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>View and pay your installments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.installments.map((installment, index) => {
              const isPaid = installment.status === 'paid';
              const isPaymentOverdue = isOverdue(installment);

              return (
                <div
                  key={installment.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    isPaid ? 'bg-green-50 border-green-200' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {installment.installment_number}
                        </div>
                        <div>
                          <p className="font-medium">
                            Installment #{installment.installment_number}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Due: {formatDate(installment.due_date)}
                              {isPaid && installment.paid_date && (
                                <span className="ml-2 text-green-600">
                                  (Paid: {formatDate(installment.paid_date)})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(installment.amount)}
                        </p>
                        <div className="mt-1">{getStatusBadge(installment.status)}</div>
                      </div>

                      {!isPaid && (
                        <Button
                          onClick={() => handlePayInstallment(installment.id)}
                          disabled={processingPayment === installment.id}
                          variant={isPaymentOverdue ? 'destructive' : 'default'}
                          size="sm"
                        >
                          {processingPayment === installment.id ? 'Processing...' : 'Pay Now'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {isPaymentOverdue && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This payment is overdue. Please pay as soon as possible to avoid late
                        fees.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
