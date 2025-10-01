"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/layouts"
import { CreditCard, DollarSign, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PaymentsTab() {
  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Current Balance"
          value="$12,450"
          description="Due by Dec 15, 2024"
          icon={<DollarSign className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="Total Paid"
          value="$37,550"
          description="This academic year"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Financial Aid"
          value="$25,000"
          description="Awarded this year"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Payment Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your next payment of $4,150 is due on December 15, 2024.
        </AlertDescription>
      </Alert>

      {/* Payment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Make a Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </Button>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Payment history will be displayed here</p>
          {/* TODO: Payment transaction table */}
        </CardContent>
      </Card>
    </div>
  )
}
