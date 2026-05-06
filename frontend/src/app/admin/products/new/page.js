'use client';

import { useState } from 'react';
import api from '@/lib/api';
import AdminRoute from '@/components/AdminRoute';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: 'Sneakers',
    sizes: '40,41,42,43',
    colors: 'Black,White,Brown',
    stock: 0,
    images: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sizes: formData.sizes.split(',').map(s => parseInt(s.trim())),
        colors: formData.colors.split(',').map(c => c.trim()),
        images: formData.images ? formData.images.split(',').map(i => i.trim()) : [],
      };
      
      await api.post('/products', productData);
      router.push('/admin/products');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (৳)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                <option value="Sneakers">Sneakers</option>
                <option value="Formal">Formal</option>
                <option value="Boots">Boots</option>
                <option value="Sandals">Sandals</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sizes (comma separated)</label>
            <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="40, 41, 42" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Colors (comma separated)</label>
            <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="Black, Brown" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
            <input type="text" name="images" value={formData.images} onChange={handleChange} placeholder="http://..., http://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminRoute>
  );
}
