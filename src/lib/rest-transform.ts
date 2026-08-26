/** Drop leftover translateY(0) so stills aren't rasterized at 1x on desktop. */
export const restTransform = {
  transformTemplate: ({ y }: { y?: number | string }, generated: string) => {
    const n = typeof y === "number" ? y : parseFloat(String(y ?? 0));
    return !n ? "none" : generated;
  },
};
