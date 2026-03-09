const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  mainSections: 'sayo_main_sections',
  classifications: 'sayo_classifications',
  menuItems: 'sayo_menu_items',
  tags: 'sayo_tags',
  settings: 'sayo_settings',
};

const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const mockApi = {
  mainSections: {
    getAll: async () => {
      await delay(300);
      const data = getFromStorage(STORAGE_KEYS.mainSections, [
        { id: 'food', name: 'Food menu', slug: 'food', order: 0 },
        { id: 'kids', name: 'Kids menu', slug: 'kids', order: 1 },
        { id: 'beverages', name: 'Beverages menu', slug: 'beverages', order: 2 },
      ]);
      return data.sort((a, b) => a.order - b.order);
    },
    create: async (section) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.mainSections, []);
      const slug = section.slug || section.name?.toLowerCase().replace(/\s+/g, '-');
      const newSection = { ...section, id: generateId(), slug, order: data.length };
      data.push(newSection);
      setToStorage(STORAGE_KEYS.mainSections, data);
      return newSection;
    },
    update: async (id, updates) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.mainSections, []);
      const idx = data.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Main section not found');
      data[idx] = { ...data[idx], ...updates };
      setToStorage(STORAGE_KEYS.mainSections, data);
      return data[idx];
    },
    delete: async (id) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.mainSections, []).filter((s) => s.id !== id);
      setToStorage(STORAGE_KEYS.mainSections, data);
      return { success: true };
    },
  },

  classifications: {
    getAll: async () => {
      await delay(300);
      const data = getFromStorage(STORAGE_KEYS.classifications, [
        { id: '1', name: 'Soups', mainSectionId: 'food', order: 0 },
        { id: '2', name: 'Salads', mainSectionId: 'food', order: 1 },
        { id: '3', name: 'Sushi', mainSectionId: 'food', order: 2 },
        { id: '4', name: 'Dim Sum & Bao', mainSectionId: 'food', order: 3 },
        { id: '5', name: 'Robata Grill', mainSectionId: 'food', order: 4 },
        { id: '6', name: 'Mains', mainSectionId: 'food', order: 5 },
        { id: '7', name: 'Indian', mainSectionId: 'food', order: 6 },
        { id: '8', name: 'Desserts', mainSectionId: 'food', order: 7 },
        { id: '9', name: 'Drinks', mainSectionId: 'beverages', order: 0 },
        { id: '10', name: 'Kids Meals', mainSectionId: 'kids', order: 0 },
      ]);
      return data.sort((a, b) => {
        if (a.mainSectionId !== b.mainSectionId) return 0;
        return (a.order ?? 0) - (b.order ?? 0);
      });
    },
    getByMainSection: async (mainSectionId) => {
      const all = await mockApi.classifications.getAll();
      return all.filter((c) => c.mainSectionId === mainSectionId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    create: async (classification) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.classifications, []);
      const newClass = { ...classification, id: generateId(), order: data.length };
      data.push(newClass);
      setToStorage(STORAGE_KEYS.classifications, data);
      return newClass;
    },
    update: async (id, updates) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.classifications, []);
      const idx = data.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Classification not found');
      data[idx] = { ...data[idx], ...updates };
      setToStorage(STORAGE_KEYS.classifications, data);
      return data[idx];
    },
    delete: async (id) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.classifications, []).filter((c) => c.id !== id);
      setToStorage(STORAGE_KEYS.classifications, data);
      return { success: true };
    },
    reorder: async (mainSectionId, orderedIds) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.classifications, []);
      orderedIds.forEach((id, order) => {
        const item = data.find((c) => c.id === id);
        if (item) item.order = order;
      });
      setToStorage(STORAGE_KEYS.classifications, data);
      return data;
    },
  },

  menuItems: {
    getAll: async () => {
      await delay(300);
      const data = getFromStorage(STORAGE_KEYS.menuItems, [
        { id: '1', name: 'Tom Yum Soup - With Chicken', description: 'A spicy and tangy Thai soup made with bird\'s eye chilli...', price: 22, mainSectionId: 'food', classificationId: '1', imageUrl: '', tags: ['spicy'], spiceLevel: 'medium', isActive: true, order: 0 },
        { id: '2', name: 'Hot & Sour Soup - With Veggies', description: 'Spicy and tangy soup with shredded mushroom & bamboo...', price: 20, mainSectionId: 'food', classificationId: '1', imageUrl: '', tags: ['vegetarian'], spiceLevel: 'mild', isActive: true, order: 1 },
      ]);
      return data;
    },
    getByClassification: async (classificationId) => {
      const all = await mockApi.menuItems.getAll();
      return all.filter((i) => i.classificationId === classificationId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    create: async (item) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.menuItems, []);
      const newItem = { ...item, id: generateId(), order: data.length, tags: item.tags || [] };
      data.push(newItem);
      setToStorage(STORAGE_KEYS.menuItems, data);
      return newItem;
    },
    update: async (id, updates) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.menuItems, []);
      const idx = data.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error('Item not found');
      data[idx] = { ...data[idx], ...updates };
      setToStorage(STORAGE_KEYS.menuItems, data);
      return data[idx];
    },
    delete: async (id) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.menuItems, []).filter((i) => i.id !== id);
      setToStorage(STORAGE_KEYS.menuItems, data);
      return { success: true };
    },
    reorder: async (classificationId, orderedIds) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.menuItems, []);
      orderedIds.forEach((id, order) => {
        const item = data.find((i) => i.id === id);
        if (item) item.order = order;
      });
      setToStorage(STORAGE_KEYS.menuItems, data);
      return data;
    },
  },

  tags: {
    getAll: async () => {
      await delay(300);
      const data = getFromStorage(STORAGE_KEYS.tags, [
        { id: '1', name: 'Vegetarian', slug: 'vegetarian', color: '#4ade80' },
        { id: '2', name: 'Spicy', slug: 'spicy', color: '#f87171' },
        { id: '3', name: 'Vegan', slug: 'vegan', color: '#22c55e' },
      ]);
      return data;
    },
    create: async (tag) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.tags, []);
      const newTag = { ...tag, id: generateId(), slug: (tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-')) };
      data.push(newTag);
      setToStorage(STORAGE_KEYS.tags, data);
      return newTag;
    },
    update: async (id, updates) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.tags, []);
      const idx = data.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Tag not found');
      data[idx] = { ...data[idx], ...updates };
      setToStorage(STORAGE_KEYS.tags, data);
      return data[idx];
    },
    delete: async (id) => {
      await delay(200);
      const data = getFromStorage(STORAGE_KEYS.tags, []).filter((t) => t.id !== id);
      setToStorage(STORAGE_KEYS.tags, data);
      return { success: true };
    },
  },

  settings: {
    get: async () => {
      await delay(200);
      return getFromStorage(STORAGE_KEYS.settings, {
        restaurantName: 'SAYO',
        tagline: 'Pan Asian Restaurant',
        currency: 'SAR',
        menuPublicUrl: 'https://69a27ab7fbb4533a7b51fe13--sayo-online-menu.netlify.app/',
        // Opening screen (splash)
        openingVideoUrl: '',
        openingImageUrl: '',
        openingDescription: "SAYO is a name inspired by the initials of its visionary founders, and in Japanese, it beautifully means 'Born at Night.' Just as the night gives birth to new possibilities, SAYO represents a bold, fresh beginning in the culinary landscape of Jubail, KSA.",
        openingDescriptionAr: '',
        openingTagline: 'Journey through Asian Cuisine',
        openingTaglineAr: 'رحلة عبر المطبخ الأسيوي',
        openingButtonText: 'Continue to Menu',
        openingButtonTextAr: 'انتقل إلى القائمة',
        // Hero section
        heroVideoUrl: '',
        heroImageUrl: '',
        heroDescription: "SAYO is a name inspired by the initials of its visionary founders, and in Japanese, it beautifully means 'Born at Night.' Just as the night gives birth to new possibilities, SAYO represents a bold, fresh beginning in the culinary landscape of Jubail, KSA.",
        heroDescriptionAr: '',
        heroTagline: 'PAN ASIAN CUISINE',
        heroTaglineAr: 'المطبخ الآسيوي',
      });
    },
    update: async (updates) => {
      await delay(200);
      const current = getFromStorage(STORAGE_KEYS.settings, {});
      const merged = { ...current, ...updates };
      setToStorage(STORAGE_KEYS.settings, merged);
      return merged;
    },
  },
};
