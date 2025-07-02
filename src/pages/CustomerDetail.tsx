import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Trash2,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Customer, Transaction, TransactionItem } from '../App';

interface CustomerDetailProps {
  customers: Customer[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'customerName'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export function CustomerDetail({ customers, transactions, onAddTransaction, onDeleteTransaction }: CustomerDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'credit' as 'credit' | 'debit',
    description: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as Omit<TransactionItem, 'id'>[],
  });
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const amount = formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(amount);
  }, [formData.items]);

  const customer = customers.find(c => c.id === id);
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Customer not found</h2>
        <Button onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const customerTransactions = transactions
    .filter(t => t.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCredits = customerTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = customerTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

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
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', quantity: 1, price: 0 }] }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const finalItems = formData.items.map(item => ({ ...item, id: crypto.randomUUID() }));

    onAddTransaction({
      customerId: customer.id,
      type: formData.type,
      amount: totalAmount,
      items: finalItems,
      description: formData.description,
      date: formData.date,
    });

    toast.success('Transaction added successfully');
    resetForm();
  };

  const handleDelete = (transaction: Transaction) => {
    onDeleteTransaction(transaction.id);
    toast.success('Transaction deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      type: 'credit',
      description: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-slate-600 mt-1">Customer Account Details</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Transaction for {customer.name}</DialogTitle>
              <DialogDescription>
                Record a new debit or credit transaction.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'credit' | 'debit') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (+)</SelectItem>
                      <SelectItem value="debit">Debit (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Items</Label>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
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
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                        <Input 
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeItem(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addItem}>Add Item</Button>
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
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter transaction description"
                    rows={2}
                  />
                </div>

                <div className="text-right">
                  <Label>Total Amount: </Label>
                  <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
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

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-slate-700">
                <Mail className="w-5 h-5 mr-3 text-slate-500" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center text-slate-700">
                  <Phone className="w-5 h-5 mr-3 text-slate-500" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center text-slate-700">
                <Calendar className="w-5 h-5 mr-3 text-slate-500" />
                <span>Joined {formatDateShort(customer.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Current Balance</p>
                <Badge 
                  variant={customer.balance >= 0 ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {formatCurrency(customer.balance)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              {customerTransactions.filter(t => t.type === 'credit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              {customerTransactions.filter(t => t.type === 'debit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Activity</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalCredits - totalDebits)}
            </div>
            <p className="text-xs text-muted-foreground">
              {customerTransactions.length} total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All transactions for {customer.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customerTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions yet</h3>
              <p className="text-slate-500 mb-6">
                Add the first transaction for {customer.name} to start tracking their account activity.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
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
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside">
                          {transaction.items.map(item => (
                            <li key={item.id}>{item.name} ({item.quantity} x {formatCurrency(item.price)})</li>
                          ))}
                        </ul>
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