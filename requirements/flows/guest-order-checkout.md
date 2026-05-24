# Guest Order Checkout

1. Customer creates an order with selected payment provider and shipping address.
2. Backend creates the order and returns a one-time guest checkout token when the order has no customer account.
3. Guest submits the order code, guest checkout token, and checkout request.
4. Payment creates or returns the pending checkout only when the token matches the order.
5. Payment success keeps using the existing payment events and order lifecycle.
