interface ResponsiveImageProps {
  desktop?: string;
  mobile?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function ResponsiveImage({
  desktop,
  mobile,
  alt,
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
}: ResponsiveImageProps) {
  const fallback = desktop || mobile;

  if (!fallback) return null;

  return (
    <picture>
      {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
      {desktop && <source media="(min-width: 768px)" srcSet={desktop} />}
      <img
        src={fallback}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
      />
    </picture>
  );
}
