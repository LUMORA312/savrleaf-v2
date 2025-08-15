'use client';
import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (item: T) => React.ReactNode;
  onRowClick?: any;
}

export default function AdminTable<T extends { _id: string }>({
  columns,
  data,
  actions,
  onRowClick,
}: AdminTableProps<T>) {
  return (
    <div className="w-full space-y-2">
      <div className="hidden md:grid bg-orange-100 rounded-xl p-4 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:gap-4 font-semibold text-gray-700">
        {columns.map((col) => (
          <div key={col.key as string}>{col.label}</div>
        ))}
        {actions && <div>Actions</div>}
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item._id}
            onClick={() => onRowClick?.(item)}
            className="bg-white shadow-md rounded-xl p-4 md:grid md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:gap-4 hover:shadow-lg transition cursor-pointer"
          >
            {columns.map((col) => (
              <div key={col.key as string} className="flex flex-col md:flex-row md:items-center">
                <span className="text-sm font-semibold text-gray-500 md:hidden">{col.label}</span>
                <span className="text-gray-900">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </span>
              </div>
            ))}

            {actions && <div className="flex gap-2 mt-2 md:mt-0">{actions(item)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
