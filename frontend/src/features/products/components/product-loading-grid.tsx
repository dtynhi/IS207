export const ProductLoadingGrid = ({ count = 10 }: { count?: number }) => {
  return (
    <div className="um-product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="um-card">
          <div className="um-skeleton um-skeleton-square" />
          <div className="um-skeleton-card-body">
            <div className="um-skeleton um-skeleton-line um-skeleton-line-wide" />
            <div className="um-skeleton um-skeleton-line um-skeleton-line-mid" />
            <div className="um-skeleton um-skeleton-line-short" />
          </div>
        </div>
      ))}
    </div>
  );
};
