export const money = (value: number) =>
  `GH₵${value.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
