// The API's order statuses, and the one place that decides what "unshipped" means.
//
// The dashboard KPI and the orders table used to answer that question separately,
// and both got it wrong in the same two ways: they tested for a "Pending" status
// the API never writes, and for a missing shipDate the API always sets. ShipDate is
// a promised delivery date assigned at creation, two days out — never a dispatch
// timestamp — so it is never absent and cannot tell you whether anything shipped.

/** Accepted by PUT /api/v1/Orders/{id}; see OrdersController.orderStatuses. */
export const ORDER_STATUS = {
  ordered: "ordered",
  shipped: "shipped",
  onDelivery: "on delivery",
  delivered: "delivered",
};

// The service writes "Ordered" while the controller validates against a lowercase
// list case-insensitively, so stored casing depends on what the admin sent.
export function normalizeStatus(order) {
  return String(order?.orderStatus ?? "").trim().toLowerCase();
}

/** An order still waiting to leave: placed, not yet moved on by an operator. */
export function isUnshipped(order) {
  return normalizeStatus(order) === ORDER_STATUS.ordered;
}

/** Everything past "ordered" has been handed to the courier. */
export function isShipped(order) {
  const status = normalizeStatus(order);
  return (
    status === ORDER_STATUS.shipped ||
    status === ORDER_STATUS.onDelivery ||
    status === ORDER_STATUS.delivered
  );
}
