import React, { useState } from 'react';
import { Search, Receipt, Trash2, DollarSign, Download, Edit2, Loader2 } from 'lucide-react';
import { Transaction, WalletType } from '../../types/budget';
import { CATEGORIES } from '../../constants/budget';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionListProps {
    transactions: Transaction[];
    wallets: WalletType[];
    onDelete: (id: string) => void;
    onEdit: (transaction: Transaction) => void;
    loadingTransactionId?: string | null;
}

const TransactionList: React.FC<TransactionListProps> = ({
    transactions, wallets, onDelete, onEdit, loadingTransactionId
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 10;

    const exportToPDF = () => {
        setIsExporting(true);
        
        try {
            // Create new PDF document in landscape mode for better table display
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Add header with company branding
            doc.setFillColor(99, 102, 241); // Indigo color
            doc.rect(0, 0, 210, 25, 'F'); // Full width header
            
            // Add logo placeholder and title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont(undefined, 'bold');
            doc.text('LeiradMaster', 105, 17, { align: 'center' });
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            
            // Add report title
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Transaction Report', 105, 35, { align: 'center' });
            
            // Add report info
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}`, 105, 45, { align: 'center' });
            
            // Add filter info if filters are applied
            const filterInfo = [];
            if (searchQuery) filterInfo.push(`Search: "${searchQuery}"`);
            if (filterCategory !== 'all') filterInfo.push(`Category: ${filterCategory}`);
            if (filterType !== 'all') filterInfo.push(`Type: ${filterType}`);
            
            if (filterInfo.length > 0) {
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Filters: ${filterInfo.join(', ')}`, 105, 52, { align: 'center' });
                doc.setTextColor(0, 0, 0);
            }
            
            // Prepare data for table
            const filteredTransactions = transactions.filter(t => {
                const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.category.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
                const matchesType = filterType === 'all' || t.type === filterType;
                return matchesSearch && matchesCategory && matchesType;
            });
            
            // Format data for table
            const tableData = filteredTransactions.map(transaction => {
                const wallet = wallets.find(w => w.id === transaction.walletId);
                return [
                    new Date(transaction.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    transaction.description,
                    transaction.category,
                    wallet ? wallet.name : 'Unknown',
transaction.type === 'income' ? `${transaction.amount.toFixed(2)}` : `${transaction.amount.toFixed(2)}`
                ];
            });
            
            // Add table with improved styling
            autoTable(doc, {
                head: [['Date', 'Description', 'Category', 'Wallet', 'Amount']],
                body: tableData,
                startY: 60,
                styles: { 
                    fontSize: 10,
                    cellPadding: 3
                },
                headStyles: { 
                    fillColor: [99, 102, 241], // Indigo color
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    textColor: [0, 0, 0]
                },
                alternateRowStyles: { 
                    fillColor: [248, 250, 252] // Light gray
                },
                margin: { 
                    left: 10, 
                    right: 10 
                },
                columnStyles: {
                    0: { cellWidth: 20 }, // Date
                    1: { cellWidth: 70 }, // Description
                    2: { cellWidth: 25 }, // Category
                    3: { cellWidth: 25 }, // Wallet
                    4: { cellWidth: 20 }  // Amount
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 4) { // Amount column
                        // Find the transaction for this row to determine type
                        const rowIndex = data.row.index;
                        if (rowIndex < filteredTransactions.length) {
                            const transaction = filteredTransactions[rowIndex];
                            if (transaction.type === 'income') {
                                data.cell.styles.textColor = [34, 197, 94]; // Green for income
                            } else {
                                data.cell.styles.textColor = [239, 68, 68]; // Red for expenses
                            }
                        }
                    }
                }
            });
            
            // Add summary section
            const totalIncome = filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const totalExpenses = filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const netBalance = totalIncome - totalExpenses;
            
            const finalY = (doc as any).lastAutoTable?.finalY || 70;
            
            // Add summary box
            doc.setFillColor(241, 245, 249); // Light blue background
            doc.roundedRect(10, finalY + 10, 190, 35, 2, 2, 'F'); // Rounded rectangle
            
            // Add summary text
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Financial Summary', 15, finalY + 20);
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(34, 197, 94); // Green
            doc.text(`Total Income: ${totalIncome.toFixed(2)}`, 15, finalY + 30);
            
            doc.setTextColor(239, 68, 68); // Red
            doc.text(`Total Expenses: ${totalExpenses.toFixed(2)}`, 15, finalY + 38);
            
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text(`Net Balance: ${netBalance.toFixed(2)}`, 15, finalY + 46);
            
            // Add footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                doc.text('Generated by LeiradMaster - Your Personal Finance Manager', 105, 295, { align: 'center' });
            }
            
            // Save the PDF
            doc.save(`leiradmaster-transactions-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm font-medium text-slate-700"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
                        >
                            Expense
                        </button>
                    </div>
                    <button
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${isExporting ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500 hover:text-slate-700'} bg-slate-100 hover:bg-slate-200`}
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Exporting</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Transactions Timeline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                {paginatedTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50 text-slate-400" />
                        <p className="text-slate-500">No transactions found</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {paginatedTransactions.map((transaction, index) => {
                            const categoryInfo = CATEGORIES.find(c => c.name === transaction.category);
                            const wallet = wallets.find(w => w.id === transaction.walletId);
                            const isLast = index === filteredTransactions.length - 1;

                            return (
                                <div key={transaction.id} className="relative flex gap-3 pb-4 group">
                                    {/* Timeline Line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${categoryInfo?.color || 'bg-slate-500'} text-white flex items-center justify-center shadow-sm z-10`}>
                                            {categoryInfo?.icon || <DollarSign className="w-5 h-5" />}
                                        </div>
                                        {!isLast && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-slate-200 to-transparent mt-2" />
                                        )}
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="flex-1 pt-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">{transaction.description}</p>
                                                <p className="text-xs text-slate-500">{transaction.category}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`font-bold text-sm sm:text-base whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                                                </span>
                                                <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(transaction);
                                                        }}
                                                        disabled={loadingTransactionId === transaction.id}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit transaction"
                                                    >
                                                        {loadingTransactionId === transaction.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Edit2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(transaction.id);
                                                        }}
                                                        disabled={loadingTransactionId === transaction.id}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete transaction"
                                                    >
                                                        {loadingTransactionId === transaction.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {wallet && (
                                                <>
                                                    <span>•</span>
                                                    <span>{wallet.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        <div className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionList;
