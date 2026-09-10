"use client";

export function CustomerTable({ customers }: { customers: any[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left">Name</th>
          <th className="px-6 py-3 text-left">Company</th>
          <th className="px-6 py-3 text-left">Email</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {customers.map((c) => (
          <tr key={c.id}>
            <td className="px-6 py-4">{c.name}</td>
            <td className="px-6 py-4">{c.company}</td>
            <td className="px-6 py-4">{c.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
