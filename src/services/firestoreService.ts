import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Employee,
  Shift,
  AttendanceRecord,
  DailyReport,
  LateAlertNotification,
  PharmacySettings,
  EmployeeDayOff,
  DayOffSwapRecord
} from '../types';
import {
  DEFAULT_EMPLOYEES,
  DEFAULT_SHIFTS,
  DEFAULT_SETTINGS,
  DEFAULT_DAY_OFFS,
  DEFAULT_DAY_OFF_SWAPS,
  getInitialAttendance,
  getInitialDailyReports,
  getInitialNotifications
} from '../utils/storage';
import { getIndonesianCurrentDateString } from '../utils/date';

export type SyncStatus = 'connecting' | 'synced' | 'saving' | 'offline' | 'error';

// Collection Names
export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  SHIFTS: 'shifts',
  ATTENDANCE: 'attendances',
  REPORTS: 'dailyReports',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  DAY_OFFS: 'dayOffs',
  DAY_OFF_SWAPS: 'dayOffSwaps'
};

// Seed Firestore with initial default data if cloud database is empty
export async function seedInitialFirestoreData(): Promise<void> {
  const today = getIndonesianCurrentDateString();
  try {
    // 1. Employees
    const empSnap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    if (empSnap.empty) {
      for (const emp of DEFAULT_EMPLOYEES) {
        await setDoc(doc(db, COLLECTIONS.EMPLOYEES, emp.id), emp, { merge: true });
      }
    }

    // 2. Shifts
    const shiftSnap = await getDocs(collection(db, COLLECTIONS.SHIFTS));
    if (shiftSnap.empty) {
      for (const shift of DEFAULT_SHIFTS) {
        await setDoc(doc(db, COLLECTIONS.SHIFTS, shift.id), shift, { merge: true });
      }
    }

    // 3. Settings
    const settingSnap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
    if (settingSnap.empty) {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'default-settings'), DEFAULT_SETTINGS, { merge: true });
    }

    // 4. Day Offs
    const dayOffSnap = await getDocs(collection(db, COLLECTIONS.DAY_OFFS));
    if (dayOffSnap.empty) {
      for (const doff of DEFAULT_DAY_OFFS) {
        await setDoc(doc(db, COLLECTIONS.DAY_OFFS, doff.id), doff, { merge: true });
      }
    }

    // 5. Day Off Swaps
    const swapSnap = await getDocs(collection(db, COLLECTIONS.DAY_OFF_SWAPS));
    if (swapSnap.empty) {
      for (const swap of DEFAULT_DAY_OFF_SWAPS) {
        await setDoc(doc(db, COLLECTIONS.DAY_OFF_SWAPS, swap.id), swap, { merge: true });
      }
    }

    // 6. Attendances
    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    if (attSnap.empty) {
      const initialAtt = getInitialAttendance(today);
      for (const att of initialAtt) {
        await setDoc(doc(db, COLLECTIONS.ATTENDANCE, att.id), att, { merge: true });
      }
    }

    // 7. Daily Reports
    const repSnap = await getDocs(collection(db, COLLECTIONS.REPORTS));
    if (repSnap.empty) {
      const initialRep = getInitialDailyReports(today);
      for (const rep of initialRep) {
        await setDoc(doc(db, COLLECTIONS.REPORTS, rep.id), rep, { merge: true });
      }
    }

    // 8. Notifications
    const notifSnap = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
    if (notifSnap.empty) {
      const initialNotifs = getInitialNotifications(today);
      for (const n of initialNotifs) {
        await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), n, { merge: true });
      }
    }
  } catch (error) {
    console.warn('Initial seeding note (will use local fallback if offline):', error);
  }
}

// Subscriptions
export function subscribeCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  fallbackData?: T[]
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty && fallbackData && fallbackData.length > 0) {
        onData(fallbackData);
        return;
      }
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as T);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

export function subscribeSingleDoc<T>(
  collectionName: string,
  docId: string,
  onData: (data: T) => void,
  fallbackData?: T
): Unsubscribe {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as T);
      } else if (fallbackData) {
        onData(fallbackData);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    }
  );
}

// Generic Save Document
export async function saveDocument<T extends object>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// Generic Delete Document
export async function removeDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}
