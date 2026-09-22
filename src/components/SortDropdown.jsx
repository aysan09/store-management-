import React, { useEffect, useRef, useState } from 'react';

export default function SortDropdown({ options, value, order, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="sort-dropdown">
      <button
        type="button"
        className="sort-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Sort by ${selectedOption?.label || 'option'}`}
        title="Sort options"
      >
        <span className="sort-dropdown-icon" aria-hidden="true">↕</span>
        <span className="sort-dropdown-label">Sort by</span>
        <span className="sort-dropdown-value">{selectedOption?.label || 'Select'}</span>
        <span className="sort-dropdown-order" aria-label={order === 'asc' ? 'ascending' : 'descending'}>
          {order === 'asc' ? '↑' : '↓'}
        </span>
        <span className="sort-dropdown-chevron" aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>
      {isOpen && (
        <div className="sort-dropdown-menu" role="listbox" aria-label="Sort options">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`sort-dropdown-option ${value === option.value ? 'active' : ''}`}
              key={option.value}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span className="sort-dropdown-selected" aria-hidden="true">
                  {order === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
