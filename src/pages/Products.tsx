import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Edit2, 
  Trash2,
  IndianRupee,
  Tag
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
import { Product } from '../App';

interface ProductsProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const PRODUCT_CATEGORIES = [
  'Pulses & Dals',
  'Spices & Masalas',
  'Flour & Grains', 
  'Sugar & Sweeteners',
  'Oil & Ghee',
  'Rice & Cereals',
  'Salt & Condiments',
  'Tea & Coffee',
  'Snacks',
  'Other'
];

const COMMON_PRODUCTS = [
  { name: 'Toor Dal', category: 'Pulses & Dals', unit: 'kg', price: 120 },
  { name: 'Moong Dal', category: 'Pulses & Dals', unit: 'kg', price: 140 },
  { name: 'Chana Dal', category: 'Pulses & Dals', unit: 'kg', price: 90 },
  { name: 'Turmeric Powder', category: 'Spices & Masalas', unit: 'g', price: 2 },
  { name: 'Red Chili Powder', category: 'Spices & Masalas', unit: 'g', price: 3 },
  { name: 'Cumin Seeds', category: 'Spices & Masalas', unit: 'g', price: 4 },
  { name: 'Wheat Flour', category: 'Flour & Grains', unit: 'kg', price: 45 },
  { name: 'Rice Flour', category: 'Flour & Grains', unit: 'kg', price: 50 },
  { name: 'Sugar', category: 'Sugar & Sweeteners', unit: 'kg', price: 42 },
  { name: 'Jaggery', category: 'Sugar & Sweeteners', unit: 'kg', price: 65 },
  { name: 'Mustard Oil', category: 'Oil & Ghee', unit: 'L', price: 180 },
  { name: 'Sunflower Oil', category: 'Oil & Ghee', unit: 'L', price: 150 },
  { name: 'Basmati Rice', category: 'Rice & Cereals', unit: 'kg', price: 120 },
  { name: 'Regular Rice', category: 'Rice & Cereals', unit: 'kg', price: 50 },
  { name: 'Salt', category: 'Salt & Condiments', unit: 'kg', price: 20 },
  { name: 'Tea Leaves', category: 'Tea & Coffee', unit: 'g', price: 1.5 },
];

export function Products({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg',
    price: 0,
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, formData);
      toast.success('Product updated successfully');
    } else {
      onAddProduct(formData);
      toast.success('Product added successfully');
    }

    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    onDeleteProduct(product.id);
    toast.success('Product deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: 'kg',
      price: 0,
    });
    setEditingProduct(null);
    setIsAddDialogOpen(false);
  };

  const addCommonProducts = () => {
    let addedCount = 0;
    COMMON_PRODUCTS.forEach(product => {
      const exists = products.some(p => p.name.toLowerCase() === product.name.toLowerCase());
      if (!exists) {
        onAddProduct(product);
        addedCount++;
      }
    });
    toast.success(`Added ${addedCount} common kiryana products`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">
            Manage your kiryana store inventory
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {products.length === 0 && (
            <Button variant="outline" onClick={addCommonProducts}>
              <Package className="w-4 h-4 mr-2" />
              Add Common Items
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update product details' : 'Add a new product to your inventory'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Toor Dal, Wheat Flour"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="g">Gram (g)</SelectItem>
                          <SelectItem value="L">Liter (L)</SelectItem>
                          <SelectItem value="ml">Milliliter (ml)</SelectItem>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="packet">Packet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Unit (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Set(products.map(p => p.category)).size} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.length > 0 ? formatCurrency(products.reduce((sum, p) => sum + p.price, 0) / products.length) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per unit average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {products.length > 0 ? 
                `${formatCurrency(Math.min(...products.map(p => p.price)))} - ${formatCurrency(Math.max(...products.map(p => p.price)))}` : 
                '₹0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Min - Max price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            {filteredProducts.length} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || filterCategory !== 'all' ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add products to start managing your kiryana store inventory'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={addCommonProducts} variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Add Common Items
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(product.price)}/{product.unit}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(product.createdAt).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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