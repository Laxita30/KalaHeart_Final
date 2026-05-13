import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Users, Package, Palette, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

type DayPoint = { date: string; total: number };
type TopProduct = { name: string; sold: number; revenue: number };

const AdminOverview = () => {
  const [stats, setStats] = useState({ users: 0, artists: 0, products: 0, orders: 0, revenue: 0, growth: 0 });
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);

  useEffect(() => {
    (async () => {
      const [u, a, p, o, items] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("artists").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id, total_price, created_at").limit(1000),
        supabase.from("order_items").select("quantity, price, product_id, created_at, products(title)").limit(2000),
      ]);

      const orders = o.data ?? [];
      const orderItems = (items.data ?? []) as any[];

      // last 30 days revenue series
      const days: Record<string, number> = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        days[d.toISOString().slice(5, 10)] = 0;
      }
      let totalRevenue = 0;
      orders.forEach((row: any) => {
        totalRevenue += Number(row.total_price ?? 0);
        const key = new Date(row.created_at).toISOString().slice(5, 10);
        if (key in days) days[key] += Number(row.total_price ?? 0);
      });
      const points = Object.entries(days).map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }));
      setSeries(points);

      // growth: last 15 days vs previous 15 days
      const half = Math.floor(points.length / 2);
      const prev = points.slice(0, half).reduce((s, x) => s + x.total, 0);
      const recent = points.slice(half).reduce((s, x) => s + x.total, 0);
      const growth = prev === 0 ? (recent > 0 ? 100 : 0) : ((recent - prev) / prev) * 100;

      // best selling products
      const map: Record<string, TopProduct> = {};
      orderItems.forEach((it) => {
        const id = it.product_id;
        if (!map[id]) map[id] = { name: it.products?.title ?? "—", sold: 0, revenue: 0 };
        map[id].sold += Number(it.quantity ?? 0);
        map[id].revenue += Number(it.price ?? 0) * Number(it.quantity ?? 0);
      });
      setTop(Object.values(map).sort((x, y) => y.sold - x.sold).slice(0, 6));

      setStats({
        users: u.count ?? 0,
        artists: a.count ?? 0,
        products: p.count ?? 0,
        orders: o.data?.length ?? 0,
        revenue: Number(totalRevenue.toFixed(2)),
        growth: Number(growth.toFixed(1)),
      });
    })();
  }, []);

  const cards = [
    { label: "Users", value: stats.users.toLocaleString(), icon: Users },
    { label: "Artists", value: stats.artists.toLocaleString(), icon: Palette },
    { label: "Products", value: stats.products.toLocaleString(), icon: Package },
    { label: "Orders", value: stats.orders.toLocaleString(), icon: ShoppingBag },
    { label: "Total sales", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign },
    { label: "Growth (15d)", value: `${stats.growth > 0 ? "+" : ""}${stats.growth}%`, icon: TrendingUp },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Sales growth (last 30 days)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Best selling products</h3>
          <div className="h-72">
            {top.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No sales yet</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={top} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={110} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
