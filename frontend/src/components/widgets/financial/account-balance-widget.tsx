"use client"

import { WidgetProps } from '@/lib/widgets/widget-registry'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DollarSign, AlertCircle, Calendar, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

const accountData = {
  currentBalance: 6225.00,
  totalCharges: 18500.00,
  totalPayments: 12275.00,
  dueDate: '2025-01-15',
  daysUntilDue: 27,
  minimumDue: 3112.50,
  lastPayment: {
    amount: 2500.00,
    date: '2024-11-01'
  },
  paymentPlan: {
    enrolled: true,
    monthlyAmount: 775.00,
    nextPayment: '2025-01-01'
  }
}

export function AccountBalanceWidget({ size, isEditing }: WidgetProps) {
  const router = useRouter()
  const isOverdue = accountData.daysUntilDue < 0
  const isUrgent = accountData.daysUntilDue <= 7 && accountData.daysUntilDue >= 0

  // Minimal view for smallest size
  if (size.h <= 2 && size.w <= 2) {
    return (
      <div className="p-4">
        <p className="text-xs text-muted-foreground">Balance Due</p>
        <p className="text-xl font-bold">${accountData.currentBalance.toLocaleString()}</p>
        <p className={`text-xs mt-1 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
          Due {accountData.dueDate}
        </p>
      </div>
    )
  }

  // Compact view
  if (size.h <= 2) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Account Balance</p>
            <p className="text-2xl font-bold">${accountData.currentBalance.toLocaleString()}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              isOverdue ? 'text-destructive' :
              isUrgent ? 'text-yellow-600' :
              'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              Due {accountData.dueDate} ({accountData.daysUntilDue} days)
            </p>
          </div>
          {!isEditing && size.w >= 3 && (
            <Button
              size="sm"
              onClick={() => router.push('/payments')}
            >
              Pay Now
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Full view
  return (
    <div className="p-4 space-y-3">
      {/* Balance Overview */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold">${accountData.currentBalance.toLocaleString()}</p>
          </div>
          {(isOverdue || isUrgent) && (
            <AlertCircle className={`h-5 w-5 ${
              isOverdue ? 'text-destructive' : 'text-yellow-600'
            }`} />
          )}
        </div>

        {/* Payment Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Paid: ${accountData.totalPayments.toLocaleString()}</span>
            <span>Total: ${accountData.totalCharges.toLocaleString()}</span>
          </div>
          <Progress
            value={(accountData.totalPayments / accountData.totalCharges) * 100}
            className="h-2"
          />
        </div>
      </div>

      {/* Due Date Alert */}
      <div className={`p-2 rounded-lg border ${
        isOverdue ? 'bg-destructive/10 border-destructive' :
        isUrgent ? 'bg-yellow-50 border-yellow-200' :
        'bg-muted'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">
                ${accountData.minimumDue.toLocaleString()} due
              </p>
              <p className="text-xs text-muted-foreground">
                {accountData.dueDate} ({accountData.daysUntilDue} days)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Plan Status */}
      {accountData.paymentPlan.enrolled && size.h >= 4 && (
        <div className="p-2 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs font-medium">Payment Plan Active</p>
              <p className="text-xs text-muted-foreground">
                ${accountData.paymentPlan.monthlyAmount}/month • Next: {accountData.paymentPlan.nextPayment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isEditing && size.w >= 3 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => router.push('/payments')}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Make Payment
          </Button>
          {size.w >= 4 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/billing')}
            >
              View Details
            </Button>
          )}
        </div>
      )}
    </div>
  )
}