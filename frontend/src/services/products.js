const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sampleProducts = [
  {
    id: 'p1',
    name: 'Himalayan Wool Shawl',
    price: 89,
    category: 'Accessories',
    description: 'Soft handwoven wool shawl crafted for comfort and elegance.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    stock: 12,
    reviews: [
      { id: 1, user: 'sara', rating: 5, comment: 'Excellent quality and fast delivery.' },
      { id: 2, user: 'mike', rating: 4, comment: 'Very warm and beautiful finish.' }
    ]
  },
  {
    id: 'p2',
    name: 'Organic Tea Gift Box',
    price: 34,
    category: 'Food',
    description: 'A premium tea collection sourced directly from mountain farms.',
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=900&q=80',
    stock: 20,
    reviews: [
      { id: 3, user: 'aman', rating: 5, comment: 'Lovely packaging and delicious flavors.' }
    ]
  },
  {
    id: 'p3',
    name: 'Handmade Bamboo Basket',
    price: 49,
    category: 'Home',
    description: 'Traditional bamboo basket ideal for storage and decor.',
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    stock: 8,
    reviews: [{ id: 4, user: 'anita', rating: 4, comment: 'Great craftsmanship.' }]
  },
  {
    id: 'p4',
    name: 'Mountain Honey Jar',
    price: 28,
    category: 'Food',
    description: 'Pure honey harvested from high-altitude hives.',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e892a1153?auto=format&fit=crop&w=900&q=80',
    stock: 15,
    reviews: [{ id: 5, user: 'john', rating: 5, comment: 'Tastes amazing.' }]
  },
  {
    id: 'p5',
    name: 'Ceramic Tea Cup Set',
    price: 42,
    category: 'Home',
    description: 'Hand-glazed ceramic cups that bring heritage style to your table.',
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    stock: 10,
    reviews: [{ id: 6, user: 'maria', rating: 5, comment: 'Elegant and durable.' }]
  },
  {
    id: 'p6',
    name: 'Traditional Herbal Balm',
    price: 18,
    category: 'Wellness',
    description: 'A soothing balm made from local medicinal herbs.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    stock: 7,
    reviews: [{ id: 7, user: 'alex', rating: 4, comment: 'Very effective and natural.' }]
  }
];

export const getProducts = async ({ search = '', category = 'all', sort = 'newest', page = 1, limit = 6 }) => {
  await delay(400);

  let data = [...sampleProducts];

  if (search) {
    const term = search.toLowerCase();
    data = data.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }

  if (category && category !== 'all') {
    data = data.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (sort === 'price-asc') {
    data.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    data.sort((a, b) => b.price - a.price);
  } else {
    data.sort((a, b) => b.price - a.price); // default newest-ish ordering
  }

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  return { items: paged, totalPages, total };
};

export const getProductById = async (id) => {
  await delay(300);
  return sampleProducts.find((item) => item.id === id) || null;
};

export const getRelatedProducts = async (id) => {
  await delay(200);
  const current = sampleProducts.find((item) => item.id === id);
  if (!current) return [];
  return sampleProducts.filter((item) => item.id !== id).slice(0, 3);
};