'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin } from 'lucide-react';
import { getCitySuggestions } from '@/actions/location';

type Suggestion = {
  name: string;
  country: string;
  lat: number;
  lng: number;
};

interface LocationSearchProps {
  onLocationSelect: (location: Suggestion) => void;
  initialValue?: string;
}

export function LocationSearch({ onLocationSelect, initialValue = '' }: LocationSearchProps) {
  const [query, setQuery] = React.useState(initialValue);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  React.useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      const result = await getCitySuggestions({ data: query });
      setSuggestions(result);
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(`${suggestion.name}, ${suggestion.country}`);
    onLocationSelect(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Digite o nome da sua cidade..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click on suggestion
        autoComplete="off"
      />
      {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          <ul>
            {suggestions.map((s, index) => (
              <li
                key={index}
                onClick={() => handleSelect(s)}
                className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
              >
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{s.name}, {s.country}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
