-- Allow artists to update orders that contain their products
CREATE POLICY "Artists can update orders for their products"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    JOIN public.artists a ON a.id = p.artist_id
    WHERE oi.order_id = orders.id AND a.user_id = auth.uid()
  )
);