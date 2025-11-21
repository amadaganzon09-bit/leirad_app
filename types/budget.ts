import React from 'react';

export interface Transaction {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category: string;
    description: string;
    date: string;
    walletId: string;
    tags: string[];
    receiptUrl?: string;
    recurringId?: string;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    period: 'monthly' | 'weekly' | 'yearly';
    icon: React.ReactNode;
    color: string;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string;
    color: string;
}

export interface WalletType {
    id: string;
    name: string;
    type: 'cash' | 'debit' | 'credit' | 'digital';
    balance: number;
    color: string;
    icon: React.ReactNode;
}
