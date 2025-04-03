'use client';

import { useState } from 'react';

interface GuestSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function GuestSearch({ onSearch, placeholder }: GuestSearchProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder={placeholder || "Buscar por nombre o teléfono"}
      className="w-full max-w-md p-2 mb-4 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
    />
  );
}
