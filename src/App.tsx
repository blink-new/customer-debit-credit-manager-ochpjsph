import React, { useState, useEffect } from 'react';
import { 
  initDB, 
  getCustomers, 
  addCustomerDB, 
  updateCustomerDB, 
  deleteCustomerDB, 
  getTransactions, 
  addTransactionDB, 
  deleteTransactionDB,
  getProducts,
  addProductDB,
  updateProductDB,
  deleteProductDB,
  getPaymentTerms,
  addPaymentTermDB
} from './lib/indexedDB';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Transactions } from './pages/Transactions';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';

// Types
export interface PaymentTerm {
  id: string;
  name: string;
  days: number;
}

export interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentTermId?: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id:string;
  customerId: string;
  customerName: string;
  items: TransactionItem[];
  totalAmount: number;
  type: 'debit' | 'credit';
  date: string;
  createdAt: string;
}

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize DB and load data on mount
  useEffect(() => {
    const loadData = async () => {
      await initDB();
      const loadedCustomers = await getCustomers();
      const loadedTransactions = await getTransactions();
      const loadedPaymentTerms = await getPaymentTerms();
      setCustomers(loadedCustomers);
      setTransactions(loadedTransactions);
      setPaymentTerms(loadedPaymentTerms);

      // Add some default payment terms if none exist
      if (loadedPaymentTerms.length === 0) {
        const defaultTerms = [
          { id: crypto.randomUUID(), name: 'Weekly', days: 7 },
          { id: crypto.randomUUID(), name: 'Monthly', days: 30 },
          { id: crypto.randomUUID(), name: '6 Months', days: 180 },
        ];
        for (const term of defaultTerms) {
          await addPaymentTermDB(term);
        }
        setPaymentTerms(await getPaymentTerms());
      }

      setDbInitialized(true);
    };
    loadData();
  }, []);

  // Initialize DB and load data on mount
  useEffect(() => {
    const loadData = async () => {
      await initDB();
      const loadedCustomers = await getCustomers();
      const loadedProducts = await getProducts();
      const loadedTransactions = await getTransactions();
      setCustomers(loadedCustomers);
      setProducts(loadedProducts);
      setTransactions(loadedTransactions);
      setDbInitialized(true);
    };
    loadData();
  }, []);

  // No need to save to localStorage anymore, IndexedDB functions handle persistence
  useEffect(() => {
    if (!dbInitialized) return;
    // This useEffect will now only trigger when customers state changes
    // and will be used to update individual customer records in IndexedDB
    // The actual IndexedDB update logic is within add/update/delete functions
  }, [customers, dbInitialized]);

  useEffect(() => {
    if (!dbInitialized) return;
    // This useEffect will now only trigger when products state changes
    // and will be used to update individual product records in IndexedDB
    // The actual IndexedDB update logic is within add/update/delete functions
  }, [products, dbInitialized]);

  useEffect(() => {
    if (!dbInitialized) return;
    // This useEffect will now only trigger when transactions state changes
    // and will be used to update individual transaction records in IndexedDB
    // The actual IndexedDB update logic is within add/update/delete functions
  }, [transactions, dbInitialized]);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'balance' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    await addCustomerDB(newCustomer);
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => {
      const updatedCustomers = prev.map(customer => 
        customer.id === id ? { ...customer, ...updates } : customer
      );
      const customerToUpdate = updatedCustomers.find(c => c.id === id);
      if (customerToUpdate) {
        updateCustomerDB(customerToUpdate);
      }
      return updatedCustomers;
    });
  };

  const deleteCustomer = async (id: string) => {
    await deleteCustomerDB(id);
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    
    const customerTransactionsToDelete = transactions.filter(t => t.customerId === id);
    for (const transaction of customerTransactionsToDelete) {
      await deleteTransactionDB(transaction.id);
    }
    setTransactions(prev => prev.filter(transaction => transaction.customerId !== id));
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await addProductDB(newProduct);
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updatedProducts = prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      );
      const productToUpdate = updatedProducts.find(p => p.id === id);
      if (productToUpdate) {
        updateProductDB(productToUpdate);
      }
      return updatedProducts;
    });
  };

  const deleteProduct = async (id: string) => {
    await deleteProductDB(id);
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'customerName' | 'totalAmount'>, items: TransactionItem[]) => {
    const customer = customers.find(c => c.id === transaction.customerId);
    if (!customer) return;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      customerName: customer.name,
      items,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    await addTransactionDB(newTransaction);
    setTransactions(prev => [...prev, newTransaction]);

    // Update customer balance
    const balanceChange = transaction.type === 'credit'
      ? -totalAmount // Credit reduces balance (payment)
      : totalAmount; // Debit increases balance (purchase)

    const updatedCustomer = { ...customer, balance: customer.balance + balanceChange };
    await updateCustomerDB(updatedCustomer);
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    await deleteTransactionDB(id);
    setTransactions(prev => prev.filter(t => t.id !== id));

    const customer = customers.find(c => c.id === transaction.customerId);
    if (customer) {
      const balanceChange = transaction.type === 'credit'
        ? transaction.totalAmount // Re-add credited amount
        : -transaction.totalAmount; // Re-subtract debited amount

      const updatedCustomer = { ...customer, balance: customer.balance + balanceChange };
      await updateCustomerDB(updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    }
  };

  if (!dbInitialized) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-slate-600">Loading application...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  customers={customers}
                  transactions={transactions}
                />
              } 
            />
            <Route 
              path="/customers"
              element={
                <Customers
                  customers={customers}
                  paymentTerms={paymentTerms}
                  onAddCustomer={addCustomer}
                  onUpdateCustomer={updateCustomer}
                  onDeleteCustomer={deleteCustomer}
                />
              }
            />
            <Route 
              path="/products" 
              element={
                <Products 
                  products={products}
                  onAddProduct={addProduct}
                  onUpdateProduct={updateProduct}
                  onDeleteProduct={deleteProduct}
                />
              } 
            />
            <Route 
              path="/customers/:id"
              element={
                <CustomerDetail
                  customers={customers}
                  transactions={transactions}
                  paymentTerms={paymentTerms}
                  onAddTransaction={addTransaction}
                  onDeleteTransaction={deleteTransaction}
                />
              }
            />
            <Route 
              path="/transactions"
              element={
                <Transactions
                  transactions={transactions}
                  customers={customers}
                  paymentTerms={paymentTerms}
                  onAddTransaction={addTransaction}
                  onDeleteTransaction={deleteTransaction}
                />
              }
            />
          </Routes>
        </DashboardLayout>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;