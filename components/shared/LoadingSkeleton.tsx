export function LoadingSkeleton() {
  return (
    <div className="loading-layout" aria-label="Loading page">
      <div className="loading-sidebar" />
      <div className="loading-main">
        <div className="skeleton-line skeleton-short" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-panel" />
        <div className="skeleton-grid">
          <div className="skeleton-panel" />
          <div className="skeleton-panel" />
        </div>
      </div>
    </div>
  );
}
