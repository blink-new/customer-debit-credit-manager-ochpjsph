import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Customer, Transaction } from '../App';

interface DashboardProps {
  customers: Customer[];
  transactions: Transaction[];
}

export function Dashboard({ customers, transactions }: DashboardProps) {
  // Calculate metrics
  const totalCustomers = customers.length;
  const totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Customers with highest balances
  const topCustomers = customers
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Overview of your customer accounts and transactions
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button asChild variant="outline">
            <Link to="/customers">
              <Users className="w-4 h-4 mr-2" />
              Manage Customers
            </Link>
          </Button>
          <Button asChild>
            <Link to="/transactions">
              <Activity className="w-4 h-4 mr-2" />
              View Transactions
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              Money received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              Money paid out
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No transactions yet</p>
                <Button asChild className="mt-3" size="sm">
                  <Link to="/transactions">Add Transaction</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.customerName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {transaction.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/transactions">View All Transactions</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Customers with highest balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No customers yet</p>
                <Button asChild className="mt-3" size="sm">
                  <Link to="/customers">Add Customer</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={customer.balance >= 0 ? "default" : "destructive"}>
                        {formatCurrency(customer.balance)}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/customers">View All Customers</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}