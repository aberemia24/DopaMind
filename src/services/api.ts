import { FirebaseError } from 'firebase/app';
import { 
  DocumentData, 
  QueryDocumentSnapshot, 
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  status: 'success' | 'error';
}

export interface FirestoreDocument<T = DocumentData> {
  id: string;
  data: T;
  exists: boolean;
  metadata: {
    hasPendingWrites: boolean;
    fromCache: boolean;
  };
}

export function convertFirestoreDocument<T>(
  doc: DocumentSnapshot<DocumentData>
): FirestoreDocument<T> {
  return {
    id: doc.id,
    data: doc.data() as T,
    exists: doc.exists(),
    metadata: {
      hasPendingWrites: doc.metadata.hasPendingWrites,
      fromCache: doc.metadata.fromCache
    }
  };
}

export function convertQuerySnapshot<T>(
  querySnapshot: QuerySnapshot<DocumentData>
): FirestoreDocument<T>[] {
  return querySnapshot.docs.map(doc => convertFirestoreDocument<T>(doc));
}

export function handleFirebaseError(error: FirebaseError): ApiResponse<never> {
  return {
    error: {
      code: error.code,
      message: error.message
    },
    status: 'error'
  };
}

// API service functions will be implemented here
export const api = {
  // Example placeholder
  ping: async (): Promise<ApiResponse<{ status: string }>> => {
    return { 
      data: { status: 'ok' },
      status: 'success'
    };
  },
};
