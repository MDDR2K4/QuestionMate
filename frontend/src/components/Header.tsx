'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          QuestionMate
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-600 hidden sm:inline">Welcome, {user.username}!</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/auth" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105">
              Login / Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}