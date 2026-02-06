import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-hs-card rounded-xl shadow-card p-6 ${className}`}>
      {children}
    </div>
  );
}