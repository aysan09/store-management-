import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

export default function ExpandableSearch({ value, onChange, placeholder, className = 'search-box' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const expandSearch = () => {
    setIsExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={searchRef} className={`${className} expandable-search ${isExpanded ? 'is-expanded' : ''}`}>
      <button
        type="button"
        className="expandable-search-button"
        onClick={expandSearch}
        aria-label="Open search"
        title="Search"
      >
        <Search size={18} aria-hidden="true" />
      </button>
      <input
        ref={inputRef}
        type="text"
        className="search-input expandable-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsExpanded(true)}
        aria-label={placeholder || 'Search'}
      />
    </div>
  );
}
