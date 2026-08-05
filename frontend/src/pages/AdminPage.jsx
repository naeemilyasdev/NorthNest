import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  PlusCircle,
  Search,
  Settings2,
  ShoppingBag,
  Star,
  Sun,
  Tags,
  Users,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { adminService } from '../services/adminService';
import { settingsService } from '../services/settingsService';
import { showToast } from '../utils/toast';
import { formatDate, formatPrice } from '../utils/formatters';
import { PRODUCT_CATEGORIES } from '../config/constants.js';

const categories = PRODUCT_CATEGORIES;
const orderStatusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Products', icon: Package },
  { label: 'Orders', icon: ShoppingBag },
  { label: 'Customers', icon: Users },
  { label: 'Categories', icon: Tags },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Reviews', icon: Star },
  { label: 'Settings', icon: Settings2 },
  { label: 'Logout', icon: LogOut },
];

const getStatusMeta = (status) => {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmed',
        tone: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200',
      };
    case 'shipped':
      return {
        label: 'Shipped',
        tone: 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-200',
      };
    case 'delivered':
      return {
        label: 'Delivered',
        tone: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        tone: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200',
      };
    default:
      return {
        label: 'Pending',
        tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200',
      };
  }
};

export const AdminPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [searchOrder, setSearchOrder] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productStatus, setProductStatus] = useState('All');
  const [productPage, setProductPage] = useState(1);
  const [selectedProductImage, setSelectedProductImage] = useState('');
  const [modalConfig, setModalConfig] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('All');
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'North Nest',
    tagline: 'Mountain essentials from the Himalayas',
    logo: '',
    team: [
      { name: 'Ayesha', position: 'Founder', intro: 'Founder & sourcing lead, connecting mountain growers with customers worldwide.', profilePic: '' },
      { name: 'Mohammed', position: 'Operations Manager', intro: 'Operations manager ensuring every product is handled with care and shipped promptly.', profilePic: '' },
      { name: 'Sara', position: 'Customer Experience Lead', intro: 'Customer experience lead, available to support you before, during, and after every order.', profilePic: '' },
    ],
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0] || 'Honey',
    image: '',
    stock: '',
    isActive: true,
  });

  const PRODUCTS_PER_PAGE = 6;

  const loadData = async () => {
    try {
      setLoading(true);
      const [productResponse, orderResponse] = await Promise.all([
        productService.getAllProducts({ limit: 200, page: 1 }),
        orderService.getOrders(),
      ]);
      setProducts(productResponse.data || []);
      setOrders(orderResponse.data || []);
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const response = await adminService.getOverview();
      setOverview(response || null);
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to load admin overview', 'error');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await adminService.getCustomers();
      setCustomers(response || []);
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to load customer details', 'error');
    }
  };

  useEffect(() => {
    loadData();
    loadOverview();
    loadCustomers();
    loadStoreSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: categories[0] || 'Honey',
      image: '',
      stock: '',
      isActive: true,
    });
    setSelectedProductImage('');
    setEditingProductId(null);
  };

  const handleSidebarClick = (label) => {
    if (label === 'Logout') {
      logout();
      navigate('/');
      return;
    }
    setActiveSection(label);
  };

  const openConfirmModal = ({ title, description, onConfirm }) => {
    setModalConfig({ title, description, onConfirm });
  };

  const closeConfirmModal = () => setModalConfig(null);

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProductImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setSelectedProductImage(result);
      setProductForm((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const loadStoreSettings = async () => {
    try {
      const data = await settingsService.getAdminStoreSettings();
      setStoreSettings((prev) => ({
        ...prev,
        storeName: data.storeName || prev.storeName,
        tagline: data.tagline || prev.tagline,
        logo: data.logo || '',
        team: Array.isArray(data.team) ? data.team : prev.team,
        totalOrders: data.totalOrders || 0,
        deliveredOrders: data.deliveredOrders || 0,
        cancelledOrders: data.cancelledOrders || 0,
      }));
      setLogoPreview(data.logo || '');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to load store settings', 'error');
    }
  };

  const handleStoreSettingsChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (index, field, value) => {
    setStoreSettings((prev) => {
      const updatedTeam = [...prev.team];
      updatedTeam[index] = {
        ...updatedTeam[index],
        [field]: value,
      };
      return { ...prev, team: updatedTeam };
    });
  };

  const handleTeamImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setStoreSettings((prev) => {
        const updatedTeam = [...prev.team];
        updatedTeam[index] = {
          ...updatedTeam[index],
          profilePic: result,
        };
        return { ...prev, team: updatedTeam };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddTeamMember = () => {
    setStoreSettings((prev) => ({
      ...prev,
      team: [
        ...prev.team,
        { name: '', position: '', intro: '', profilePic: '' },
      ],
    }));
  };

  const handleRemoveTeamMember = (index) => {
    setStoreSettings((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const handleStoreLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setLogoPreview(result);
      setStoreSettings((prev) => ({ ...prev, logo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await settingsService.updateAdminStoreSettings({
        storeName: storeSettings.storeName,
        tagline: storeSettings.tagline,
        logo: storeSettings.logo,
        team: storeSettings.team,
      });
      setStoreSettings((prev) => ({
        ...prev,
        storeName: updated.storeName,
        tagline: updated.tagline,
        logo: updated.logo,
        team: Array.isArray(updated.team) ? updated.team : prev.team,
      }));
      setLogoPreview(updated.logo || '');
      showToast('Store settings saved', 'success');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to save store settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSavingProduct(true);

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description || `${productForm.name} crafted for premium Himalayan living.`,
        price: Number(productForm.price),
        category: productForm.category,
        image: productForm.image || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
        stock: Number(productForm.stock || 0),
        isActive: productForm.isActive,
      };

      if (editingProductId) {
        await productService.updateProduct(editingProductId, payload);
        showToast('Product updated', 'success');
      } else {
        await productService.createProduct(payload);
        showToast('Product created', 'success');
      }

      resetProductForm();
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Product save failed', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      isActive: product.isActive,
    });
    setSelectedProductImage(product.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (product) => {
    handleEditProduct(product);
    showToast('Product loaded for review', 'success');
  };

  const handleDeleteProduct = async (productId) => {
    openConfirmModal({
      title: 'Delete product',
      description: 'This action will permanently remove this product from the catalog.',
      onConfirm: async () => {
        try {
          await productService.deleteProduct(productId);
          showToast('Product deleted', 'success');
          await loadData();
        } catch (error) {
          showToast(error?.response?.data?.message || 'Delete failed', 'error');
        } finally {
          closeConfirmModal();
        }
      },
    });
  };

  const handleOrderStatusChange = async (orderId, nextStatus) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(orderId, nextStatus);
      showToast('Order status updated', 'success');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    openConfirmModal({
      title: 'Cancel order',
      description: 'Cancelling this order will return payment to the customer and mark it cancelled.',
      onConfirm: async () => {
        try {
          setLoading(true);
          await orderService.cancelOrder(orderId);
          showToast('Order cancelled successfully', 'success');
          await loadData();
        } catch (error) {
          showToast(error?.response?.data?.message || 'Cancel failed', 'error');
        } finally {
          setLoading(false);
          closeConfirmModal();
        }
      },
    });
  };

  const handleDeleteOrder = async (orderId) => {
    openConfirmModal({
      title: 'Delete order',
      description: 'This will permanently remove the order record from the dashboard.',
      onConfirm: async () => {
        try {
          setLoading(true);
          await orderService.deleteOrder(orderId);
          showToast('Order deleted successfully', 'success');
          await loadData();
        } catch (error) {
          showToast(error?.response?.data?.message || 'Delete failed', 'error');
        } finally {
          setLoading(false);
          closeConfirmModal();
        }
      },
    });
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((product) => product.isActive).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const revenuePercent = overview?.growthPercentage ?? 12;
  const currentDate = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchMatch = product.name.toLowerCase().includes(productSearch.toLowerCase());
      const categoryMatch = productCategory === 'All' || product.category === productCategory;
      const statusMatch = productStatus === 'All' || (productStatus === 'Live' ? product.isActive : !product.isActive);
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [products, productSearch, productCategory, productStatus]);

  const displayedProducts = useMemo(() => {
    const start = (productPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, productPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchOrder.toLowerCase();
      const orderNumber = (order.orderNumber || '').toString();
      const firstName = order.userId?.firstName || '';
      const lastName = order.userId?.lastName || '';
      const matchesSearch = orderNumber.toLowerCase().includes(query) || firstName.toLowerCase().includes(query) || lastName.toLowerCase().includes(query);
      const matchesFilter = orderFilter === 'All' || order.orderStatus === orderFilter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchOrder, orderFilter]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  const customerOrderCounts = useMemo(() => {
    const counts = {};
    orders.forEach((order) => {
      const userId = order.userId?._id || order.userId;
      if (userId) {
        counts[userId.toString()] = (counts[userId.toString()] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  const reviewList = useMemo(() => {
    return products
      .flatMap((product) =>
        (product.reviews || []).map((review) => ({
          ...review,
          productName: product.name,
          productId: product._id,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [products]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const query = customerSearch.toLowerCase();
      const matchesName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase().includes(query);
      const matchesEmail = (customer.email || '').toLowerCase().includes(query);
      const matchesStatus = customerStatusFilter === 'All' || customer.status === customerStatusFilter;
      return (matchesName || matchesEmail) && matchesStatus;
    });
  }, [customers, customerSearch, customerStatusFilter]);

  const getUserStatusMeta = (status) => {
    return status === 'Active'
      ? {
          label: 'Active',
          tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200',
        }
      : {
          label: 'Inactive',
          tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        };
  };

  const toggleOrderItems = (orderId) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleShowCustomerOrders = (customer) => {
    setSearchOrder(`${customer.firstName || ''} ${customer.lastName || ''}`.trim());
    setOrderFilter('All');
    setActiveSection('Orders');
  };

  const recentActivity = useMemo(() => {
    return [
      ...orders.slice(0, 3).map((order) => ({
        label: `Order ${order.orderNumber || 'Unknown'} updated to ${order.orderStatus || 'pending'}`,
        time: order.createdAt ? formatDate(order.createdAt) : 'Unknown date',
        type: 'order',
      })),
      ...products.slice(0, 2).map((product) => ({
        label: `Product ${product.name || 'Item'} reviewed`,
        time: 'Just now',
        type: 'product',
      })),
    ];
  }, [orders, products]);

  // The section content is rendered inline in JSX.

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <aside className={`hidden w-80 shrink-0 flex-col border-r border-slate-200 bg-white/95 px-5 py-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 xl:flex ${isSidebarOpen ? '' : 'w-20'}`}>
          <div className="mb-10 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">North Nest</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Admin panel</h1>
            </div>
            <button type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900" onClick={() => setIsSidebarOpen((prev) => !prev)}>
              <ChevronDown size={18} className={`${isSidebarOpen ? '' : 'rotate-180'}`} />
            </button>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSidebarClick(item.label)}
                  className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-emerald-50 text-emerald-800 shadow-sm dark:bg-emerald-900/20 dark:text-emerald-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 xl:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex items-center gap-3">
                    <Search size={16} className="text-slate-400" />
                    <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500" placeholder="Search dashboard" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">{currentDate}</span>
                  <button type="button" onClick={toggleTheme} className="rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-emerald-300 dark:border-slate-700 dark:text-slate-200">
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button type="button" className="rounded-3xl border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-emerald-300 dark:border-slate-700 dark:text-slate-200">
                    <Bell size={16} />
                  </button>
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                      className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-slate-600 dark:hover:bg-slate-850"
                      aria-expanded={isAccountMenuOpen}
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-semibold text-white">N</span>
                      <span className="text-slate-900 dark:text-slate-100">Admin</span>
                      <ChevronDown size={16} />
                    </button>
                    <div className={`absolute right-0 mt-3 w-52 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200 transition dark:border-slate-800 dark:bg-slate-950 dark:ring-slate-700 ${isAccountMenuOpen ? 'block' : 'hidden'}`}>
                      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your profile</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/profile');
                          setIsAccountMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        <span className="rounded-2xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">P</span>
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/settings');
                          setIsAccountMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        <span className="rounded-2xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">S</span>
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsAccountMenuOpen(false);
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/40 dark:text-red-400"
                      >
                        <span className="rounded-2xl bg-red-100 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-300">L</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {activeSection === 'Dashboard' && (
              <div className="mx-auto grid max-w-7xl gap-6">
                <section className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
                <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">North Nest admin</p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Welcome back</h2>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage inventory, orders, and insights from one premium panel.</p>
                    </div>
                    <span className="rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Live view</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.75rem] bg-emerald-50 p-5 shadow-sm dark:bg-emerald-900/20">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-white p-3 text-emerald-700 dark:bg-slate-950/80 dark:text-emerald-200">
                          <Package size={18} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Trend</span>
                      </div>
                      <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{totalProducts}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Products live</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                        <ArrowUpRight size={14} /> <span>+8.2%</span>
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm dark:bg-slate-950/80">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <Users size={18} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Growth</span>
                      </div>
                      <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{overview?.totalCustomers ?? '-'}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Customers</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <ArrowUpRight size={14} /> <span>+4.6%</span>
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm dark:bg-slate-950/80">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <ShoppingBag size={18} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Orders</span>
                      </div>
                      <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{totalOrders}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Orders processed</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                        <ArrowUpRight size={14} /> <span>+15%</span>
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] bg-slate-950/95 p-5 text-white shadow-sm dark:bg-slate-900/95">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-emerald-700 p-3 text-white">
                          <BarChart3 size={18} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Revenue</span>
                      </div>
                      <p className="mt-5 text-3xl font-semibold">{formatPrice(totalRevenue)}</p>
                      <p className="mt-2 text-sm text-emerald-300">Total revenue</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-200">
                        <ArrowUpRight size={14} /> <span>+{revenuePercent}%</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Inventory analytics</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Health snapshot</h3>
                    </div>
                    <div className="rounded-3xl bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">Updated</div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Active listings</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{activeProducts}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Stock alerts</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{outOfStock}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Pending orders</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{orders.filter((order) => order.orderStatus === 'pending').length}</p>
                    </div>
                  </div>
                </article>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
                <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Order management</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Review, update, and action the latest orders.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Input placeholder="Search orders" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="max-w-[220px]" />
                      <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="input-field max-w-[180px]">
                        <option value="All">All statuses</option>
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/70">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Order ID</th>
                          <th className="px-5 py-4 font-semibold">Customer</th>
                          <th className="px-5 py-4 font-semibold">Amount</th>
                          <th className="px-5 py-4 font-semibold">Payment</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">Date</th>
                          <th className="px-5 py-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <tr key={index} className="animate-pulse border-t border-slate-200 dark:border-slate-800">
                              <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              <td className="h-16 px-5 py-4"><div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              <td className="h-16 px-5 py-4"><div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                            </tr>
                          ))
                        ) : filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No orders match your search criteria.</td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => {
                            const statusMeta = getStatusMeta(order.orderStatus);
                            return (
                              <React.Fragment key={order._id}>
                                <tr className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{order.orderNumber}</td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{order.userId?.firstName || 'Customer'} {order.userId?.lastName || ''}</td>
                                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{formatPrice(order.total)}</td>
                                  <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200' : order.paymentStatus === 'refunded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                      {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>{statusMeta.label}</span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(order.createdAt)}</td>
                                  <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                        className="input-field w-full max-w-[160px] px-3 py-2 text-sm"
                                      >
                                        {orderStatusOptions.map((status) => (
                                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))}
                                      </select>
                                      <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => toggleOrderItems(order._id)}>
                                        {expandedOrderIds.includes(order._id) ? 'Hide items' : 'View items'}
                                      </Button>
                                      <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleCancelOrder(order._id)} disabled={order.orderStatus === 'cancelled'}>Cancel</Button>
                                      <Button type="button" variant="danger" className="px-3 py-2 text-xs" onClick={() => handleDeleteOrder(order._id)}>Delete</Button>
                                    </div>
                                  </td>
                                </tr>
                                {expandedOrderIds.includes(order._id) && (
                                  <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                                    <td colSpan={7} className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                                      <div className="space-y-2">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">Order items</p>
                                        <ul className="grid gap-2 sm:grid-cols-2">
                                          {order.items.map((item, index) => {
                                            const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                                            return (
                                              <li key={item._id || index} className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                                                <div className="flex items-center justify-between gap-3">
                                                  <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{product?.name || 'Unknown product'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity} · Price: {formatPrice(item.price)}</p>
                                                  </div>
                                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatPrice(item.total)}</p>
                                                </div>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent activity</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Latest product and order actions.</p>
                    </div>
                    <Download size={18} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No recent activity available.</div>
                    ) : (
                      recentActivity.map((entry, idx) => (
                        <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
                                {entry.type === 'order' ? <ShoppingBag size={18} /> : <Package size={18} />}
                              </span>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{entry.label}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{entry.time}</p>
                              </div>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{entry.type}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </section>
            </div>
            )}

            {activeSection === 'Products' && (
                <section className="grid gap-6">
                  <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Products management</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Create, edit, and remove product inventory directly from the admin panel.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Input value={productSearch} onChange={(e) => { setProductPage(1); setProductSearch(e.target.value); }} placeholder="Search products" className="max-w-[240px]" />
                        <select value={productCategory} onChange={(e) => { setProductPage(1); setProductCategory(e.target.value); }} className="input-field max-w-[180px]">
                          <option value="All">All categories</option>
                          {categories.map((categoryItem) => (
                            <option key={categoryItem} value={categoryItem}>{categoryItem}</option>
                          ))}
                        </select>
                        <select value={productStatus} onChange={(e) => { setProductPage(1); setProductStatus(e.target.value); }} className="input-field max-w-[180px]">
                          <option value="All">All statuses</option>
                          <option value="Live">Live</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/70">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editingProductId ? 'Edit product' : 'Add new product'}</h4>
                        <form onSubmit={handleProductSubmit} className="mt-6 space-y-4">
                          <Input label="Name" name="name" value={productForm.name} onChange={handleProductChange} required />
                          <Input label="Category" name="category" value={productForm.category} onChange={handleProductChange} as="select">
                            {categories.map((categoryItem) => (
                              <option key={categoryItem} value={categoryItem}>{categoryItem}</option>
                            ))}
                          </Input>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Price" name="price" type="number" value={productForm.price} onChange={handleProductChange} required />
                            <Input label="Stock" name="stock" type="number" value={productForm.stock} onChange={handleProductChange} required />
                          </div>
                          <Input label="Description" name="description" value={productForm.description} onChange={handleProductChange} as="textarea" />
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Image</label>
                            <input type="file" accept="image/*" onChange={(e) => handleProductImageUpload(e.target.files?.[0])} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            {selectedProductImage && (
                              <img src={selectedProductImage} alt="Preview" className="mt-3 h-40 w-full rounded-3xl object-cover" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button type="submit" loading={savingProduct}>{editingProductId ? 'Update product' : 'Create product'}</Button>
                            <Button type="button" variant="outline" onClick={resetProductForm}>Reset</Button>
                          </div>
                        </form>
                      </div>
                      <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Product listings</h4>
                        <div className="mt-6 overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Category</th>
                                <th className="px-4 py-3 font-semibold">Stock</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Price</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedProducts.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No products found.</td>
                                </tr>
                              ) : (
                                displayedProducts.map((product) => (
                                  <tr key={product._id} className="border-t border-slate-200 dark:border-slate-800">
                                    <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{product.name}</td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.category}</td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.stock}</td>
                                    <td className="px-4 py-4">
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                        {product.isActive ? 'Live' : 'Inactive'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{formatPrice(product.price)}</td>
                                    <td className="px-4 py-4">
                                      <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleEditProduct(product)}>Edit</Button>
                                        <Button type="button" variant="danger" className="px-3 py-2 text-xs" onClick={() => handleDeleteProduct(product._id)}>Delete</Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <p>{filteredProducts.length} products found</p>
                          <div className="flex items-center gap-2">
                            <button type="button" disabled={productPage <= 1} onClick={() => setProductPage((page) => Math.max(page - 1, 1))} className="rounded-full border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">Prev</button>
                            <span>Page {productPage} / {totalProductPages}</span>
                            <button type="button" disabled={productPage >= totalProductPages} onClick={() => setProductPage((page) => Math.min(page + 1, totalProductPages))} className="rounded-full border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700">Next</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </section>
              )}

              {activeSection === 'Customers' && (
                <section className="grid gap-6">
                  <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Customers</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View every registered customer and their activity status.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Input placeholder="Search customers" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="max-w-[240px]" />
                        <select value={customerStatusFilter} onChange={(e) => setCustomerStatusFilter(e.target.value)} className="input-field max-w-[180px]">
                          <option value="All">All status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/70">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                          <tr>
                            <th className="px-5 py-4 font-semibold">Customer</th>
                            <th className="px-5 py-4 font-semibold">Email</th>
                            <th className="px-5 py-4 font-semibold">Registered</th>
                            <th className="px-5 py-4 font-semibold">Last login</th>
                            <th className="px-5 py-4 font-semibold">Status</th>
                            <th className="px-5 py-4 font-semibold">Orders</th>
                            <th className="px-5 py-4 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                              <tr key={index} className="animate-pulse border-t border-slate-200 dark:border-slate-800">
                                <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              </tr>
                            ))
                          ) : filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No customers found.</td>
                            </tr>
                          ) : (
                            filteredCustomers.map((customer) => {
                              const statusMeta = getUserStatusMeta(customer.status);
                              return (
                                <tr key={customer._id} className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                                  <td className="px-5 py-4 text-slate-900 dark:text-slate-100">{customer.firstName || ''} {customer.lastName || ''}</td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.email}</td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(customer.createdAt)}</td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}</td>
                                  <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>{statusMeta.label}</span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.orderCount}</td>
                                  <td className="px-5 py-4">
                                    <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleShowCustomerOrders(customer)}>
                                      View orders
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>
                </section>
              )}

              {activeSection === 'Analytics' && (
                <section className="grid gap-6">
                  <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Analytics overview</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Performance metrics for orders, revenue, and customer growth.</p>
                      </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-3">
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Revenue last 30 days</p>
                        <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatPrice(overview?.recentRevenue ?? 0)}</p>
                        <p className="mt-2 text-sm text-emerald-600">{overview?.revenueGrowth ?? 0}% growth</p>
                      </div>
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="text-sm text-slate-500 dark:text-slate-400">New customers</p>
                        <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{overview?.recentCustomers ?? 0}</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last 30 days</p>
                      </div>
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/70">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Low stock products</p>
                        <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{overview?.lowStockProducts ?? 0}</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Stock alert threshold</p>
                      </div>
                    </div>
                    <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/70">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Order status breakdown</h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {(overview?.orderStatusCounts || []).map((status) => (
                          <div key={status._id} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{status._id || 'Unknown'}</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{status.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                </section>
              )}

              {activeSection === 'Reviews' && (
                <section className="grid gap-6">
                  <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Customer reviews</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Review activity across all products.</p>
                      </div>
                    </div>
                    {reviewList.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No reviews available yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {reviewList.slice(0, 20).map((review) => (
                          <div key={`${review.productId}-${review._id || review.createdAt}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/70">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{review.userId?.firstName ? `${review.userId.firstName} ${review.userId.lastName || ''}` : 'Anonymous'}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{review.productName}</p>
                              </div>
                              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{review.rating || 0} stars</div>
                            </div>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{formatDate(review.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </section>
              )}

              {activeSection === 'Settings' && (
                <section className="grid gap-6">
                  <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Store Settings</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Change store branding and view order history counts.</p>
                      </div>
                    </div>
                    <form onSubmit={handleSaveStoreSettings} className="space-y-4">
                      <Input label="Store name" name="storeName" value={storeSettings.storeName} onChange={handleStoreSettingsChange} required />
                      <Input label="Tagline" name="tagline" value={storeSettings.tagline} onChange={handleStoreSettingsChange} required />
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-ink dark:text-accent">Store logo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStoreLogoUpload(e.target.files?.[0])}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-accent"
                        />
                        {logoPreview && (
                          <img src={logoPreview} alt="Logo preview" className="mt-3 h-32 w-full rounded-3xl object-contain border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950" />
                        )}
                      </div>

                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/70">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Team members</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Edit team member name, role, intro, and avatar.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddTeamMember}
                            className="rounded-full border border-secondary/30 bg-secondary/5 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
                          >
                            Add member
                          </button>
                        </div>

                        <div className="space-y-6">
                          {storeSettings.team.map((member, index) => (
                            <div key={`${member.name}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                  label="Name"
                                  value={member.name}
                                  onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                                />
                                <Input
                                  label="Position"
                                  value={member.position}
                                  onChange={(e) => handleTeamChange(index, 'position', e.target.value)}
                                />
                                <Input
                                  label="Intro"
                                  as="textarea"
                                  value={member.intro}
                                  onChange={(e) => handleTeamChange(index, 'intro', e.target.value)}
                                  className="sm:col-span-2"
                                />
                              </div>
                              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-24 w-24 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-950">
                                    {member.profilePic ? (
                                      <img src={member.profilePic} alt={member.name || 'Team member'} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500 dark:text-slate-400">{(member.name || 'T').charAt(0)}</div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="mb-2 block text-sm font-semibold text-ink dark:text-accent">Profile picture</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleTeamImageUpload(index, e.target.files?.[0])}
                                      className="w-full text-sm text-ink dark:text-accent"
                                    />
                                  </div>
                                </div>
                                {storeSettings.team.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTeamMember(index)}
                                    className="self-start rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-300"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/70">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Total orders</p>
                          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{storeSettings.totalOrders}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/70">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Delivered</p>
                          <p className="mt-3 text-3xl font-semibold text-emerald-700 dark:text-emerald-200">{storeSettings.deliveredOrders}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950/70">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Rejected / Cancelled</p>
                          <p className="mt-3 text-3xl font-semibold text-red-600 dark:text-red-300">{storeSettings.cancelledOrders}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button type="submit" loading={savingSettings} className="w-full sm:w-auto">Save store settings</Button>
                      </div>
                    </form>
                  </article>
                </section>
              )}

              {activeSection === 'Orders' && (
                <section className="grid gap-6">
                  <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Order management</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Review, update, and action orders from customers.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Input placeholder="Search orders" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="max-w-[240px]" />
                        <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="input-field max-w-[180px]">
                          <option value="All">All statuses</option>
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/70">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                          <tr>
                            <th className="px-5 py-4 font-semibold">Order ID</th>
                            <th className="px-5 py-4 font-semibold">Customer</th>
                            <th className="px-5 py-4 font-semibold">Amount</th>
                            <th className="px-5 py-4 font-semibold">Payment</th>
                            <th className="px-5 py-4 font-semibold">Status</th>
                            <th className="px-5 py-4 font-semibold">Date</th>
                            <th className="px-5 py-4 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                              <tr key={index} className="animate-pulse border-t border-slate-200 dark:border-slate-800">
                                <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                                <td className="h-16 px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                              </tr>
                            ))
                          ) : filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No orders match your search criteria.</td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => {
                              const statusMeta = getStatusMeta(order.orderStatus);
                              return (
                                <React.Fragment key={order._id}>
                                  <tr className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{order.orderNumber || 'N/A'}</td>
                                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{order.userId?.firstName || 'Customer'} {order.userId?.lastName || ''}</td>
                                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{formatPrice(order.total)}</td>
                                    <td className="px-5 py-4">
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200' : order.paymentStatus === 'refunded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                        {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>{statusMeta.label}</span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(order.createdAt)}</td>
                                    <td className="px-5 py-4">
                                      <div className="flex flex-wrap gap-2">
                                        <select
                                          value={order.orderStatus}
                                          onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                          className="input-field w-full max-w-[160px] px-3 py-2 text-sm"
                                        >
                                          {orderStatusOptions.map((status) => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                          ))}
                                        </select>
                                        <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => toggleOrderItems(order._id)}>
                                          {expandedOrderIds.includes(order._id) ? 'Hide items' : 'View items'}
                                        </Button>
                                        <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => handleCancelOrder(order._id)} disabled={order.orderStatus === 'cancelled'}>Cancel</Button>
                                        <Button type="button" variant="danger" className="px-3 py-2 text-xs" onClick={() => handleDeleteOrder(order._id)}>Delete</Button>
                                      </div>
                                    </td>
                                  </tr>
                                  {expandedOrderIds.includes(order._id) && (
                                    <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                                      <td colSpan={7} className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                                        <div className="space-y-2">
                                          <p className="font-semibold text-slate-900 dark:text-slate-100">Order items</p>
                                          <ul className="grid gap-2 sm:grid-cols-2">
                                            {order.items.map((item, index) => {
                                              const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                                              return (
                                                <li key={item._id || index} className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                                                  <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                      <p className="font-semibold text-slate-900 dark:text-slate-100">{product?.name || 'Unknown product'}</p>
                                                      <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity} · Price: {formatPrice(item.price)}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatPrice(item.total)}</p>
                                                  </div>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>
                </section>
              )}
          </main>
        </div>
      </div>

      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{modalConfig.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{modalConfig.description}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeConfirmModal} className="w-full sm:w-auto">Cancel</Button>
              <Button type="button" variant="danger" onClick={modalConfig.onConfirm} className="w-full sm:w-auto">Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
