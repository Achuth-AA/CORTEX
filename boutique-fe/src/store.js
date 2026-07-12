export const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer']

export const inr = (n) =>
  `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`

export const txStatus = (t) =>
  t.received >= t.amount ? 'Paid' : t.received > 0 ? 'Partial' : 'Pending'
