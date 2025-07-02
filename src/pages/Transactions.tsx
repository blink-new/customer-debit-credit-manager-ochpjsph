import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Customer, Transaction, TransactionItem } from '../App';

interface TransactionsProps {
  transactions: Transaction[];
  customers: Customer[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'customerName' | 'totalAmount'>, items: TransactionItem[]) => void;
  onDeleteTransaction: (id: string) => void;
}

export function Transactions({ transactions, customers, onAddTransaction, onDeleteTransaction }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'debit' as 'credit' | 'debit',
    date: new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState<Omit<TransactionItem, 'id'>[]>([]);

  useEffect(() => {
    // This effect is just to trigger re-renders when items change
  }, [items]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.totalAmount.toString().includes(searchTerm);
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleItemChange = (index: number, field: keyof Omit<TransactionItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    newItems[index][field] = value as never;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || items.length === 0) {
      toast.error('Please select a customer and add at least one item');
      return;
    }

    const transactionItems = items.map(item => ({ ...item, id: crypto.randomUUID() }));

    onAddTransaction({
      customerId: formData.customerId,
      type: formData.type,
      date: formData.date,
    }, transactionItems);

    toast.success('Transaction added successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = (transaction: Transaction) => {
    onDeleteTransaction(transaction.id);
    toast.success('Transaction deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      type: 'debit',
      date: new Date().toISOString().split('T')[0],
    });
    setItems([]);
    setIsAddDialogOpen(false);
  };

  // Calculate totals
  const totalCredits = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalDebits = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">
            Track all debit and credit transactions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)} disabled={customers.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Record a new debit or credit transaction for a customer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Transaction Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'credit' | 'debit') => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Purchase (Debit)</SelectItem>
                        <SelectItem value="credit">Payment (Credit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Items</Label>
                  <div className="space-y-2 rounded-md border p-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Item Name"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                          className="w-24"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">Add Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'credit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'debit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalCredits - totalDebits)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.length} total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | 'credit' | 'debit') => setFilterType(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credits Only</SelectItem>
            <SelectItem value="debit">Debits Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || filterType !== 'all' ? 'No transactions found' : 'No transactions yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : customers.length === 0
                  ? 'Add customers first, then you can record transactions'
                  : 'Add your first transaction to start tracking financial activities'
                }
              </p>
              {!searchTerm && filterType === 'all' && customers.length > 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.customerName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                          <div className="flex items-center">
                            {transaction.type === 'credit' ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            )}
                            {transaction.type}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '-' : '+'}{formatCurrency(transaction.totalAmount)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                      </TableCell>
                      <TableCell>{formatDateShort(transaction.date)}</TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transaction? This will update the customer's balance accordingly. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(transaction)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}