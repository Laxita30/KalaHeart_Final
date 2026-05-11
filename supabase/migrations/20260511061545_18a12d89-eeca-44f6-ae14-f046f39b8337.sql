-- Allow artists to view orders and order_items that contain their products
CREATE POLICY "Artists can view order items for their products"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.artists a ON a.id = p.artist_id
    WHERE p.id = order_items.product_id
      AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Artists can view orders containing their products"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    JOIN public.artists a ON a.id = p.artist_id
    WHERE oi.order_id = orders.id
      AND a.user_id = auth.uid()
  )
);
