'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AdminRoute from '@/components/AdminRoute';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: 'Sneakers',
    sizes: '',
    colors: '',
    stock: 0,
    images: '',
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await api.get(`/products/${id}`);
        setFormData({
          ...data,
          sizes: data.sizes?.join(', ') || '',
          colors: data.colors?.join(', ') || '',
          images: data.images?.join(', ') || '',
        });
      } catch (error) {
        console.error("Failed to fetch product", error);
        alert('Failed to load product data');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== '').map(s => parseInt(s)),
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c !== ''),
        images: formData.images.split(',').map(i => i.trim()).filter(i => i !== ''),
      };
      
      await api.put(`/products/${id}`, productData);
      router.push('/admin/products');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AdminRoute>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Product: {formData.name}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (৳)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold">
                <option value="Sneakers">Sneakers</option>
                <option value="Formal">Formal</option>
                <option value="Boots">Boots</option>
                <option value="Sandals">Sandals</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sizes (comma separated)</label>
            <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="40, 41, 42" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Colors (comma separated)</label>
            <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="Black, Brown" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
            <input type="text" name="images" value={formData.images} onChange={handleChange} placeholder="http://..., http://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-blue-900 font-semibold" />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminRoute>
  );
}
