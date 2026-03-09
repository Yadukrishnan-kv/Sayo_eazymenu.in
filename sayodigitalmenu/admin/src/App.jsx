import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { MainSections } from './pages/MainSections';
import { Classifications } from './pages/Classifications';
import { MenuItems } from './pages/MenuItems';
import { FiltersTags } from './pages/FiltersTags';
import { HeroOpening } from './pages/HeroOpening';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="main-sections" element={<MainSections />} />
            <Route path="classifications" element={<Classifications />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="filters-tags" element={<FiltersTags />} />
            <Route path="hero-opening" element={<HeroOpening />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
