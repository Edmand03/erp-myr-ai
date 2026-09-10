export function PageContainer({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-w-6xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
        {title}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {children}
      </div>
    </div>
  );
}
