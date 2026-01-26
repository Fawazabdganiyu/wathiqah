export const formatCurrency = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined) return "₦0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(num);
};

export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};
