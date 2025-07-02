import { openDB, IDBPDatabase } from 'idb';
import { Customer, Transaction, Product, PaymentTerm } from '../App';

const DB_NAME = 'customer-finance-db';
const DB_VERSION = 4; // Bump version to add products store and paymentTerms store

interface MyDB extends IDBPDatabase {
  'customers': {
    key: string;
    value: Customer;
  };
  'products': {
    key: string;
    value: Product;
  };
  'transactions': {
    key: string;
    value: Transaction;
    indexes: { 'customerId': string };
  };
  'paymentTerms': {
    key: string;
    value: PaymentTerm;
  };
}

export const initDB = async () => {
  return openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('customerId', 'customerId');
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('paymentTerms')) {
          db.createObjectStore('paymentTerms', { keyPath: 'id' });
        }
      }
      if (oldVersion < 3) {
        // Add products store
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
      }
    },
  });
};

export const getCustomers = async (): Promise<Customer[]> => {
  const db = await initDB();
  return db.getAll('customers');
};

export const addCustomerDB = async (customer: Customer) => {
  const db = await initDB();
  await db.add('customers', customer);
};

export const updateCustomerDB = async (customer: Customer) => {
  const db = await initDB();
  await db.put('customers', customer);
};

export const deleteCustomerDB = async (id: string) => {
  const db = await initDB();
  await db.delete('customers', id);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const db = await initDB();
  return db.getAll('transactions');
};

export const addTransactionDB = async (transaction: Transaction) => {
  const db = await initDB();
  await db.add('transactions', transaction);
};

export const updateTransactionDB = async (transaction: Transaction) => {
  const db = await initDB();
  await db.put('transactions', transaction);
};

export const deleteTransactionDB = async (id: string) => {
  const db = await initDB();
  await db.delete('transactions', id);
};

export const getProducts = async (): Promise<Product[]> => {
  const db = await initDB();
  return db.getAll('products');
};

export const addProductDB = async (product: Product) => {
  const db = await initDB();
  await db.add('products', product);
};

export const updateProductDB = async (product: Product) => {
  const db = await initDB();
  await db.put('products', product);
};

export const deleteProductDB = async (id: string) => {
  const db = await initDB();
  await db.delete('products', id);
};

export const getPaymentTerms = async (): Promise<PaymentTerm[]> => {
  const db = await initDB();
  return db.getAll('paymentTerms');
};

export const addPaymentTermDB = async (term: PaymentTerm) => {
  const db = await initDB();
  await db.add('paymentTerms', term);
};