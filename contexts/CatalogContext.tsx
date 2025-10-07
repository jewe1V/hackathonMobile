// contexts/CatalogContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { Catalog, Document, CreateCatalogData, UploadDocumentData } from '@/models/Catalog';

interface CatalogState {
    catalogs: Catalog[];
    currentCatalog: Catalog | null;
    isLoading: boolean;
    error: string | null;
}

type CatalogAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CATALOGS'; payload: Catalog[] }
    | { type: 'SET_CURRENT_CATALOG'; payload: Catalog | null }
    | { type: 'ADD_CATALOG'; payload: Catalog }
    | { type: 'UPDATE_CATALOG'; payload: Catalog }
    | { type: 'DELETE_CATALOG'; payload: string }
    | { type: 'ADD_DOCUMENT'; payload: { catalogId: string; document: Document } }
    | { type: 'DELETE_DOCUMENT'; payload: { catalogId: string; documentId: string } };

interface CatalogContextType extends CatalogState {
    loadCatalogs: () => Promise<void>;
    loadCatalog: (id: string) => Promise<void>;
    createCatalog: (data: CreateCatalogData) => Promise<void>;
    updateCatalog: (id: string, data: CreateCatalogData) => Promise<void>;
    deleteCatalog: (id: string) => Promise<void>;
    uploadDocument: (data: UploadDocumentData) => Promise<void>;
    deleteDocument: (catalogId: string, documentId: string) => Promise<void>;
    clearError: () => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const catalogReducer = (state: CatalogState, action: CatalogAction): CatalogState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_CATALOGS':
            return { ...state, catalogs: action.payload };
        case 'SET_CURRENT_CATALOG':
            return { ...state, currentCatalog: action.payload };
        case 'ADD_CATALOG':
            return { ...state, catalogs: [...state.catalogs, action.payload] };
        case 'UPDATE_CATALOG':
            return {
                ...state,
                catalogs: state.catalogs.map(cat =>
                    cat.id === action.payload.id ? action.payload : cat
                ),
                currentCatalog: state.currentCatalog?.id === action.payload.id ? action.payload : state.currentCatalog,
            };
        case 'DELETE_CATALOG':
            return {
                ...state,
                catalogs: state.catalogs.filter(cat => cat.id !== action.payload),
                currentCatalog: state.currentCatalog?.id === action.payload ? null : state.currentCatalog,
            };
        case 'ADD_DOCUMENT':
            return {
                ...state,
                catalogs: state.catalogs.map(cat =>
                    cat.id === action.payload.catalogId
                        ? { ...cat, documents: [...cat.documents, action.payload.document] }
                        : cat
                ),
                currentCatalog: state.currentCatalog?.id === action.payload.catalogId
                    ? { ...state.currentCatalog, documents: [...state.currentCatalog.documents, action.payload.document] }
                    : state.currentCatalog,
            };
        case 'DELETE_DOCUMENT':
            return {
                ...state,
                catalogs: state.catalogs.map(cat =>
                    cat.id === action.payload.catalogId
                        ? { ...cat, documents: cat.documents.filter(doc => doc.id !== action.payload.documentId) }
                        : cat
                ),
                currentCatalog: state.currentCatalog?.id === action.payload.catalogId
                    ? { ...state.currentCatalog, documents: state.currentCatalog.documents.filter(doc => doc.id !== action.payload.documentId) }
                    : state.currentCatalog,
            };
        default:
            return state;
    }
};

const initialState: CatalogState = {
    catalogs: [],
    currentCatalog: null,
    isLoading: false,
    error: null,
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(catalogReducer, initialState);

    const loadCatalogs = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const catalogs = await catalogService.getCatalogs();
            dispatch({ type: 'SET_CATALOGS', payload: catalogs });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка загрузки каталогов' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const loadCatalog = async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const catalog = await catalogService.getCatalog(id);
            dispatch({ type: 'SET_CURRENT_CATALOG', payload: catalog });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка загрузки каталога' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const createCatalog = async (data: CreateCatalogData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newCatalog = await catalogService.createCatalog(data);
            dispatch({ type: 'ADD_CATALOG', payload: newCatalog });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка создания каталога' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateCatalog = async (id: string, data: CreateCatalogData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const updatedCatalog = await catalogService.updateCatalog(id, data);
            dispatch({ type: 'UPDATE_CATALOG', payload: updatedCatalog });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка обновления каталога' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deleteCatalog = async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await catalogService.deleteCatalog(id);
            dispatch({ type: 'DELETE_CATALOG', payload: id });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка удаления каталога' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const uploadDocument = async (data: UploadDocumentData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const document = await catalogService.uploadDocument(data);
            dispatch({ type: 'ADD_DOCUMENT', payload: { catalogId: data.catalogId, document } });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка загрузки документа' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deleteDocument = async (catalogId: string, documentId: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await catalogService.deleteDocument(documentId);
            dispatch({ type: 'DELETE_DOCUMENT', payload: { catalogId, documentId } });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка удаления документа' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const clearError = () => {
        dispatch({ type: 'SET_ERROR', payload: null });
    };

    const value: CatalogContextType = {
        ...state,
        loadCatalogs,
        loadCatalog,
        createCatalog,
        updateCatalog,
        deleteCatalog,
        uploadDocument,
        deleteDocument,
        clearError,
    };

    return (
        <CatalogContext.Provider value={value}>
            {children}
        </CatalogContext.Provider>
    );
};

export const useCatalog = (): CatalogContextType => {
    const context = useContext(CatalogContext);
    if (context === undefined) {
        throw new Error('useCatalog must be used within a CatalogProvider');
    }
    return context;
};
