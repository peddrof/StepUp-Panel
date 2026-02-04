interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-5 mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}
