'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon, 
  CameraIcon, 
  MapPinIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

export default function ProfileEditModal({ user, isOpen, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    image: '',
    addresses: [''],
  });

  const avatars = [
    '/abatar/abatar_1.jpeg',
    '/abatar/abatar_2.jpeg',
    '/abatar/abatar_3.jpeg',
    '/abatar/abatar_4.png'
  ];

  useEffect(() => {
    if (user && isOpen) {
      setEditData({
        full_name: user.full_name || '',
        image: user.image || '',
        addresses: user.addresses && user.addresses.length > 0 ? [...user.addresses] : [''],
      });
    }
  }, [user, isOpen]);

  const handleAddressChange = (index, value) => {
    const newAddresses = [...editData.addresses];
    newAddresses[index] = value;
    setEditData({ ...editData, addresses: newAddresses });
  };

  const addAddress = () => {
    setEditData({ ...editData, addresses: [...editData.addresses, ''] });
  };

  const removeAddress = (index) => {
    const newAddresses = editData.addresses.filter((_, i) => i !== index);
    setEditData({ ...editData, addresses: newAddresses.length > 0 ? newAddresses : [''] });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const { data } = await api.post('/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditData({ ...editData, image: data.url });
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalData = {
        full_name: editData.full_name,
        image: editData.image,
        addresses: editData.addresses.filter(a => a.trim() !== '')
      };
      await onSave(finalData);
      onClose();
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-6 py-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Profile Picture</label>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-gray-100 ring-2 ring-indigo-500 ring-offset-2">
                    {editData.image ? (
                      <img src={editData.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <UserCircleIcon className="h-full w-full text-gray-300" />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <CameraIcon className="h-8 w-8 text-white" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-gray-500 mb-3">Choose an avatar or upload your own photo.</p>
                    <div className="flex flex-wrap gap-3">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setEditData({ ...editData, image: avatar })}
                          className={`h-12 w-12 rounded-xl overflow-hidden border-2 transition-all ${
                            editData.image === avatar ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent hover:border-gray-200'
                          }`}
                        >
                          <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="h-12 w-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                      >
                        <PlusIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border text-blue-900 font-semibold"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Addresses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Delivery Addresses</label>
                  <button
                    type="button"
                    onClick={addAddress}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add New
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                  {editData.addresses.map((address, index) => (
                    <div key={index} className="flex gap-2 group">
                      <div className="relative flex-1">
                        <MapPinIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => handleAddressChange(index, e.target.value)}
                          className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 pl-10 border text-blue-900 font-semibold"
                          placeholder={`Address ${index + 1}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
