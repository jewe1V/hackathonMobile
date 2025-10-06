import {Post} from "@/models/Event";

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export const getDisplayDate = (post: Post) => {
    const dateString = post.publishedAt || post.createdAt;
    return formatDate(dateString);
};
