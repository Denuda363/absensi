/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Employee,
  Shift,
  AttendanceRecord,
  DailyReport,
  LateAlertNotification,
  PharmacySettings,
  EmployeeDayOff,
  DayOffSwapRecord
} from './types';
import {
  getStoredData,
  saveToStorage,
  STORAGE_KEYS
} from './utils/storage';
import {
  getIndonesianCurrentDateString,
  getCurrentTimeFormatted
} from './utils/date';
import {
  COLLECTIONS,
  seedInitialFirestoreData,
  subscribeCollection,
  subscribeSingleDoc,
  saveDocument,
  removeDocument
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { EmployeeAttendance } from './components/EmployeeAttendance';
import { DailyReportForm } from './components/DailyReportForm';
import { EmployeeHistory } from './components/EmployeeHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminReports } from './components/AdminReports';
import { AdminSettings } from './components/AdminSettings';
import { LateAlertModal } from './components/LateAlertModal';
import { NotificationModal } from './components/NotificationModal';
import { PinModal } from './components/PinModal';
import { EmployeeSearchModal } from './components/EmployeeSearchModal';

export default function App() {
  const initial = getStoredData();

  const [currentRole, setCurrentRole] = useState<UserRole>(initial.activeRole);
  const [activeTab, setActiveTab] = useState<string>(
    initial.activeRole === 'karyawan' ? 'absensi' : 'admin-dashboard'
  );
  const [employees, setEmployees] = useState<Employee[]>(initial.employees);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(initial.activeUserId);
  const [shifts, setShifts] = useState<Shift[]>(initial.shifts);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initial.attendance);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(initial.reports);
  const [notifications, setNotifications] = useState<LateAlertNotification[]>(initial.notifications);
  const [settings, setSettings] = useState<PharmacySettings>(initial.settings);
  const [dayOffs, setDayOffs] = useState<EmployeeDayOff[]>(initial.dayOffs);
  const [dayOffSwaps, setDayOffSwaps] = useState<DayOffSwapRecord[]>(initial.dayOffSwaps);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(true);

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isLateModalOpen, setIsLateModalOpen] = useState<boolean>(false);
  const [activeLateRecord, setActiveLateRecord] = useState<AttendanceRecord | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  const today = getIndonesianCurrentDateString();

  // Initialize and subscribe to Firebase Firestore live data
  useEffect(() => {
    // Seed initial data to cloud if collections are empty
    seedInitialFirestoreData().catch((err) => {
      console.warn('Firestore seeding check:', err);
    });

    // 1. Employees live subscription
    const unsubEmployees = subscribeCollection<Employee>(
      COLLECTIONS.EMPLOYEES,
      (data) => {
        if (data && data.length > 0) setEmployees(data);
      },
      initial.employees
    );

    // 2. Shifts live subscription
    const unsubShifts = subscribeCollection<Shift>(
      COLLECTIONS.SHIFTS,
      (data) => {
        if (data && data.length > 0) {
          // Sort shifts by startTime for consistency
          const sorted = [...data].sort((a, b) => a.startTime.localeCompare(b.startTime));
          setShifts(sorted);
        }
      },
      initial.shifts
    );

    // 3. Settings live subscription
    const unsubSettings = subscribeSingleDoc<PharmacySettings>(
      COLLECTIONS.SETTINGS,
      'default-settings',
      (data) => {
        if (data) {
          if (data.adminPin === '1234') {
            const migrated = { ...data, adminPin: '151219' };
            setSettings(migrated);
            saveDocument(COLLECTIONS.SETTINGS, 'default-settings', migrated).catch(() => {});
          } else {
            setSettings(data);
          }
        }
      },
      initial.settings
    );

    // 4. Attendances live subscription
    const unsubAttendance = subscribeCollection<AttendanceRecord>(
      COLLECTIONS.ATTENDANCE,
      (data) => {
        if (data) {
          // Keep newest records on top
          const sorted = [...data].sort((a, b) => (b.date + (b.clockInTime || '')).localeCompare(a.date + (a.clockInTime || '')));
          setAttendanceRecords(sorted);
        }
      },
      initial.attendance
    );

    // 5. Daily Reports live subscription
    const unsubReports = subscribeCollection<DailyReport>(
      COLLECTIONS.REPORTS,
      (data) => {
        if (data) {
          const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
          setDailyReports(sorted);
        }
      },
      initial.reports
    );

    // 6. Notifications live subscription
    const unsubNotifs = subscribeCollection<LateAlertNotification>(
      COLLECTIONS.NOTIFICATIONS,
      (data) => {
        if (data) {
          const sorted = [...data].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          setNotifications(sorted);
        }
      },
      initial.notifications
    );

    // 7. Day Offs live subscription
    const unsubDayOffs = subscribeCollection<EmployeeDayOff>(
      COLLECTIONS.DAY_OFFS,
      (data) => {
        if (data && data.length > 0) setDayOffs(data);
      },
      initial.dayOffs
    );

    // 8. Day Off Swaps live subscription
    const unsubSwaps = subscribeCollection<DayOffSwapRecord>(
      COLLECTIONS.DAY_OFF_SWAPS,
      (data) => {
        if (data) {
          const sorted = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          setDayOffSwaps(sorted);
        }
      },
      initial.dayOffSwaps
    );

    return () => {
      unsubEmployees();
      unsubShifts();
      unsubSettings();
      unsubAttendance();
      unsubReports();
      unsubNotifs();
      unsubDayOffs();
      unsubSwaps();
    };
  }, []);

  // Current employee object
  const currentEmployee =
    employees.find((e) => e.id === currentEmployeeId) || employees[0];

  // Today's attendance record for current employee
  const todayRecord =
    attendanceRecords.find(
      (r) => r.employeeId === currentEmployee.id && r.date === today
    ) || null;

  // Today's daily report for current employee
  const todayReport =
    dailyReports.find(
      (r) => r.employeeId === currentEmployee.id && r.date === today
    ) || null;

  // Save changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REPORTS, dailyReports);
  }, [dailyReports]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
  }, [shifts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  }, [employees]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_USER_ID, currentEmployeeId);
  }, [currentEmployeeId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DAY_OFFS, dayOffs);
  }, [dayOffs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DAY_OFF_SWAPS, dayOffSwaps);
  }, [dayOffSwaps]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_ROLE, currentRole);
    // Role-based tab restriction:
    if (currentRole === 'karyawan') {
      if (activeTab !== 'absensi') {
        setActiveTab('absensi');
      }
    } else {
      if (activeTab === 'absensi' || activeTab === 'riwayat') {
        setActiveTab('admin-dashboard');
      }
    }
  }, [currentRole]);

  // Handle Clock-In
  const handleClockIn = (data: {
    shift: Shift;
    clockInTime: string;
    photo: string;
    location: any;
    isLate: boolean;
    lateMinutes: number;
  }) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: currentEmployee.role,
      date: today,
      shiftId: data.shift.id,
      shiftName: data.shift.name,
      scheduledStartTime: data.shift.startTime,
      scheduledEndTime: data.shift.endTime,
      clockInTime: data.clockInTime,
      clockInPhoto: data.photo,
      clockInLocation: data.location,
      clockOutTime: null,
      clockOutPhoto: null,
      status: data.isLate ? 'terlambat' : 'tepat_waktu',
      lateMinutes: data.lateMinutes,
      lateReason: null,
      lateStatusAcknowledged: false,
      notificationDispatched: data.isLate,
      notificationDispatchedAt: data.isLate ? data.clockInTime : undefined
    };

    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.employeeId === currentEmployee.id && r.date === today)
      );
      return [newRecord, ...filtered];
    });

    // Write to Firestore Cloud Database
    saveDocument(COLLECTIONS.ATTENDANCE, newRecord.id, newRecord).catch((err) => {
      console.warn('Firestore attendance save warning:', err);
    });

    // If late, also push to notification list and open automatic late modal
    if (data.isLate) {
      const newNotif: LateAlertNotification = {
        id: `notif-${Date.now()}`,
        attendanceId: newRecord.id,
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        employeeRole: currentEmployee.role,
        shiftName: data.shift.name,
        scheduledTime: data.shift.startTime,
        clockInTime: data.clockInTime,
        lateMinutes: data.lateMinutes,
        timestamp: `${today} ${data.clockInTime}`,
        isRead: false,
        waSent: false
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Write to Firestore Cloud Database
      saveDocument(COLLECTIONS.NOTIFICATIONS, newNotif.id, newNotif).catch((err) => {
        console.warn('Firestore notification save warning:', err);
      });

      setActiveLateRecord(newRecord);
      setIsLateModalOpen(true);
    }
  };

  // Handle Clock-Out
  const handleClockOut = (data: { clockOutTime: string; photo: string }) => {
    if (!todayRecord) return;
    const updated: AttendanceRecord = {
      ...todayRecord,
      clockOutTime: data.clockOutTime,
      clockOutPhoto: data.photo
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );

    // Write to Firestore Cloud Database
    saveDocument(COLLECTIONS.ATTENDANCE, updated.id, updated).catch((err) => {
      console.warn('Firestore clock-out save warning:', err);
    });
  };

  // Handle Save Reason for Keterlambatan
  const handleSaveLateReason = (
    reason: string,
    category?: AttendanceRecord['lateReasonCategory']
  ) => {
    if (!activeLateRecord) return;
    const updated: AttendanceRecord = {
      ...activeLateRecord,
      lateReason: reason,
      lateReasonCategory: category,
      lateStatusAcknowledged: true,
      notificationDispatched: true
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );

    // Save updated record to Firestore
    saveDocument(COLLECTIONS.ATTENDANCE, updated.id, updated).catch((err) => {
      console.warn('Firestore late reason save warning:', err);
    });

    // Update corresponding notification
    const matchedNotif = notifications.find((n) => n.attendanceId === updated.id);
    if (matchedNotif) {
      const updatedNotif = { ...matchedNotif, reason, waSent: true };
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
      );
      saveDocument(COLLECTIONS.NOTIFICATIONS, updatedNotif.id, updatedNotif).catch((err) => {
        console.warn('Firestore notif reason save warning:', err);
      });
    }
  };

  // Handle Save Daily Report
  const handleSaveDailyReport = (report: DailyReport) => {
    setDailyReports((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === report.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = report;
        return copy;
      }
      return [report, ...prev];
    });

    // Write to Firestore Cloud Database
    saveDocument(COLLECTIONS.REPORTS, report.id, report).catch((err) => {
      console.warn('Firestore daily report save warning:', err);
    });
  };

  // Handle Update Record from Admin
  const handleUpdateRecord = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === record.id ? record : r))
    );
    // Write to Firestore Cloud Database
    saveDocument(COLLECTIONS.ATTENDANCE, record.id, record).catch((err) => {
      console.warn('Firestore record update warning:', err);
    });
  };

  // Handle Delete Record from Admin
  const handleDeleteRecord = (recordId: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
    setNotifications((prev) => prev.filter((n) => n.attendanceId !== recordId));

    // Delete from Firestore Cloud Database
    removeDocument(COLLECTIONS.ATTENDANCE, recordId).catch((err) => {
      console.warn('Firestore record remove warning:', err);
    });
  };

  // Handle Mark Notification Read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, isRead: true };
          saveDocument(COLLECTIONS.NOTIFICATIONS, id, updated).catch(() => {});
          return updated;
        }
        return n;
      })
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        const updated = { ...n, isRead: true };
        saveDocument(COLLECTIONS.NOTIFICATIONS, n.id, updated).catch(() => {});
        return updated;
      })
    );
  };

  // Handle Settings Save
  const handleSaveSettings = (newSettings: PharmacySettings, newShifts: Shift[]) => {
    setSettings(newSettings);
    setShifts(newShifts);

    // Save to Firestore
    saveDocument(COLLECTIONS.SETTINGS, 'default-settings', newSettings).catch((err) => {
      console.warn('Firestore settings save warning:', err);
    });
    for (const sh of newShifts) {
      saveDocument(COLLECTIONS.SHIFTS, sh.id, sh).catch((err) => {
        console.warn('Firestore shift save warning:', err);
      });
    }
  };

  // Handle Day Offs and Swap
  const handleUpdateDayOffs = (updated: EmployeeDayOff[]) => {
    setDayOffs(updated);
    for (const doff of updated) {
      saveDocument(COLLECTIONS.DAY_OFFS, doff.id, doff).catch((err) => {
        console.warn('Firestore day off save warning:', err);
      });
    }
  };

  const handleAddDayOffSwap = (swap: DayOffSwapRecord) => {
    setDayOffSwaps((prev) => [swap, ...prev]);
    saveDocument(COLLECTIONS.DAY_OFF_SWAPS, swap.id, swap).catch((err) => {
      console.warn('Firestore swap save warning:', err);
    });
  };

  const handleCancelDayOffSwap = (swapId: string) => {
    setDayOffSwaps((prev) =>
      prev.map((s) => {
        if (s.id === swapId) {
          const updated: DayOffSwapRecord = { ...s, status: 'dibatalkan' };
          saveDocument(COLLECTIONS.DAY_OFF_SWAPS, swapId, updated).catch(() => {});
          return updated;
        }
        return s;
      })
    );
  };

  // Handle Employee Management (Add, Update, Delete)
  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees((prev) => [...prev, newEmployee]);

    // Persist new employee to Firebase Firestore
    saveDocument(COLLECTIONS.EMPLOYEES, newEmployee.id, newEmployee).catch((err) => {
      console.warn('Firestore employee add error:', err);
    });

    // Create default day off schedule for this new employee
    const newDayOff: EmployeeDayOff = {
      id: `dayoff-${newEmployee.id}`,
      employeeId: newEmployee.id,
      employeeName: newEmployee.name,
      regularDayOff: 'Minggu',
      specificDatesOff: [],
      notes: 'Staf baru Apotek Assyifa Farma'
    };
    setDayOffs((prev) => [...prev, newDayOff]);
    saveDocument(COLLECTIONS.DAY_OFFS, newDayOff.id, newDayOff).catch(() => {});
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e))
    );

    // Update in Firestore
    saveDocument(COLLECTIONS.EMPLOYEES, updatedEmployee.id, updatedEmployee).catch((err) => {
      console.warn('Firestore employee update error:', err);
    });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));

    // Remove from Firestore
    removeDocument(COLLECTIONS.EMPLOYEES, employeeId).catch((err) => {
      console.warn('Firestore employee remove error:', err);
    });

    // If current selected employee is deleted, fallback to first available
    if (currentEmployeeId === employeeId) {
      const remaining = employees.filter((e) => e.id !== employeeId);
      if (remaining.length > 0) {
        setCurrentEmployeeId(remaining[0].id);
      }
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onRequestAdminAccess={() => setIsPinModalOpen(true)}
        currentEmployee={currentEmployee}
        employees={employees}
        onEmployeeSelect={setCurrentEmployeeId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        firebaseConnected={isFirebaseSynced}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-10">
        {currentRole === 'karyawan' ? (
          <EmployeeAttendance
            currentEmployee={currentEmployee}
            shifts={shifts}
            settings={settings}
            todayRecord={todayRecord}
            dayOffs={dayOffs}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onOpenSearchModal={() => setIsSearchModalOpen(true)}
            onOpenLateModal={(rec) => {
              setActiveLateRecord(rec);
              setIsLateModalOpen(true);
            }}
          />
        ) : (
          <>
            {activeTab === 'admin-dashboard' && (
              <AdminDashboard
                employees={employees}
                shifts={shifts}
                attendanceRecords={attendanceRecords}
                dailyReports={dailyReports}
                notifications={notifications}
                settings={settings}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onMarkNotificationRead={handleMarkNotificationRead}
                onNavigateToReports={() => setActiveTab('admin-reports')}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'admin-reports' && (
              <AdminReports
                dailyReports={dailyReports}
                employees={employees}
                settings={settings}
                shifts={shifts}
                onUpdateReport={handleSaveDailyReport}
              />
            )}

            {activeTab === 'admin-rekap' && (
              <AdminDashboard
                employees={employees}
                shifts={shifts}
                attendanceRecords={attendanceRecords}
                dailyReports={dailyReports}
                notifications={notifications}
                settings={settings}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onMarkNotificationRead={handleMarkNotificationRead}
                onNavigateToReports={() => setActiveTab('admin-reports')}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'admin-settings' && (
              <AdminSettings
                settings={settings}
                shifts={shifts}
                employees={employees}
                dayOffs={dayOffs}
                dayOffSwaps={dayOffSwaps}
                onSaveSettings={handleSaveSettings}
                onUpdateDayOffs={handleUpdateDayOffs}
                onAddSwapRecord={handleAddDayOffSwap}
                onCancelSwapRecord={handleCancelDayOffSwap}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Apotek Assyifa Farma Cideres</strong> · Jl. Raya Cideres - Kadipaten No. 88, Dawuan, Majalengka
          </div>
          <div className="text-slate-400">
            SIA: 503/014/SIA/DPMPTSP · Penanggung Jawab: Apt. Siti Nurhaliza, S.Farm
          </div>
        </div>
      </footer>

      {/* Late Alert Modal */}
      <LateAlertModal
        isOpen={isLateModalOpen}
        onClose={() => setIsLateModalOpen(false)}
        record={activeLateRecord}
        settings={settings}
        onSubmitReason={handleSaveLateReason}
      />

      {/* Notification Drawer Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        employees={employees}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      {/* Admin Mode Security PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        correctPin={settings.adminPin || '151219'}
        onSuccess={() => {
          setCurrentRole('admin');
          setActiveTab('admin-dashboard');
        }}
      />

      {/* Employee Search Modal */}
      <EmployeeSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        employees={employees}
        currentEmployeeId={currentEmployeeId}
        onSelectEmployee={(empId) => setCurrentEmployeeId(empId)}
      />

    </div>
  );
}
