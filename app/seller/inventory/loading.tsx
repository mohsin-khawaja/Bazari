export default function InventoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Items List Skeleton */}
        <div className="bg-card border rounded-lg">
          <div className="p-6 border-b">
            <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                      <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
