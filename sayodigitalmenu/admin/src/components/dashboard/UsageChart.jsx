import { useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { getUsageByDay, recordVisit } from '../../lib/usageTracking';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-sayo-surface border border-sayo-border rounded-lg px-4 py-3 shadow-lg">
      <p className="text-sm text-sayo-creamMuted mb-1">{label}</p>
      <p className="text-lg font-display font-semibold text-sayo-accent">
        {payload[0]?.value} {payload[0]?.value === 1 ? 'visit' : 'visits'}
      </p>
    </div>
  );
};

export function UsageChart() {
  const data = getUsageByDay(14);

  useEffect(() => {
    recordVisit();
  }, []);

  return (
    <div className="rounded-lg border border-sayo-borderSubtle p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent">
          <BarChart3 className="w-5 h-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-sayo-cream">App Usage</h2>
          <p className="text-sm text-sayo-creamMuted">Admin panel visits per day (last 14 days)</p>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sayoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sayo-accent)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--sayo-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--sayo-border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="var(--sayo-cream-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--sayo-border-subtle)' }}
            />
            <YAxis
              stroke="var(--sayo-cream-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--sayo-border-subtle)' }} />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="var(--sayo-accent)"
              strokeWidth={2}
              fill="url(#sayoGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
