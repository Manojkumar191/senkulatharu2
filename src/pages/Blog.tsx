import { useEffect, useMemo, useState } from 'react';
import { getPublishedBlogs } from '../api/blogs';
import type { BlogPost } from '../types';

const DEFAULT_MARCH_2026_STORY: BlogPost = {
  id: 'default-mar-2026-story',
  title: 'Stories from Kadavur',
  excerpt:
    'Every food carries a story from drought, rain, seasonal wild plants, and family-held traditions in Kadavur.',
  body:
    'Every food carries a story. Some come from farming practices shaped by drought and rain. Others come from wild plants that appear only in certain seasons. Some are recipes and food traditions that have been quietly preserved within families.\n\nSenkulatharu also documents and shares these stories, the history of crops, forgotten food practices, the search for traditional varieties, and the everyday wisdom that continues to guide farming in Kadavur block.\n\nBecause understanding food also means understanding the land and the people who care for it.',
  author: 'Senkulatharu Team',
  is_published: true,
  created_at: '2026-03-18T09:00:00.000Z',
};

function formatDayMonthYear(value?: string): string {
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const rows = await getPublishedBlogs();
        if (!active) return;
        setPosts(rows);
        setNotice('');
      } catch {
        if (!active) return;
        setNotice('Unable to load field notes right now.');
        setPosts([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const curatedPosts = useMemo(
    () => {
      if (isLoading) return [];
      const sourcePosts = posts.length > 0 ? posts : [DEFAULT_MARCH_2026_STORY];

      return [...sourcePosts].sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
    },
    [isLoading, posts],
  );

  return (
    <div className="space-y-8">
      <section className="relative isolate overflow-hidden rounded-3xl border border-[#cfe6d7] bg-gradient-to-br from-[#f8fdf9] via-[#eef9f1] to-[#e2f4e9] px-5 py-9 shadow-[0_14px_34px_rgba(63,118,89,0.1)] md:px-9 md:py-11">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_5%,rgba(255,255,255,0.9),transparent_46%),radial-gradient(circle_at_90%_96%,rgba(181,231,204,0.36),transparent_58%)]" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#4f8e6a]">Stories from Kadavur</p>
          <h1 className="mt-3 max-w-4xl font-headline text-4xl leading-tight text-[#1f4a36] md:text-6xl">Every food carries a story.</h1>
          <div className="mt-4 max-w-4xl space-y-4 text-sm leading-7 text-[#2f5a45] md:text-base md:leading-8">
            <p>
              Every food carries a story. Some come from farming practices shaped by drought and rain. Others come from wild plants that appear only in certain seasons. Some are recipes and food traditions that have been quietly preserved within families.
            </p>
            <p>
              Senkulatharu also documents and shares these stories, the history of crops, forgotten food practices, the search for traditional varieties, and the everyday wisdom that continues to guide farming in Kadavur block.
            </p>
            <p>Because understanding food also means understanding the land and the people who care for it.</p>
          </div>
        </div>
      </section>

      <section className="px-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-headline text-3xl text-[#24523d] md:text-4xl">Field Notes</h3>
          </div>
          {notice && <p className="rounded-full bg-clay/10 px-4 py-2 text-xs font-semibold text-clay">{notice}</p>}
        </div>

        {isLoading ? (
          <div className="mt-5 rounded-2xl border border-[#c0e1d0] bg-[#e5f5ec] px-4 py-5 md:px-6">
            <p className="text-sm font-bold text-[#2f5a45]">Loading stories...</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {curatedPosts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-[#c0e1d0] bg-[#e5f5ec] px-4 py-5 md:px-6">
                <h4 className="font-headline text-2xl text-[#24523d] md:text-3xl">{post.title}</h4>
                <p className="mt-2 text-sm font-extrabold text-[#4f8e6a]">{formatDayMonthYear(post.created_at)}</p>
                <p className="mt-3 whitespace-pre-line text-[15px] font-bold leading-7 text-[#2f5a45] md:text-base md:leading-8">{post.body}</p>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-[#3a7f5f]">Author: {post.author}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
