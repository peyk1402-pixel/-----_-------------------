import type { BankTransaction, SystemReport } from '../types';

const DB_NAME = 'FinancialAppDB';
const DB_VERSION = 1;
const BANK_STORE_NAME = 'bankData';
const SYSTEM_STORE_NAME = 'systemData';

let db: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(BANK_STORE_NAME)) {
        dbInstance.createObjectStore(BANK_STORE_NAME, { autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains(SYSTEM_STORE_NAME)) {
        dbInstance.createObjectStore(SYSTEM_STORE_NAME, { autoIncrement: true });
      }
    };
  });
}

async function saveDataToStore<T>(storeName: string, data: T[]): Promise<void> {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  
  store.clear();

  data.forEach(item => {
      store.add(item);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      console.error(`Error saving data to ${storeName}`, transaction.error);
      reject(`Error saving data to ${storeName}`);
    };
  });
}

async function loadDataFromStore<T>(storeName: string): Promise<T[]> {
    try {
        const db = await getDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            request.onerror = (event) => {
                console.error(`Error loading data from ${storeName}`, request.error);
                reject(`Error loading data from ${storeName}`);
            };
        });
    } catch (error) {
        console.error(`Failed to load data from ${storeName}:`, error);
        return [];
    }
}

export const dbService = {
  saveBankData: (data: BankTransaction[]) => saveDataToStore(BANK_STORE_NAME, data),
  loadBankData: () => loadDataFromStore<BankTransaction>(BANK_STORE_NAME),
  saveSystemData: (data: SystemReport[]) => saveDataToStore(SYSTEM_STORE_NAME, data),
  loadSystemData: () => loadDataFromStore<SystemReport>(SYSTEM_STORE_NAME),
};
