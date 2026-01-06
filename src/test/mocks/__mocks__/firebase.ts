// This file mocks Firebase modules at the module level
// It's automatically hoisted by Vitest before tests run
import { vi } from 'vitest';

const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((callback) => {
    // Return unsubscribe function
    return vi.fn();
  }),
};

const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
};

const mockFirebaseApp = {
  auth: () => mockAuth,
  firestore: () => mockFirestore,
};

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Return unsubscribe function
    return vi.fn();
  }),
  User: class MockUser {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestore),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  collection: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockFirebaseApp),
}));

