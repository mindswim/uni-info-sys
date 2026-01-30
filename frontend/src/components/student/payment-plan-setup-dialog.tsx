'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

interface PaymentPlanSetupDialogProps {
  invoiceId: number;
  balanceDue: number;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InstallmentPreview {
  installment_number: number;
  amount: number;
  due_date: string;
}

export function PaymentPlanSetupDialog({
  invoiceId,
  balanceDue,
  onSuccess,
  open,
  onOpenChange,
}: PaymentPlanSetupDialogProps) {
  const [installmentCount, setInstallmentCount] = useState<number>(6);
  const [startDate, setStartDate] = useState<string>('');
  const [installmentPreviews, setInstallmentPreviews] = useState<InstallmentPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    setStartDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && installmentCount > 0) {
      generatePreview();
    }
  }, [installmentCount, startDate]);

  const generatePreview = () => {
    const previews: InstallmentPreview[] = [];
    const amountPerInstallment = balanceDue / installmentCount;
    const start = new Date(startDate);

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i);

      previews.push({
        installment_number: i + 1,
        amount: parseFloat(amountPerInstallment.toFixed(2)),
        due_date: dueDate.toISOString().split('T')[0],
      });
    }

    const totalPreview = previews.reduce((sum, p) => sum + p.amount, 0);
    const difference = balanceDue - totalPreview;

    if (Math.abs(difference) > 0.01) {
      previews[previews.length - 1].amount = parseFloat(
        (previews[previews.length - 1].amount + difference).toFixed(2)
      );
    }

    setInstallmentPreviews(previews);
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payment-plans`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          installment_count: installmentCount,
          start_date: startDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment plan');
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Up Payment Plan</DialogTitle>
          <DialogDescription>
            Create a payment plan to pay your balance over time in monthly installments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-accent/50 border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-medium">Balance Due</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(balanceDue)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installment-count">Number of Installments</Label>
              <Select
                value={installmentCount.toString()}
                onValueChange={(value) => setInstallmentCount(parseInt(value))}
              >
                <SelectTrigger id="installment-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="9">9 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">First Payment Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {installmentPreviews.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Schedule Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Installment</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installmentPreviews.map((preview) => (
                      <TableRow key={preview.installment_number}>
                        <TableCell className="font-medium">
                          #{preview.installment_number}
                        </TableCell>
                        <TableCell>{formatDate(preview.due_date)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(preview.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-accent/50 font-semibold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          installmentPreviews.reduce((sum, p) => sum + p.amount, 0)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By setting up this payment plan, you agree to make all payments by their due
              dates. Late payments may incur fees and affect your enrollment status.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreatePlan} disabled={loading || !startDate}>
            {loading ? 'Creating...' : 'Create Payment Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
