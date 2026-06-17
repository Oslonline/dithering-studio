export interface DevBlogPostRow {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  published: boolean;
  show_home_banner: boolean;
  banner_label: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface DevBlogPostPublic {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  banner_label: string | null;
  published_at: string | null;
  created_at: string;
}

export interface HomeBannerPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  banner_label: string | null;
}
