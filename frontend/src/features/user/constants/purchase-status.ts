export const purchaseProcessStatusMap: Record<string, { color: string; label: string }> = {
  pending_confirm: { color: "gold", label: "Chờ xác nhận" },
  ready_to_pick: { color: "blue", label: "Chờ lấy hàng" },
  ready_to_ship: { color: "cyan", label: "Chờ giao hàng" },
  delivered: { color: "green", label: "Đã giao" },
  awaiting_return: { color: "orange", label: "Đợi hoàn hàng" },
  returned: { color: "volcano", label: "Trả hàng" },
  cancelled: { color: "red", label: "Đã huỷ" },
  // Legacy statuses for old data
  pending: { color: "gold", label: "Chờ xác nhận" },
  processing: { color: "blue", label: "Chờ lấy hàng" },
  completed: { color: "default", label: "Hoàn thành" },
  confirmed: { color: "blue", label: "Đã xác nhận" },
  shipping: { color: "cyan", label: "Đang giao" },
};

export const purchasePaymentStatusMap: Record<string, { color: string; label: string }> = {
  unpaid: { color: "orange", label: "Chờ thanh toán" },
  paid: { color: "green", label: "Đã thanh toán" },
};
