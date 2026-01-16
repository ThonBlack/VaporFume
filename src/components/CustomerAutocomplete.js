'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, X } from 'lucide-react';
import { searchCustomers } from '@/app/actions/customer';

export default function CustomerAutocomplete({ onSelect, onClear, onChange, initialName, initialPhone }) {
    const [query, setQuery] = useState(initialName || '');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2 && !initialName) { // Don't search if it's the initial value being set
                setLoading(true);
                const data = await searchCustomers(query);
                setResults(data);
                setLoading(false);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, initialName]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (customer) => {
        setQuery(customer.name || customer.phone);
        setIsOpen(false);
        if (onSelect) onSelect(customer);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        if (onClear) onClear();
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (onChange) onChange(e.target.value); // Passa nome digitado pro pai
                        if (e.target.value === '') handleClear();
                    }}
                    placeholder="Buscar Cliente (Nome ou Tel)..."
                    className="w-full text-sm p-2 pl-9 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                {query && (
                    <button onClick={handleClear} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {results.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => handleSelect(c)}
                            className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{c.name || 'Sem Nome'}</p>
                                    <p className="text-xs text-gray-500">{c.phone || c.customerPhone}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg mt-1 p-3 text-center text-sm text-gray-400">
                    Nenhum cliente encontrado.
                </div>
            )}
        </div>
    );
}
