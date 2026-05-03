import { useEffect, useMemo, useState } from 'react';
import { addBlog, deleteBlog, getAllBlogs, updateBlog } from '../api/blogs';
import { addCarouselImage, getCarouselImages, removeCarouselImage } from '../api/carousel';
import { deleteFeedback, getAllFeedback, setFeedbackApproved } from '../api/feedback';
import { addProduct, deleteProduct, getProducts, updateProduct } from '../api/products';
import { supabase } from '../lib/supabase';
import type { BlogPost, CarouselSection, Feedback, Product, PageName } from '../types';
import {
  buildDescriptionWithMeta,
  formatVariantsForEditor,
  parseCategoryFromDescription,
  parseDiscountFromDescription,
  parseStockFromDescription,
  parseVariantsEditorInput,
  parseVariantsFromDescription,
  stripMetaTags,
} from '../utils/meta';
import { buildStoragePath, compressImage } from '../utils/image';

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'admin123';
const ADMIN_USER = (import.meta.env.VITE_ADMIN_USER as string | undefined) ?? 'admin';
const CATEGORY_STORAGE_KEY = 'senkulatharu_custom_categories';

type Section = 'add' | 'edit' | 'categories' | 'carousel' | 'feedback' | 'blog';

const emptyBlogForm = {
  title: '',
  excerpt: '',
  body: '',
  author: '',
  is_published: true,
};

function getStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export function Admin({ onNavigate }: { onNavigate?: (page: PageName) => void }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState<Section>('add');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(getStoredCategories());
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Uncategorized',
    stock: '0',
    discount: '0',
    variants: '',
    file: null as File | null,
  });
  const [newCategory, setNewCategory] = useState('');

  const [topImages, setTopImages] = useState<string[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductForm, setEditingProductForm] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'Uncategorized',
    stock: 0,
    discount: 0,
    variants: '',
    file: null as File | null,
  });
  const [productQuery, setProductQuery] = useState('');

  const reload = async () => {
    const [productRows, top, blogRows] = await Promise.all([
      getProducts(),
      getCarouselImages('top'),
      getAllBlogs(),
    ]);
    setProducts(productRows);
    setTopImages(top);
    setBlogs(blogRows);

    try {
      const feedbackRows = await getAllFeedback();
      setFeedbackItems(feedbackRows);
    } catch {
      setFeedbackItems([]);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    reload().catch(() => setNotice('Failed to load admin data. Check Supabase configuration.'));
  }, [authenticated]);

  useEffect(() => {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const allCategories = useMemo(() => {
    const set = new Set<string>(['Uncategorized', ...categories]);
    products.forEach((product) => set.add(parseCategoryFromDescription(product.description || '')));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [categories, products]);

  const pendingFeedback = useMemo(() => feedbackItems.filter((item) => !item.is_approved), [feedbackItems]);

  const approvedFeedback = useMemo(() => feedbackItems.filter((item) => item.is_approved), [feedbackItems]);

  const onLogin = () => {
    const name = loginName.trim();
    if (!name) {
      setAuthError('Admin login ID is required.');
      return;
    }
    if (!password) {
      setAuthError('Password is required.');
      return;
    }
    if (name !== ADMIN_USER) {
      setAuthError('Unknown admin login ID.');
      return;
    }
    if (password !== ADMIN_PASSWORD) {
      setAuthError('Incorrect password.');
      return;
    }

    setAuthenticated(true);
    setAuthError('');
    setPassword('');
    setAdminUser(name);
    setLoginName('');
  };

  const uploadProductImage = async (file: File) => {
    const compressed = await compressImage(file);
    const ext = compressed.type.includes('webp') ? 'webp' : 'jpg';
    const path = buildStoragePath('products', `${file.name}.${ext}`);

    const { error } = await supabase.storage.from('products').upload(path, compressed, {
      contentType: compressed.type,
      upsert: true,
    });

    if (error) throw error;
    const { data } = supabase.storage.from('products').getPublicUrl(path);
    return data.publicUrl;
  };

  const removeProductImageFromStorage = async (imageUrl: string | null | undefined) => {
    if (!imageUrl) return;
    const marker = '/storage/v1/object/public/products/';
    const split = imageUrl.split(marker);
    if (split.length > 1) {
      await supabase.storage.from('products').remove([split[1]]);
    }
  };

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const discount = Number(form.discount);
    const variants = parseVariantsEditorInput(form.variants);
    const basePrice = variants.length > 0 ? variants[0].price : price;

    if (
      !form.name.trim() ||
      !Number.isFinite(basePrice) ||
      basePrice < 0 ||
      !form.category ||
      stock < 0 ||
      !Number.isFinite(stock) ||
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      setNotice('Please provide valid product fields, stock, and discount (0 to 100).');
      return;
    }

    setBusy(true);
    setNotice('');
    try {
      const imageUrl = form.file ? await uploadProductImage(form.file) : null;
      await addProduct({
        name: form.name.trim(),
        price: basePrice,
        description: buildDescriptionWithMeta({
          description: form.description,
          category: form.category,
          stock,
          discount,
          variants,
        }),
          image_url: imageUrl,
          admin_user_id: adminUser || 'admin',
      });

      setForm({
        name: '',
        price: '',
        description: '',
        category: 'Uncategorized',
        stock: '0',
        discount: '0',
        variants: '',
        file: null,
      });
      setNotice('Product added successfully.');
      await reload();
    } catch {
      setNotice('Unable to add product.');
    } finally {
      setBusy(false);
    }
  };

  // legacy per-product update handler (kept for compatibility) — admin uses inline card editor now

  const handleDelete = async (product: Product) => {
    if (!window.confirm('Delete this product?')) return;
    setBusy(true);
    setNotice('');
    try {
      await deleteProduct(product.id);
      await removeProductImageFromStorage(product.image_url);
      setNotice('Product deleted.');
      await reload();
    } catch {
      setNotice('Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value) return;
    if (value.toLowerCase() === 'uncategorized') {
      setNotice('Uncategorized is reserved.');
      return;
    }
    if (allCategories.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setNotice('Category already exists.');
      return;
    }
    setCategories((prev) => [...prev, value]);
    setNewCategory('');
    setNotice('Category added.');
  };

  const removeCategory = async (category: string) => {
    if (category === 'Uncategorized') return;
    setBusy(true);
    try {
      const affected = products.filter((product) => parseCategoryFromDescription(product.description || '') === category);
      await Promise.all(
        affected.map((product) =>
          updateProduct(product.id, {
            description: buildDescriptionWithMeta({
              description: stripMetaTags(product.description || ''),
              category: 'Uncategorized',
              stock: parseStockFromDescription(product.description || ''),
              discount: parseDiscountFromDescription(product.description || ''),
              variants: parseVariantsFromDescription(product.description || ''),
            }),
          }),
        ),
      );
      setCategories((prev) => prev.filter((item) => item !== category));
      setNotice(`Category ${category} removed and products moved to Uncategorized.`);
      await reload();
    } catch {
      setNotice('Failed to remove category.');
    } finally {
      setBusy(false);
    }
  };

  const handleCarouselUpload = async (sectionName: CarouselSection, file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      setNotice('Please choose a valid image file.');
      return;
    }
    setBusy(true);
    try {
      await addCarouselImage(sectionName, file);
      setNotice('Carousel image added.');
      await reload();
    } catch {
      setNotice('Failed to upload carousel image.');
    } finally {
      setBusy(false);
    }
  };

  const handleCarouselRemove = async (sectionName: CarouselSection, imageUrl: string) => {
    const current = topImages;
    if (current.length <= 1) {
      setNotice('At least one image must remain in this section.');
      return;
    }
    setBusy(true);
    try {
      await removeCarouselImage(sectionName, imageUrl);
      setNotice('Carousel image removed.');
      await reload();
    } catch {
      setNotice('Failed to remove carousel image.');
    } finally {
      setBusy(false);
    }
  };

  const handleApproveFeedback = async (item: Feedback) => {
    setBusy(true);
    setNotice('');
    try {
      await setFeedbackApproved(item.id, true);
      setNotice('Feedback added to moving section.');
      await reload();
    } catch {
      setNotice('Failed to approve feedback.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteFeedback = async (item: Feedback) => {
    if (!window.confirm('Delete this feedback?')) return;
    setBusy(true);
    setNotice('');
    try {
      await deleteFeedback(item.id);
      setNotice('Feedback deleted.');
      await reload();
    } catch {
      setNotice('Failed to delete feedback.');
    } finally {
      setBusy(false);
    }
  };

  const resetBlogForm = () => {
    setBlogForm(emptyBlogForm);
    setEditingBlogId(null);
  };

  const handleSaveBlog = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!blogForm.title.trim() || !blogForm.body.trim() || !blogForm.author.trim()) {
      setNotice('Please provide a title, author, and story details.');
      return;
    }

    setBusy(true);
    setNotice('');
    try {
      if (editingBlogId) {
        await updateBlog(editingBlogId, {
          title: blogForm.title.trim(),
          excerpt: blogForm.excerpt.trim(),
          body: blogForm.body.trim(),
          author: blogForm.author.trim(),
          is_published: blogForm.is_published,
        });
        setNotice('Blog story updated.');
      } else {
        await addBlog({
          title: blogForm.title.trim(),
          excerpt: blogForm.excerpt.trim(),
          body: blogForm.body.trim(),
          author: blogForm.author.trim(),
          is_published: blogForm.is_published,
        });
        setNotice('Blog story added.');
      }
      resetBlogForm();
      await reload();
    } catch {
      setNotice('Unable to save blog story.');
    } finally {
      setBusy(false);
    }
  };

  const handleEditBlog = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setBlogForm({
      title: post.title ?? '',
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      author: post.author ?? '',
      is_published: post.is_published ?? true,
    });
  };

  const handleCancelBlogEdit = () => {
    resetBlogForm();
  };

  const handleToggleBlogPublish = async (post: BlogPost) => {
    setBusy(true);
    setNotice('');
    try {
      await updateBlog(post.id, { is_published: !post.is_published });
      setNotice(post.is_published ? 'Blog unpublished.' : 'Blog published.');
      await reload();
    } catch {
      setNotice('Unable to update blog publish status.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteBlog = async (post: BlogPost) => {
    if (!window.confirm('Delete this blog story?')) return;
    setBusy(true);
    setNotice('');
    try {
      await deleteBlog(post.id);
      setNotice('Blog story deleted.');
      await reload();
    } catch {
      setNotice('Unable to delete blog story.');
    } finally {
      setBusy(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <section className="animate-floatIn mx-auto w-full max-w-md rounded-lg border border-sand/30 bg-white p-8 shadow-sm">
          <h1 className="font-headline text-3xl text-forest">Admin Login</h1>
          <label className="mt-4 block text-sm font-bold text-brown">Admin login ID</label>
          <input
            type="text"
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-sand px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
            placeholder="Enter admin login ID"
          />
          <label className="mt-4 block text-sm font-bold text-brown">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-sand px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
            placeholder="Enter admin password"
          />
          {authError && <p className="mt-2 text-sm text-clay">{authError}</p>}
          <button onClick={onLogin} className="mt-4 w-full rounded-lg bg-forest px-4 py-3 font-bold text-white hover:bg-forest/90 transition">
            Login
          </button>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="text-sm text-forest/70 hover:text-forest"
            >
              Back to home
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-forest to-moss text-white shadow-lg">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold">Admin Panel</h1>
            {adminUser && <p className="text-xs text-cream/80">Logged in as: {adminUser}</p>}
          </div>
          <button
            onClick={() => setAuthenticated(false)}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white/50 border-b border-sand sticky top-[72px] z-40">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              ['add', '➕ Add Product'],
              ['edit', '✏️ Edit Products'],
              ['categories', '🏷️ Categories'],
              ['carousel', '🖼️ Carousel'],
              ['feedback', '💬 Feedback'],
              ['blog', '📝 Blog'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSection(key as Section)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition ${
                  section === key
                    ? 'bg-forest text-white shadow-md'
                    : 'bg-white/70 text-forest hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 pb-8">
        {notice && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700 shadow-sm">
            {notice}
          </div>
        )}

      {section === 'add' && (
        <form onSubmit={handleAddProduct} className="rounded-lg border border-sand/30 bg-white p-6 shadow-sm space-y-3">
          <h2 className="section-header font-headline text-xl text-forest">Add New Product</h2>
          <div>
            <label className="text-sm font-bold text-slate-800">Product Name</label>
            <input placeholder="Enter product name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-bold text-slate-800">Base Price</label>
              <input
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-slate-800">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30">
                {allCategories.filter((cat) => cat !== 'Uncategorized').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-bold text-slate-800">Stock</label>
              <input placeholder="0" type="number" min="0" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" required />
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-slate-800">Discount %</label>
              <input
                placeholder="0"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-800">Description</label>
            <textarea placeholder="Describe the product..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-800">Weight Options</label>
            <textarea
              placeholder={`1 kg - 50\n2 kg - 100`}
              value={form.variants}
              onChange={(e) => setForm((p) => ({ ...p, variants: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-800">Product Image</label>
            <input type="file" accept="image/*" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] ?? null }))} className="w-full text-xs" />
          </div>
          <button disabled={busy} className="w-full rounded-lg bg-forest px-4 py-2 font-bold text-white hover:bg-forest/90 transition disabled:opacity-50">{busy ? 'Saving...' : 'Add Product'}</button>
        </form>
      )}

      {section === 'edit' && (
        <div>
          <div className="mb-4">
            <input
              placeholder="Search products to edit..."
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {products
              .filter((p) => (productQuery ? p.name.toLowerCase().includes(productQuery.toLowerCase()) : true))
              .map((product) => {
                const category = parseCategoryFromDescription(product.description || '');
                const stock = parseStockFromDescription(product.description || '');
                const discount = parseDiscountFromDescription(product.description || '');
                const variants = parseVariantsFromDescription(product.description || '');
                const variantsEditorValue = formatVariantsForEditor(variants);
                const clean = stripMetaTags(product.description || '');

                const isEditing = editingProductId === product.id;

                return (
                  <article key={product.id} className="group relative overflow-visible rounded-3xl border border-white/70 bg-white p-0 shadow-sm">
                    <div className="relative aspect-[16/10] overflow-hidden bg-cream sm:aspect-[4/3]">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-brown">No image</div>
                      )}
                    </div>

                    <div className="p-4">
                      {!isEditing ? (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-headline text-lg text-brown">{product.name}</h3>
                              <p className="mt-1 text-xs text-brown/80">{clean}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-extrabold text-forest">Rs.{product.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProductId(product.id);
                                setEditingProductForm({
                                  name: product.name,
                                  price: product.price,
                                  description: clean,
                                  category,
                                  stock,
                                  discount,
                                  variants: variantsEditorValue,
                                  file: null,
                                });
                              }}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500"
                            >
                              Edit
                            </button>
                            <button onClick={() => handleDelete(product)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500">Delete</button>
                          </div>
                        </>
                      ) : (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setBusy(true);
                            try {
                              const payload: any = {
                                name: editingProductForm.name,
                                price: Number(editingProductForm.price),
                                description: buildDescriptionWithMeta({
                                  description: editingProductForm.description,
                                  category: editingProductForm.category,
                                  stock: Number(editingProductForm.stock),
                                  discount: Number(editingProductForm.discount),
                                  variants: parseVariantsEditorInput(editingProductForm.variants),
                                }),
                              };
                              if (editingProductForm.file) {
                                const imageUrl = await uploadProductImage(editingProductForm.file);
                                payload.image_url = imageUrl;
                              }
                              await updateProduct(product.id, payload);
                              setNotice('Product updated.');
                              setEditingProductId(null);
                              await reload();
                            } catch {
                              setNotice('Update failed.');
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className="space-y-2"
                        >
                          <div>
                            <label className="text-xs font-semibold text-slate-700">Product Name</label>
                            <input value={editingProductForm.name} onChange={(e) => setEditingProductForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border px-2 py-1 text-sm" />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-slate-700">Price</label>
                              <input type="number" value={String(editingProductForm.price)} onChange={(e) => setEditingProductForm((p) => ({ ...p, price: Number(e.target.value) }))} className="w-full rounded-lg border px-2 py-1 text-sm" />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-bold text-slate-800">Category</label>
                              <select value={editingProductForm.category} onChange={(e) => setEditingProductForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border px-2 py-1 text-sm z-50">
                                {allCategories.filter((cat) => cat !== 'Uncategorized').map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-slate-700">Stock</label>
                              <input type="number" value={String(editingProductForm.stock)} onChange={(e) => setEditingProductForm((p) => ({ ...p, stock: Number(e.target.value) }))} className="w-full rounded-lg border px-2 py-1 text-sm" />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-slate-700">Discount %</label>
                              <input type="number" value={String(editingProductForm.discount)} onChange={(e) => setEditingProductForm((p) => ({ ...p, discount: Number(e.target.value) }))} className="w-full rounded-lg border px-2 py-1 text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-700">Description</label>
                            <textarea value={editingProductForm.description} onChange={(e) => setEditingProductForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-700">Weight Options</label>
                            <textarea value={editingProductForm.variants} onChange={(e) => setEditingProductForm((p) => ({ ...p, variants: e.target.value }))} rows={2} className="w-full rounded-lg border px-2 py-1 text-sm" placeholder={`1 kg - 50\n2 kg - 100`} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-700">Change Image</label>
                            <input type="file" accept="image/*" onChange={(e) => setEditingProductForm((p) => ({ ...p, file: e.target.files && e.target.files[0] ? e.target.files[0] : null }))} className="w-full text-xs" />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-forest px-2 py-1.5 text-xs font-bold text-white hover:bg-forest/90">Save</button>
                            <button type="button" onClick={() => setEditingProductId(null)} className="flex-1 rounded-lg bg-slate-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-slate-400">Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      )}

      {section === 'categories' && (
        <section className="rounded-lg border border-sand/30 bg-white p-6 shadow-sm">
          <h2 className="section-header font-headline text-2xl text-forest">Product Categories</h2>
          <div className="mt-4 flex gap-2">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add category" className="flex-1 rounded-lg border border-sand px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
            <button onClick={addCategory} className="rounded-lg bg-forest px-4 py-3 font-bold text-white hover:bg-forest/90 transition">Add</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {allCategories
              .filter((cat) => cat !== 'Uncategorized')
              .map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between gap-3 rounded-lg border border-sand/30 bg-forest/5 p-3 transition-colors duration-200 hover:bg-forest/10 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{cat}</p>
                  </div>
                  <div>
                    <button onClick={() => removeCategory(cat)} className="rounded-md bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {section === 'feedback' && (
        <section className="space-y-4 rounded-lg border border-sand/30 bg-white p-6 shadow-sm">
          <div>
            <h2 className="section-header font-headline text-2xl text-forest">Pending Feedback</h2>
            <p className="mt-1 text-sm text-brown/80">Approve feedback to show it in the moving customer review section on Home.</p>
          </div>

          {pendingFeedback.length === 0 ? (
            <p className="rounded-lg bg-forest/5 p-4 text-sm text-brown">No pending feedback right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingFeedback.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-headline text-lg text-slate-900">{item.customer_name}</h3>
                      <p className="text-xs text-slate-500">{item.city_state}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">Pending</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.review_text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      onClick={() => handleApproveFeedback(item)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50 md:px-4 md:text-sm"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleDeleteFeedback(item)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition disabled:opacity-50 md:px-4 md:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div>
            <h2 className="section-header font-headline text-2xl text-forest">Feedback In Moving Section</h2>
          </div>

          {approvedFeedback.length === 0 ? (
            <p className="rounded-lg bg-forest/5 p-4 text-sm text-brown">No approved feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {approvedFeedback.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-headline text-lg text-slate-900">{item.customer_name}</h3>
                      <p className="text-xs text-slate-500">{item.city_state}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">Approved</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.review_text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      onClick={() => handleDeleteFeedback(item)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition disabled:opacity-50 md:px-4 md:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {section === 'carousel' && (
        <section className="space-y-5 rounded-lg border border-sand/30 bg-white p-6 shadow-sm">
          {([
            ['top', topImages],
          ] as [CarouselSection, string[]][]).map(([sectionName, images]) => (
            <div key={String(sectionName)} className="space-y-3 rounded-lg border border-sand/30 bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-headline text-lg capitalize text-forest">{sectionName} Section</h3>
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleCarouselUpload(sectionName, e.target.files?.[0] ?? null)} className="text-sm" />
              <div className="grid gap-3 md:grid-cols-3">
                {images.map((url: string) => (
                  <div key={url} className="overflow-hidden rounded-lg border border-sand/30">
                    <img src={url} alt="Carousel" className="h-36 w-full object-cover" />
                    <button onClick={() => handleCarouselRemove(sectionName, url)} className="w-full bg-clay py-2 text-sm font-bold text-white hover:bg-clay/90 transition">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {section === 'blog' && (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-800 shadow-sm md:p-6">
          <div>
            <h2 className="section-header font-headline text-xl text-slate-900 md:text-2xl">Blog Stories</h2>
            <p className="mt-1 text-xs text-slate-600 md:text-sm">Add or update stories that appear on the Stories from Kadavur page.</p>
          </div>

          {!editingBlogId && (
            <form onSubmit={handleSaveBlog} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:gap-4 md:grid-cols-2 md:p-5">
            <input
              placeholder="Story title"
              value={blogForm.title}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              required
            />
            <input
              placeholder="Author"
              value={blogForm.author}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, author: event.target.value }))}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              required
            />
            <textarea
              placeholder="Short excerpt (optional)"
              value={blogForm.excerpt}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, excerpt: event.target.value }))}
              rows={2}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 md:col-span-2 md:rows-3"
            />
            <textarea
              placeholder="Story details"
              value={blogForm.body}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, body: event.target.value }))}
              rows={4}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 md:col-span-2 md:rows-6"
              required
            />
            <label className="flex items-center gap-2 text-xs text-slate-600 md:col-span-2 md:text-sm">
              <input
                type="checkbox"
                checked={blogForm.is_published}
                onChange={(event) => setBlogForm((prev) => ({ ...prev, is_published: event.target.checked }))}
              />
              Publish to site
            </label>
              <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-2 md:col-span-2">
                <button disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition disabled:opacity-50 md:px-5 md:py-3">
                  {busy ? 'Saving...' : 'Add Story'}
                </button>
                <button type="button" onClick={resetBlogForm} className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-400 transition md:px-5 md:py-3">
                  Clear
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {blogs.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 md:p-4">No blog stories yet.</p>
            ) : (
              blogs.map((post) => (
                <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:p-5">
                  {editingBlogId === post.id ? (
                    <form onSubmit={handleSaveBlog} className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-2">
                        <h3 className="font-headline text-base text-slate-900 md:text-lg">Editing story</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${blogForm.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {blogForm.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <input
                        placeholder="Story title"
                        value={blogForm.title}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 md:col-span-2"
                        required
                      />
                      <input
                        placeholder="Author"
                        value={blogForm.author}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, author: event.target.value }))}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        required
                      />
                      <label className="flex items-center gap-2 text-xs text-slate-600 md:justify-end md:text-sm">
                        <input
                          type="checkbox"
                          checked={blogForm.is_published}
                          onChange={(event) => setBlogForm((prev) => ({ ...prev, is_published: event.target.checked }))}
                        />
                        Publish to site
                      </label>
                      <textarea
                        placeholder="Short excerpt (optional)"
                        value={blogForm.excerpt}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                        rows={2}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 md:col-span-2 md:rows-3"
                      />
                      <textarea
                        placeholder="Story details"
                        value={blogForm.body}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, body: event.target.value }))}
                        rows={4}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 md:col-span-2 md:rows-6"
                        required
                      />
                      <div className="flex flex-col gap-2 md:flex-row md:col-span-2">
                        <button disabled={busy} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition md:px-4 md:text-sm">
                          {busy ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={handleCancelBlogEdit} className="rounded-lg bg-slate-500 px-3 py-2 text-xs font-bold text-white hover:bg-slate-400 transition md:px-4 md:text-sm">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-headline text-base text-slate-900 md:text-lg">{post.title}</h3>
                          <p className="text-xs text-slate-500 md:text-sm">{post.author}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600 md:text-sm">{post.excerpt || post.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => handleEditBlog(post)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition md:px-4 md:text-sm">Edit</button>
                        <button onClick={() => handleToggleBlogPublish(post)} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-500 transition md:px-4 md:text-sm">
                          {post.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => handleDeleteBlog(post)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition md:px-4 md:text-sm">Delete</button>
                      </div>
                    </>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      )}
      </main>
    </div>
  );
}
