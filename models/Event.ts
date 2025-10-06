export type Topic = 'Законопроекты' | 'Встречи' | 'Новости';

export interface Event {
    id: string;
    title: string;
    date: string; // ISO
    content: string;
    category: Topic;
    image: string;
    excerpt: string;
}

export interface Post {
    id: string;
    title: string;
    summary: string;
    body: string;
    thumbnailUrl: string;
    createdAt: string;
    publishedAt: string;
}

export interface ModalScreenProps {
    modalPost: Post | null;
    onClose: () => void;
    onShare: (post: Post) => void;
}
