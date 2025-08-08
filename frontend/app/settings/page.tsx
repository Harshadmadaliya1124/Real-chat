'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authAPI } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setDisplayName(parsed.displayName || '');
      setAvatarUrl(parsed.avatarUrl || '');
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authAPI.updateProfile({ displayName, avatarUrl: avatarUrl || undefined });
      const updated = res.data;
      const newUser = { ...user!, displayName: updated.displayName, avatarUrl: updated.avatarUrl };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your account? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await authAPI.deleteProfile();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Account deleted');
      router.push('/register');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display name</label>
            <input
              className="input mt-1"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL (optional)</label>
            <input
              className="input mt-1"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use generated initials avatar.</p>
          </div>
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



