export interface Event {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    location: string;
    isPublic: boolean;
    organizerId: string;
    organizerFullName: string;
    createdAt: string;
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
    modalPost: any | null;
    onClose: () => void;
    onShare: (post: any) => void;
    onPostDelete?: (postId: string) => void; // Добавляем опциональный callback
}
