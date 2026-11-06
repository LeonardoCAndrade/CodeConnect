export interface PostAuthor {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  code: string | null;
  imageUrl: string | null;
  tags: string[];
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  body: string;
  author: PostAuthor;
  createdAt: Date;
}

export interface TagUsage {
  name: string;
  postsCount: number;
}
