import {Post} from './Event'

export interface Role {
    id: string;
    name: string;
    userRoles: string[];
}

export interface UserRole {
    userId: string;
    user: string;
    roleId: string;
    role: Role;
}

export interface Catalog {
    id: string;
    name: string;
    parentCatalogId: string | null;
    parentCatalog: string | null;
    ownerId: string;
    owner: string;
    children: string[];
    documents: string[];
}

export interface Attachment {
    id: string;
    fileName: string;
    url: string;
    contentType: string;
    size: number;
    uploadedById: string;
    uploadedBy: string;
    catalogId: string;
    catalog: Catalog;
    postId: string | null;
    post: string | null;
    uploadedAt: string;
}

export interface Document {
    id: string;
    fileName: string;
    url: string;
    contentType: string;
    size: number;
    uploadedById: string;
    uploadedBy: string;
    catalogId: string;
    catalog: Catalog;
    postId: string | null;
    post: string | null;
    uploadedAt: string;
}

export interface EventOrganized {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    location: string;
    organizerId: string;
    organizer: string;
    isPublic: boolean;
    createdAt: string;
}

export interface Profile {
    id: string;
    email: string;
    jobTitle: string;
    passwordHash: string;
    salt: string;
    fullName: string;
    createdAt: string;
    userRoles: UserRole[];
    posts: Post[];
    documents: Document[];
    eventsOrganized: EventOrganized[];
}
