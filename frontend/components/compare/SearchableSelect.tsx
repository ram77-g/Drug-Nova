"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Select..." }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#050810] border border-[#1e2d4a] rounded-xl px-4 py-3 text-sm text-white font-medium cursor-pointer flex justify-between items-center transition-colors hover:border-[#00d4ff]/50"
      >
        <span className="truncate pr-4">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`text-[#6b7fa3] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#050810] border border-[#1e2d4a] rounded-xl overflow-hidden z-[100] shadow-2xl shadow-black">
          <div className="p-2 border-b border-[#1e2d4a]/60 bg-[#0d1425]">
            <input
              autoFocus
              type="text"
              placeholder="Search by name or UniProt ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#050810] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00d4ff] transition-colors placeholder:text-[#4b5a78]"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <div
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    o.value === value
                      ? "text-[#00d4ff] bg-[#00d4ff]/10 font-medium"
                      : "text-[#c8d6f0] hover:bg-[#1e2d4a]/50"
                  }`}
                >
                  {o.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-[#6b7fa3] text-center italic">No proteins found matching "{search}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
