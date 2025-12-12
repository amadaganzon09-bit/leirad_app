import React from 'react';
import {
    Utensils, Car, ShoppingBag, Film, Heart, Home, Coffee, Receipt, DollarSign,
    Banknote, CreditCard, Smartphone
} from 'lucide-react';

export const CATEGORIES = [
    { name: 'Food', icon: <Utensils className="w-4 h-4" />, color: 'bg-orange-500' },
    { name: 'Transport', icon: <Car className="w-4 h-4" />, color: 'bg-blue-500' },
    { name: 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-pink-500' },
    { name: 'Entertainment', icon: <Film className="w-4 h-4" />, color: 'bg-purple-500' },
    { name: 'Health', icon: <Heart className="w-4 h-4" />, color: 'bg-red-500' },
    { name: 'Housing', icon: <Home className="w-4 h-4" />, color: 'bg-indigo-500' },
    { name: 'Coffee', icon: <Coffee className="w-4 h-4" />, color: 'bg-amber-600' },
    { name: 'Bills', icon: <Receipt className="w-4 h-4" />, color: 'bg-slate-600' },
    { name: 'Groceries', icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-emerald-500' },
    { name: 'Other', icon: <DollarSign className="w-4 h-4" />, color: 'bg-slate-500' },
];

export const WALLET_ICONS = {
    cash: <Banknote className="w-4 h-4" />,
    debit: <CreditCard className="w-4 h-4" />,
    credit: <CreditCard className="w-4 h-4" />,
    digital: <Smartphone className="w-4 h-4" />,
};
