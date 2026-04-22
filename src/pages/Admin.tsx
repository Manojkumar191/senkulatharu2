import { useEffect, useMemo, useState } from 'react';
import { addBlog, deleteBlog, getAllBlogs, updateBlog } from '../api/blogs';
import { addCarouselImage, getCarouselImages, removeCarouselImage, resetCarouselImages } from '../api/carousel';
import { deleteFeedback, getAllFeedback, setFeedbackApproved } from '../api/feedback';
import { addProduct, deleteProduct, getProducts, updateProduct } from '../api/products';
import { supabase } from '../lib/supabase';
import type { BlogPost, CarouselSection, Feedback, Product } from '../types';
import { buildDescriptionWithMeta, parseCategoryFromDescription, parseStockFromDescription, stripMetaTags } from '../utils/meta';
import { buildStoragePath, compressImage } from '../utils/image';

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'admin123';
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

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState<Section>('add');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(getStoredCategories());
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: '', price: '', description: '', category: 'Uncategorized', stock: '0', file: null as File | null });
  const [newCategory, setNewCategory] = useState('');

  const [topImages, setTopImages] = useState<string[]>([]);
  const [marqueeImages, setMarqueeImages] = useState<string[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const reload = async () => {
    const [productRows, top, marquee, blogRows] = await Promise.all([
      getProducts(),
      getCarouselImages('top'),
      getCarouselImages('marquee'),
      getAllBlogs(),
    ]);
    setProducts(productRows);
    setTopImages(top);
    setMarqueeImages(marquee);
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
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
      setPassword('');
    } else {
      setAuthError('Incorrect password.');
    }
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

    if (!form.name.trim() || !Number.isFinite(price) || !form.category || stock < 0 || !Number.isFinite(stock)) {
      setNotice('Please provide valid product fields including non-negative stock.');
      return;
    }

    setBusy(true);
    setNotice('');
    try {
      const imageUrl = form.file ? await uploadProductImage(form.file) : null;
      await addProduct({
        name: form.name.trim(),
        price,
        description: buildDescriptionWithMeta({ description: form.description, category: form.category, stock }),
        image_url: imageUrl,
      });

      setForm({ name: '', price: '', description: '', category: 'Uncategorized', stock: '0', file: null });
      setNotice('Product added successfully.');
      await reload();
    } catch {
      setNotice('Unable to add product.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (product: Product) => {
    setBusy(true);
    setNotice('');
    try {
      await updateProduct(product.id, {
        name: product.name,
        price: Number(product.price),
        description: product.description,
      });
      setNotice('Product updated.');
      await reload();
    } catch {
      setNotice('Update failed.');
    } finally {
      setBusy(false);
    }
  };

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
    const current = sectionName === 'top' ? topImages : marqueeImages;
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

  const handleCarouselReset = async (sectionName: CarouselSection) => {
    if (!window.confirm('Reset this section to local default images?')) return;
    setBusy(true);
    try {
      await resetCarouselImages(sectionName);
      setNotice('Carousel reset to defaults.');
      await reload();
    } catch {
      setNotice('Failed to reset carousel.');
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

  const handleRemoveApprovedFeedback = async (item: Feedback) => {
    setBusy(true);
    setNotice('');
    try {
      await setFeedbackApproved(item.id, false);
      setNotice('Feedback removed from moving section.');
      await reload();
    } catch {
      setNotice('Failed to remove feedback from moving section.');
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
    setSection('blog');
    setEditingBlogId(post.id);
    setBlogForm({
      title: post.title ?? '',
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      author: post.author ?? '',
      is_published: post.is_published ?? true,
    });
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
      <section className="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/85 p-8 shadow-glass">
        <h1 className="font-headline text-3xl text-forest">Admin Login</h1>
        <p className="mt-2 text-sm text-brown/80">Use your frontend password from VITE_ADMIN_PASSWORD.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-4 w-full rounded-xl border border-sand px-4 py-3"
          placeholder="Enter admin password"
        />
        {authError && <p className="mt-2 text-sm text-clay">{authError}</p>}
        <button onClick={onLogin} className="mt-4 w-full rounded-xl bg-forest px-4 py-3 font-bold text-white">
          Login
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-forest to-moss p-6 text-white shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-headline text-3xl">Admin Panel</h1>
          <button onClick={() => setAuthenticated(false)} className="rounded-full border border-white/60 px-4 py-2 text-sm font-bold text-white">
            Logout
          </button>
        </div>
        <p className="mt-2 text-sm text-cream/90">Manage products, categories, carousel images, and feedback approvals directly via Supabase.</p>
      </section>

      <section className="flex flex-wrap gap-2">
        {[
          ['add', 'Add Product'],
          ['edit', 'Edit Products'],
          ['categories', 'Product Categories'],
          ['carousel', 'Carousel Images'],
          ['feedback', 'Feedback'],
          ['blog', 'Blog Stories'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSection(key as Section)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${section === key ? 'bg-forest text-white' : 'bg-white/80 text-forest'}`}
          >
            {label}
          </button>
        ))}
      </section>

      {notice && <p className="rounded-2xl bg-white/80 p-4 text-sm text-brown">{notice}</p>}

      {section === 'add' && (
        <form onSubmit={handleAddProduct} className="grid gap-3 rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass md:grid-cols-2">
          <input placeholder="Product name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl border border-sand px-4 py-3" required />
          <input placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="rounded-xl border border-sand px-4 py-3" required />
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-sand px-4 py-3">
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input placeholder="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} className="rounded-xl border border-sand px-4 py-3" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} className="rounded-xl border border-sand px-4 py-3 md:col-span-2" />
          <input type="file" accept="image/*" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] ?? null }))} className="md:col-span-2" />
          <button disabled={busy} className="rounded-xl bg-forest px-5 py-3 font-bold text-white md:col-span-2">{busy ? 'Saving...' : 'Add Product'}</button>
        </form>
      )}

      {section === 'edit' && (
        <div className="space-y-4">
          {products.map((product) => {
            const category = parseCategoryFromDescription(product.description || '');
            const stock = parseStockFromDescription(product.description || '');
            const clean = stripMetaTags(product.description || '');
            return (
              <article key={product.id} className="grid gap-2 rounded-3xl border border-white/50 bg-white/85 p-4 shadow-glass md:grid-cols-6">
                <input value={product.name} onChange={(e) => setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, name: e.target.value } : p)))} className="rounded-xl border border-sand px-3 py-2 md:col-span-2" />
                <input type="number" value={product.price} onChange={(e) => setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, price: Number(e.target.value) } : p)))} className="rounded-xl border border-sand px-3 py-2" />
                <select
                  value={category}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, description: buildDescriptionWithMeta({ description: clean, category: e.target.value, stock }) }
                          : p,
                      ),
                    )
                  }
                  className="rounded-xl border border-sand px-3 py-2"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, description: buildDescriptionWithMeta({ description: clean, category, stock: Number(e.target.value) }) }
                          : p,
                      ),
                    )
                  }
                  className="rounded-xl border border-sand px-3 py-2"
                />
                <textarea
                  value={clean}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, description: buildDescriptionWithMeta({ description: e.target.value, category, stock }) }
                          : p,
                      ),
                    )
                  }
                  className="rounded-xl border border-sand px-3 py-2 md:col-span-4"
                />
                <div className="flex items-center justify-end gap-2 md:col-span-2">
                  <button onClick={() => handleUpdate(product)} className="rounded-xl bg-forest px-4 py-2 text-sm font-bold text-white">Save</button>
                  <button onClick={() => handleDelete(product)} className="rounded-xl bg-clay px-4 py-2 text-sm font-bold text-white">Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {section === 'categories' && (
        <section className="rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass">
          <h2 className="font-headline text-2xl text-forest">Product Categories</h2>
          <div className="mt-4 flex gap-2">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add category" className="flex-1 rounded-xl border border-sand px-4 py-3" />
            <button onClick={addCategory} className="rounded-xl bg-forest px-4 py-3 font-bold text-white">Add</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <div key={cat} className="flex items-center gap-2 rounded-full bg-forest/10 px-3 py-2 text-sm">
                <span>{cat}</span>
                {cat !== 'Uncategorized' && (
                  <button onClick={() => removeCategory(cat)} className="font-bold text-clay">Delete</button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {section === 'feedback' && (
        <section className="space-y-5 rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass">
          <div>
            <h2 className="font-headline text-2xl text-forest">Pending Feedback</h2>
            <p className="mt-1 text-sm text-brown/80">Approve feedback to show it in the moving customer review section on Home.</p>
          </div>

          {pendingFeedback.length === 0 ? (
            <p className="rounded-2xl bg-forest/5 p-4 text-sm text-brown">No pending feedback right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingFeedback.map((item) => (
                <article key={item.id} className="rounded-2xl border border-sand/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-headline text-xl text-forest">{item.customer_name}</h3>
                    <p className="text-sm font-bold text-forest">{'★'.repeat(Math.max(1, Math.min(5, Math.round(item.rating))))}</p>
                  </div>
                  <p className="text-sm font-semibold text-brown/80">{item.city_state}</p>
                  <p className="mt-2 text-sm text-brown">{item.review_text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      onClick={() => handleApproveFeedback(item)}
                      className="rounded-xl bg-forest px-4 py-2 text-sm font-bold text-white"
                    >
                      Add To Moving Feedback
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleDeleteFeedback(item)}
                      className="rounded-xl bg-clay px-4 py-2 text-sm font-bold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div>
            <h2 className="font-headline text-2xl text-forest">Feedback In Moving Section</h2>
          </div>

          {approvedFeedback.length === 0 ? (
            <p className="rounded-2xl bg-forest/5 p-4 text-sm text-brown">No approved feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {approvedFeedback.map((item) => (
                <article key={item.id} className="rounded-2xl border border-sand/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-headline text-xl text-forest">{item.customer_name}</h3>
                    <p className="text-sm font-bold text-forest">{'★'.repeat(Math.max(1, Math.min(5, Math.round(item.rating))))}</p>
                  </div>
                  <p className="text-sm font-semibold text-brown/80">{item.city_state}</p>
                  <p className="mt-2 text-sm text-brown">{item.review_text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      onClick={() => handleRemoveApprovedFeedback(item)}
                      className="rounded-xl bg-moss px-4 py-2 text-sm font-bold text-white"
                    >
                      Remove From Moving Feedback
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleDeleteFeedback(item)}
                      className="rounded-xl bg-clay px-4 py-2 text-sm font-bold text-white"
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
        <section className="space-y-6 rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass">
          {([
            ['top', topImages],
            ['marquee', marqueeImages],
          ] as [CarouselSection, string[]][]).map(([sectionName, images]) => (
            <div key={sectionName} className="space-y-3 rounded-2xl border border-sand/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-headline text-xl capitalize text-forest">{sectionName} Section</h3>
                <button onClick={() => handleCarouselReset(sectionName)} className="rounded-xl bg-clay px-3 py-2 text-sm font-bold text-white">Reset Defaults</button>
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleCarouselUpload(sectionName, e.target.files?.[0] ?? null)} />
              <div className="grid gap-3 md:grid-cols-3">
                {images.map((url) => (
                  <div key={url} className="overflow-hidden rounded-xl border border-sand/50">
                    <img src={url} alt="Carousel" className="h-36 w-full object-cover" />
                    <button onClick={() => handleCarouselRemove(sectionName, url)} className="w-full bg-clay py-2 text-sm font-bold text-white">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {section === 'blog' && (
        <section className="space-y-6 rounded-3xl border border-white/50 bg-white/85 p-6 shadow-glass">
          <div>
            <h2 className="font-headline text-2xl text-forest">Blog Stories</h2>
            <p className="mt-1 text-sm text-brown/80">Add or update stories that appear on the Stories from Kadavur page.</p>
          </div>

          <form onSubmit={handleSaveBlog} className="grid gap-3 rounded-3xl border border-sand/40 bg-white/90 p-5 shadow-[0_12px_24px_rgba(31,79,53,0.08)] md:grid-cols-2">
            <input
              placeholder="Story title"
              value={blogForm.title}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-xl border border-sand px-4 py-3"
              required
            />
            <input
              placeholder="Author"
              value={blogForm.author}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, author: event.target.value }))}
              className="rounded-xl border border-sand px-4 py-3"
              required
            />
            <textarea
              placeholder="Short excerpt (optional)"
              value={blogForm.excerpt}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, excerpt: event.target.value }))}
              rows={3}
              className="rounded-xl border border-sand px-4 py-3 md:col-span-2"
            />
            <textarea
              placeholder="Story details"
              value={blogForm.body}
              onChange={(event) => setBlogForm((prev) => ({ ...prev, body: event.target.value }))}
              rows={6}
              className="rounded-xl border border-sand px-4 py-3 md:col-span-2"
              required
            />
            <label className="flex items-center gap-2 text-sm text-brown/80">
              <input
                type="checkbox"
                checked={blogForm.is_published}
                onChange={(event) => setBlogForm((prev) => ({ ...prev, is_published: event.target.checked }))}
              />
              Publish to site
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button disabled={busy} className="rounded-xl bg-forest px-5 py-3 font-bold text-white">
                {busy ? 'Saving...' : editingBlogId ? 'Update Story' : 'Add Story'}
              </button>
              <button type="button" onClick={resetBlogForm} className="rounded-xl border border-forest/30 px-5 py-3 font-bold text-forest">
                Clear
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {blogs.length === 0 ? (
              <p className="rounded-2xl bg-forest/5 p-4 text-sm text-brown">No blog stories yet.</p>
            ) : (
              blogs.map((post) => (
                <article key={post.id} className="rounded-3xl border border-sand/40 bg-white/90 p-5 shadow-[0_12px_22px_rgba(31,79,53,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-headline text-xl text-forest">{post.title}</h3>
                      <p className="text-sm text-brown/80">{post.author}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.is_published ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brown/80">{post.excerpt || post.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => handleEditBlog(post)} className="rounded-xl bg-forest px-4 py-2 text-sm font-bold text-white">Edit</button>
                    <button onClick={() => handleToggleBlogPublish(post)} className="rounded-xl bg-moss px-4 py-2 text-sm font-bold text-white">
                      {post.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDeleteBlog(post)} className="rounded-xl bg-clay px-4 py-2 text-sm font-bold text-white">Delete</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
