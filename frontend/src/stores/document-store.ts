import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'png' | 'txt' | 'xlsx' | 'ppt'
  category: 'academic' | 'financial' | 'assignments' | 'forms' | 'personal' | 'shared'
  size: number // in bytes
  uploadedAt: string
  uploadedBy: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  url?: string
  thumbnailUrl?: string
  description?: string
  tags?: string[]
  sharedWith?: string[]
  version?: number
  parentId?: string // For versioning
  metadata?: {
    course?: string
    semester?: string
    dueDate?: string
    grade?: string
    comments?: string
  }
}

export interface DocumentFolder {
  id: string
  name: string
  parentId?: string
  documentIds: string[]
  createdAt: string
}

interface DocumentState {
  documents: Document[]
  folders: DocumentFolder[]
  recentDocuments: Document[]
  uploadQueue: File[]
  storageUsed: number
  storageLimit: number
  pendingUploads: number

  // Actions
  addDocument: (document: Document) => void
  removeDocument: (documentId: string) => void
  updateDocument: (documentId: string, updates: Partial<Document>) => void

  // Upload actions
  addToUploadQueue: (files: File[]) => void
  removeFromUploadQueue: (fileName: string) => void
  clearUploadQueue: () => void

  // Folder actions
  createFolder: (folder: DocumentFolder) => void
  deleteFolder: (folderId: string) => void
  moveDocument: (documentId: string, folderId: string) => void

  // Sharing
  shareDocument: (documentId: string, userIds: string[]) => void
  unshareDocument: (documentId: string, userId: string) => void

  // Utilities
  getDocumentsByCategory: (category: Document['category']) => Document[]
  searchDocuments: (query: string) => Document[]
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Official Transcript.pdf',
    type: 'pdf',
    category: 'academic',
    size: 2456789,
    uploadedAt: '2024-01-20',
    uploadedBy: 'Maria Rodriguez',
    status: 'verified',
    description: 'Official academic transcript from previous institution',
    tags: ['transcript', 'official', 'required'],
    version: 1
  },
  {
    id: '2',
    name: 'Personal Statement.docx',
    type: 'docx',
    category: 'academic',
    size: 45678,
    uploadedAt: '2024-01-21',
    uploadedBy: 'Maria Rodriguez',
    status: 'verified',
    description: 'Personal statement for admission application',
    tags: ['application', 'essay'],
    version: 3
  },
  {
    id: '3',
    name: 'Financial Aid Application.pdf',
    type: 'pdf',
    category: 'financial',
    size: 1234567,
    uploadedAt: '2024-02-01',
    uploadedBy: 'System',
    status: 'pending',
    description: 'FAFSA application for 2024-2025',
    tags: ['financial aid', 'fafsa'],
    version: 1
  },
  {
    id: '4',
    name: 'CS301 Assignment 3.pdf',
    type: 'pdf',
    category: 'assignments',
    size: 3456789,
    uploadedAt: '2024-03-15',
    uploadedBy: 'David Park',
    status: 'verified',
    description: 'Data structures assignment - Binary Trees',
    tags: ['CS301', 'assignment'],
    metadata: {
      course: 'CS301',
      semester: 'Spring 2024',
      dueDate: '2024-03-20',
      grade: 'A-'
    },
    version: 2
  },
  {
    id: '5',
    name: 'Course Registration Form.pdf',
    type: 'pdf',
    category: 'forms',
    size: 234567,
    uploadedAt: '2024-01-10',
    uploadedBy: 'Registrar Office',
    status: 'verified',
    description: 'Signed course registration form for Spring 2024',
    tags: ['registration', 'form', 'spring2024'],
    sharedWith: ['advisor@university.edu'],
    version: 1
  },
  {
    id: '6',
    name: 'Recommendation Letter - Dr. Smith.pdf',
    type: 'pdf',
    category: 'academic',
    size: 567890,
    uploadedAt: '2024-01-15',
    uploadedBy: 'Dr. Smith',
    status: 'verified',
    description: 'Letter of recommendation from Dr. Smith',
    tags: ['recommendation', 'letter'],
    sharedWith: ['maria.rodriguez@student.edu'],
    version: 1
  },
  {
    id: '7',
    name: 'Tax Form 1098-T.pdf',
    type: 'pdf',
    category: 'financial',
    size: 456789,
    uploadedAt: '2024-01-31',
    uploadedBy: 'Financial Services',
    status: 'verified',
    description: '2023 Tax form for education expenses',
    tags: ['tax', '1098-T', '2023'],
    version: 1
  },
  {
    id: '8',
    name: 'Research Paper Draft.docx',
    type: 'docx',
    category: 'assignments',
    size: 2345678,
    uploadedAt: '2024-03-10',
    uploadedBy: 'Sophie Turner',
    status: 'pending',
    description: 'First draft of research paper on Machine Learning',
    tags: ['research', 'draft', 'ML'],
    metadata: {
      course: 'CS450',
      semester: 'Spring 2024',
      dueDate: '2024-04-15'
    },
    version: 1
  }
]

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: mockDocuments,
      folders: [],
      recentDocuments: mockDocuments.slice(0, 5),
      uploadQueue: [],
      storageUsed: mockDocuments.reduce((sum, doc) => sum + doc.size, 0),
      storageLimit: 500 * 1024 * 1024, // 500MB
      pendingUploads: 2,

      addDocument: (document) => {
        set((state) => ({
          documents: [document, ...state.documents],
          recentDocuments: [document, ...state.recentDocuments.slice(0, 4)],
          storageUsed: state.storageUsed + document.size
        }))
      },

      removeDocument: (documentId) => {
        const document = get().documents.find(d => d.id === documentId)
        if (document) {
          set((state) => ({
            documents: state.documents.filter(d => d.id !== documentId),
            recentDocuments: state.recentDocuments.filter(d => d.id !== documentId),
            storageUsed: state.storageUsed - document.size
          }))
        }
      },

      updateDocument: (documentId, updates) => {
        set((state) => ({
          documents: state.documents.map(doc =>
            doc.id === documentId ? { ...doc, ...updates } : doc
          ),
          recentDocuments: state.recentDocuments.map(doc =>
            doc.id === documentId ? { ...doc, ...updates } : doc
          )
        }))
      },

      addToUploadQueue: (files) => {
        set((state) => ({
          uploadQueue: [...state.uploadQueue, ...files]
        }))
      },

      removeFromUploadQueue: (fileName) => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter(f => f.name !== fileName)
        }))
      },

      clearUploadQueue: () => {
        set({ uploadQueue: [] })
      },

      createFolder: (folder) => {
        set((state) => ({
          folders: [...state.folders, folder]
        }))
      },

      deleteFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.filter(f => f.id !== folderId)
        }))
      },

      moveDocument: (documentId, folderId) => {
        set((state) => ({
          folders: state.folders.map(folder =>
            folder.id === folderId
              ? { ...folder, documentIds: [...folder.documentIds, documentId] }
              : { ...folder, documentIds: folder.documentIds.filter(id => id !== documentId) }
          )
        }))
      },

      shareDocument: (documentId, userIds) => {
        set((state) => ({
          documents: state.documents.map(doc =>
            doc.id === documentId
              ? { ...doc, sharedWith: [...(doc.sharedWith || []), ...userIds] }
              : doc
          )
        }))
      },

      unshareDocument: (documentId, userId) => {
        set((state) => ({
          documents: state.documents.map(doc =>
            doc.id === documentId
              ? { ...doc, sharedWith: doc.sharedWith?.filter(id => id !== userId) }
              : doc
          )
        }))
      },

      getDocumentsByCategory: (category) => {
        return get().documents.filter(doc => doc.category === category)
      },

      searchDocuments: (query) => {
        const lowercaseQuery = query.toLowerCase()
        return get().documents.filter(doc =>
          doc.name.toLowerCase().includes(lowercaseQuery) ||
          doc.description?.toLowerCase().includes(lowercaseQuery) ||
          doc.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
      }
    }),
    {
      name: 'document-store'
    }
  )
)