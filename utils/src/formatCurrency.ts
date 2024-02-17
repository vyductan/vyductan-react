export function formatCurrencyVND(amount: number): string {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })

  return formatter.format(amount)
}
