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
}

export default function AdminTable<T extends { _id: string }>({
  columns,
  data,
  actions,
}: AdminTableProps<T>) {
  return (
    <table className="min-w-full bg-white shadow rounded-xl overflow-hidden">
      <thead>
        <tr className="bg-orange-100">
          {columns.map((col) => (
            <th key={col.key as string} className="px-4 py-2 text-left">
              {col.label}
            </th>
          ))}
          {actions && <th className="px-4 py-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id} className="border-b hover:bg-orange-50">
            {columns.map((col) => (
              <td key={col.key as string} className="px-4 py-2">
                {col.render ? col.render(item) : (item as any)[col.key]}
              </td>
            ))}
            {actions && <td className="px-4 py-2 flex gap-2">{actions(item)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
