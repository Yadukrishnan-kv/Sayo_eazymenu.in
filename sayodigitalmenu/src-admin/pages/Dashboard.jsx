import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FolderOpen, ListTree, UtensilsCrossed, Tags, ExternalLink } from 'lucide-react';
import { fetchMainSections } from '../store/slices/mainSectionsSlice';
import { UsageChart } from '../components/dashboard/UsageChart';
import { fetchClassifications } from '../store/slices/classificationsSlice';
import { fetchMenuItems } from '../store/slices/menuItemsSlice';
import { fetchTags } from '../store/slices/tagsSlice';

const StatCard = ({ icon: Icon, label, value, to }) => (
  <Link
    to={to}
    className="flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group"
  >
    <div className="p-3 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent group-hover:shadow-sayo-gold transition-shadow">
      <Icon className="w-8 h-8" aria-hidden />
    </div>
    <div>
      <p className="text-2xl font-display font-semibold text-sayo-cream">{value}</p>
      <p className="text-sm text-sayo-creamMuted">{label}</p>
    </div>
  </Link>
);

export function Dashboard() {
  const dispatch = useDispatch();
  const { items: mainSections } = useSelector((s) => s.mainSections);
  const { items: classifications } = useSelector((s) => s.classifications);
  const { items: menuItems } = useSelector((s) => s.menuItems);
  const { items: tags } = useSelector((s) => s.tags);

  useEffect(() => {
    dispatch(fetchMainSections());
    dispatch(fetchClassifications());
    dispatch(fetchMenuItems());
    dispatch(fetchTags());
  }, [dispatch]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sayo-accent">Dashboard</h1>
        <p className="text-sayo-creamMuted mt-1">Overview of your SAYO menu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FolderOpen}
          label="Main Sections"
          value={mainSections.length}
          to="/main-sections"
        />
        <StatCard
          icon={ListTree}
          label="Classifications"
          value={classifications.length}
          to="/classifications"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Menu Items"
          value={menuItems.length}
          to="/menu-items"
        />
        <StatCard
          icon={Tags}
          label="Tags"
          value={tags.length}
          to="/filters-tags"
        />
        <a
          href="https://69a27ab7fbb4533a7b51fe13--sayo-online-menu.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group lg:col-span-1"
        >
          <div className="p-3 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent">
            <ExternalLink className="w-8 h-8" aria-hidden />
          </div>
          <div>
            <p className="text-lg font-display font-semibold text-sayo-cream">View Menu</p>
            <p className="text-sm text-sayo-creamMuted">Open public menu</p>
          </div>
        </a>
      </div>

      <div className="mb-8">
        <UsageChart />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-sayo-cream mb-4">Main Sections</h2>
          {mainSections.length === 0 ? (
            <p className="text-sayo-creamMuted">No main sections yet. <Link to="/main-sections" className="text-sayo-accent hover:underline">Add Food, Kids, Beverages</Link></p>
          ) : (
            <ul className="space-y-2 rounded-lg border border-sayo-borderSubtle p-4">
              {mainSections.slice(0, 5).map((s) => (
                <li key={s.id} className="flex justify-between py-2 border-b border-sayo-borderSubtle last:border-0 last:pb-0">
                  <span className="text-sayo-cream">{s.name}</span>
                  <Link to="/main-sections" className="text-sayo-accent text-sm hover:underline">Edit</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-sayo-cream mb-4">Recent Menu Items</h2>
          {menuItems.length === 0 ? (
            <p className="text-sayo-creamMuted">No items yet. <Link to="/menu-items" className="text-sayo-accent hover:underline">Add one</Link></p>
          ) : (
            <ul className="space-y-2 rounded-lg border border-sayo-borderSubtle p-4">
              {menuItems.slice(0, 5).map((i) => (
                <li key={i.id} className="flex justify-between py-2 border-b border-sayo-borderSubtle last:border-0 last:pb-0">
                  <span className="text-sayo-cream">{i.name}</span>
                  <span className="text-sayo-accent">{i.price} SAR</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
