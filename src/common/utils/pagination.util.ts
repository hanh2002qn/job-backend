/**
 * Utility to construct a consistent pagination meta object.
 * Returns both totalPages and lastPage for maximum compatibility.
 */
export const createPaginationMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    lastPage: totalPages, // Maintain lastPage for compatibility
  };
};
