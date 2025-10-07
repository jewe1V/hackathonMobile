export interface Catalog {
    id: string;
    name: string;
    parentCatalogId: string | null;
    parentCatalog: string | null;
    ownerId: string;
    owner: string;
    children: Catalog[];
    documents: Document[];
    createdAt?: string;
    updatedAt?: string;
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
    uploadedAt: string;
}

export interface CreateCatalogData {
    name: string;
    parentCatalogId?: string | null;
}

export interface UploadDocumentData {
    fileName: string;
    file: any; // Для React Native это будет объект файла
    catalogId: string;
}
