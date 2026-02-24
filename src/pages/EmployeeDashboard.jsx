import React, { useState, useEffect, useRef, useCallback } from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useShift } from '../context/ShiftContext'
import {
  HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineClock,
  HiOutlineCalendar, HiOutlineDocumentText, HiOutlineExclamationCircle,
  HiOutlineBan, HiOutlineDocumentReport, HiChevronRight, HiChevronDown,
  HiOutlinePencilAlt, HiOutlineBell
} from 'react-icons/hi'
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { ref, set, onValue } from 'firebase/database'
import { firestore, storage, db } from '../firebase'
import { FiLogOut } from 'react-icons/fi'

const sidebarItems = [
  { id: 'profile', label: 'Profile Update' },
  { id: 'command', label: 'Command Center' },
  { id: 'attendance', label: 'Attendance History' },
  { id: 'timecard', label: 'Time Card' },
  { id: 'dayoff', label: 'Day off Request' },
  { id: 'daily', label: 'Daily Activity Report' },
  { id: 'condition', label: 'Condition Reports' },
  { id: 'disciplinary', label: 'Disciplinary Actions' },
  { id: 'reports', label: 'Reports', hasSubmenu: true, submenu: [
    { id: 'firewatch', label: 'Fire Watch Report' },
    { id: 'parkingviolation', label: 'Parking Violation Report' },
  ] },
  { id: 'infoupdate', label: 'Information Update' },
  { id: 'notifications', label: 'Notifications', badge: 3 },
];

function Sidebar({ selected, onSelect, reportsDropdownOpen, setReportsDropdownOpen }) {
  return (
    <nav className="flex flex-col gap-2">
      {sidebarItems.map(item => (
        <div key={item.id}>
          <button
            className={`w-full flex items-center gap-3 px-6 py-2.5 rounded-xl text-left font-semibold transition-colors ${selected === item.id ? 'bg-slate-800 text-[#ffb32c]' : 'text-slate-300 hover:bg-slate-800/60'} ${item.hasSubmenu ? 'justify-between' : ''}`}
            onClick={() => {
              if (item.hasSubmenu) setReportsDropdownOpen(v => !v);
              else onSelect(item.id);
            }}
          >
            <span className="flex items-center gap-3">
              {item.label}
            </span>
            {item.hasSubmenu && (
              <span>{reportsDropdownOpen ? <HiChevronDown /> : <HiChevronRight />}</span>
            )}
          </button>
          {item.hasSubmenu && reportsDropdownOpen && (
            <div className="ml-10 mt-2 flex flex-col gap-2">
              {item.submenu.map(sub => (
                <button
                  key={sub.id}
                  className={`w-full text-left px-4 py-2 rounded-lg ${sub.disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-700'} transition-colors`}
                  disabled={sub.disabled}
                  onClick={() => {
                    if (sub.disabled) return;
                    onSelect(sub.id);
                    setReportsDropdownOpen(true);
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

/* Helper: format seconds → HH:MM:SS */
function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* Helper: format Date → hh:mm:ss AM/PM */
function formatTime(date) {
  if (!date) return '—'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}

/* ───── Command Center View ───── */
function CommandCenterView({ shiftState, shiftActions, userName }) {
  const {
    selectedPost, isCheckedIn, checkInTime, checkOutTime,
    dutySeconds, isOnBreak, totalBreakSeconds, breakCount, activityLog
  } = shiftState

  const {
    setSelectedPost, handleCheckIn, handleCheckOut,
    handleBreakStart, handleBreakEnd
  } = shiftActions

  const onCheckIn = () => handleCheckIn(userName || 'Guard')

  const dutyStatus = !isCheckedIn ? 'OFF DUTY' : isOnBreak ? 'ON BREAK' : 'ON DUTY'
  const dutyStatusColor = !isCheckedIn ? 'bg-slate-600' : isOnBreak ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700'

  return (
    <div className="space-y-6">
      {/* Post Operations Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Post Operations</h2>
          <p className="text-slate-400 text-sm mt-1">
            Status:{' '}
            <span className="text-white font-medium">
              {isCheckedIn ? 'Active On-Site' : 'Off-Site'}
            </span>
          </p>
        </div>
        <span className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${dutyStatusColor} text-blue-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg`}>
          <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-blue-900 animate-pulse' : 'bg-slate-500'}`} />
          {dutyStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Personnel Action Card */}
        <div className="lg:col-span-3 bg-slate-800/60 rounded-2xl p-6 border border-white/5">
          <h3 className="text-gradient bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700 bg-clip-text text-transparent text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Personnel Action
          </h3>

          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-2">
            Select Assigned Post (Required for check in)
          </label>
          <select
            value={selectedPost}
            onChange={(e) => setSelectedPost(e.target.value)}
            disabled={isCheckedIn}
            className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Select --</option>
            <option value="post1">Corporate Tower A</option>
            <option value="post2">Retail Center B</option>
            <option value="post3">Residential Gate C</option>
          </select>
          <p className="text-slate-500 text-xs mb-6">
            Tip: If company has no areas, pick the company-only option.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: isCheckedIn ? 1 : 1.02 }}
              whileTap={{ scale: isCheckedIn ? 1 : 0.97 }}
              onClick={onCheckIn}
              disabled={isCheckedIn}
              className={`py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
                isCheckedIn
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-500 text-slate-900 hover:bg-blue-400 shadow-lg shadow-blue-500/20 cursor-pointer'
              }`}
            >
              Check In
            </motion.button>
            <motion.button
              whileHover={{ scale: !isCheckedIn ? 1 : 1.02 }}
              whileTap={{ scale: !isCheckedIn ? 1 : 0.97 }}
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
              className={`py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
                !isCheckedIn
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 text-white hover:bg-red-600 cursor-pointer'
              }`}
            >
              Check Out
            </motion.button>
            <motion.button
              whileHover={{ scale: (!isCheckedIn || isOnBreak) ? 1 : 1.02 }}
              whileTap={{ scale: (!isCheckedIn || isOnBreak) ? 1 : 0.97 }}
              onClick={handleBreakStart}
              disabled={!isCheckedIn || isOnBreak}
              className={`py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
                (!isCheckedIn || isOnBreak)
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer'
              }`}
            >
              Break Start
            </motion.button>
            <motion.button
              whileHover={{ scale: !isOnBreak ? 1 : 1.02 }}
              whileTap={{ scale: !isOnBreak ? 1 : 0.97 }}
              onClick={handleBreakEnd}
              disabled={!isOnBreak}
              className={`py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
                !isOnBreak
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer'
              }`}
            >
              Break End
            </motion.button>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider">
            <span className="text-slate-400">Break Status: </span>
            <span className={isOnBreak ? 'text-blue-400' : 'text-blue-400'}>
              {isOnBreak ? 'ON BREAK' : 'NOT ON BREAK'}
            </span>
            <span className="text-slate-500 font-normal ml-2">
              (Total: {formatDuration(totalBreakSeconds)} · {breakCount} break{breakCount !== 1 ? 's' : ''})
            </span>
          </p>
        </div>

        {/* Right Side Cards */}
        <div className="lg:col-span-2 space-y-5">
          {/* Live Timer Card */}
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5">
            <h3 className="text-gradient bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700 bg-clip-text text-transparent text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Live Session
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Check In</span>
                <span className="text-white text-sm font-medium font-mono">{formatTime(checkInTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Check Out</span>
                <span className="text-white text-sm font-medium font-mono">{formatTime(checkOutTime)}</span>
              </div>
              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Duty Time</span>
                  <span className="text-blue-400 text-lg font-bold font-mono">{formatDuration(dutySeconds)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Break Time</span>
                <span className={`text-sm font-bold font-mono ${isOnBreak ? 'text-blue-400' : 'text-slate-300'}`}>
                  {formatDuration(totalBreakSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Details Card */}
          <div className="bg-white/95 rounded-2xl p-6">
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
              Assigned Details
            </h3>
            <p className="text-slate-900 text-xl font-bold">1133 S Hope St</p>
            <p className="text-slate-600 text-sm mt-1.5">Area: —</p>
            <p className="text-slate-600 text-sm">Los Angeles, CA 90015</p>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Tracking
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${isCheckedIn ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {isCheckedIn ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      {activityLog.length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5">
          <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Activity Log
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activityLog.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  log.action.includes('Check In') ? 'bg-emerald-400' :
                  log.action.includes('Check Out') ? 'bg-red-400' :
                  log.action.includes('Break Start') ? 'bg-blue-400' : 'bg-blue-400'
                }`} />
                <span className="text-white text-sm font-medium flex-1">{log.action}</span>
                <span className="text-slate-500 text-xs font-mono">{log.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ───── Attendance History View ───── */
function AttendanceView({ records }) {
  const [perPage, setPerPage] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  // Format helpers
  const fmtDate = (d) => {
    if (!d) return '—'
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const fmtTime = (d) => {
    if (!d) return '—'
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  const fmtDuty = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    return `${String(h).padStart(1, '0')}:${String(m).padStart(2, '0')}`
  }
  const fmtBreak = (sec) => {
    const m = Math.floor(sec / 60)
    return `${m} m`
  }

  // Computed stats
  const totalDutySeconds = records.reduce((s, r) => s + (r.dutySeconds || 0), 0)
  const totalBreakSec = records.reduce((s, r) => s + (r.breakSeconds || 0), 0)
  const activeCount = records.filter(r => r.active).length

  // Sort
  const sorted = [...records].sort((a, b) => {
    let valA, valB
    if (sortField === 'date') { valA = a.date?.getTime() || 0; valB = b.date?.getTime() || 0 }
    else if (sortField === 'company') { valA = a.company; valB = b.company }
    else if (sortField === 'duty') { valA = a.dutySeconds; valB = b.dutySeconds }
    else { valA = a.date?.getTime() || 0; valB = b.date?.getTime() || 0 }
    if (sortDir === 'asc') return valA > valB ? 1 : -1
    return valA < valB ? 1 : -1
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortArrow = ({ field }) => (
    <span className="ml-1 text-[8px]">{sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/95 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Attendance Logs</h2>
            <p className="text-slate-500 text-sm mt-1">Page {currentPage} of {totalPages}</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">Duty</p>
            <p className="text-2xl font-bold text-white">{fmtDuty(totalDutySeconds)}</p>
            <p className="text-[10px] text-slate-500">hh:mm</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">Break</p>
            <p className="text-2xl font-bold text-white">{fmtDuty(totalBreakSec)}</p>
            <p className="text-[10px] text-slate-500">hh:mm</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">Active</p>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
            <p className="text-[10px] text-slate-500">open shifts</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">Per Page</p>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="text-2xl font-bold text-white bg-transparent focus:outline-none cursor-pointer appearance-none"
            >
              {[5, 8, 10, 20, 50].map(n => <option key={n} value={n} className="bg-slate-800 text-white">{n}</option>)}
            </select>
            <p className="text-[10px] text-slate-500">rows</p>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-xl overflow-hidden border border-slate-700/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800">
                <th onClick={() => handleSort('date')} className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3 cursor-pointer hover:text-white select-none">Date<SortArrow field="date" /></th>
                <th onClick={() => handleSort('company')} className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3 cursor-pointer hover:text-white select-none">Company<SortArrow field="company" /></th>
                <th className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3">Area</th>
                <th className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3">In</th>
                <th className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3">Out</th>
                <th className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3">Break</th>
                <th onClick={() => handleSort('duty')} className="text-left text-slate-300 text-[10px] uppercase tracking-[0.15em] font-bold px-4 py-3 cursor-pointer hover:text-white select-none">Duty<SortArrow field="duty" /></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-500 py-8">No attendance records yet. Check in from the Command Center to start tracking.</td></tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.id} className="border-t border-slate-200/10 hover:bg-slate-50/5 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-sm" style={{ color: '#475569' }}>{fmtDate(r.date)}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#475569' }}>{r.company}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#475569' }}>{r.area}</td>
                    <td className="px-4 py-3.5 text-sm font-medium" style={{ color: '#ca8a04' }}>{fmtTime(r.checkIn)}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: r.checkOut ? '#475569' : '#ef4444' }}>{r.checkOut ? fmtTime(r.checkOut) : '— (Active)'}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#475569' }}>{fmtBreak(r.breakSeconds)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold" style={{ color: '#ca8a04' }}>{fmtDuty(r.dutySeconds)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-slate-500 text-xs">
              Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, sorted.length)} of {sorted.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/60 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600/60 transition-colors cursor-pointer"
              >
                ← Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-blue-500 text-slate-900'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/60 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600/60 transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───── Time Card View ───── */
function TimeCardView() {
  // Build the pay period weeks starting from Mon Feb 16, 2026
  const buildWeeks = useCallback(() => {
    const weeks = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    // Week 1: Mon Feb 16 – Sun Feb 22
    const week1Start = new Date(2026, 1, 16)
    const week1 = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(week1Start)
      d.setDate(week1Start.getDate() + i)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const yyyy = d.getFullYear()
      week1.push({
        key: `w1-${i}`,
        label: `${dayNames[d.getDay()]} ${mm}/${dd}/${yyyy}`,
      })
    }
    weeks.push(week1)
    // Week 2: Mon Feb 23 – Sun Mar 01
    const week2Start = new Date(2026, 1, 23)
    const week2 = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(week2Start)
      d.setDate(week2Start.getDate() + i)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const yyyy = d.getFullYear()
      week2.push({
        key: `w2-${i}`,
        label: `${dayNames[d.getDay()]} ${mm}/${dd}/${yyyy}`,
      })
    }
    weeks.push(week2)
    return weeks
  }, [])

  const weeks = buildWeeks()

  // Time options for dropdowns
  const timeOptions = ['Did not work']
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h % 12 === 0 ? 12 : h % 12
      const ampm = h < 12 ? 'AM' : 'PM'
      timeOptions.push(`${hh}:${String(m).padStart(2, '0')} ${ampm}`)
    }
  }

  // State: each day row keyed by its key
  const initRow = () => ({ start: 'Did not work', end: 'Did not work', breakMin: 0, mandatory: 'Yes' })
  const allKeys = weeks.flat().map(d => d.key)
  const [rows, setRows] = useState(() => {
    const init = {}
    allKeys.forEach(k => { init[k] = initRow() })
    return init
  })

  const [comments, setComments] = useState('')
  const [signature, setSignature] = useState('')
  const [files, setFiles] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const updateRow = (key, field, value) => {
    setRows(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  // Compute total hours for a row
  const computeTotal = (row) => {
    if (row.start === 'Did not work' || row.end === 'Did not work') return '0.00'
    const parseTime = (str) => {
      const [time, ampm] = str.split(' ')
      let [h, m] = time.split(':').map(Number)
      if (ampm === 'PM' && h !== 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
      return h * 60 + m
    }
    let startMin = parseTime(row.start)
    let endMin = parseTime(row.end)
    if (endMin <= startMin) endMin += 24 * 60 // overnight shift
    let total = (endMin - startMin) / 60 - (row.breakMin / 60)
    if (total < 0) total = 0
    return total.toFixed(2)
  }

  return (
    <div className="space-y-0">
      {/* Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/90 border-b border-slate-700/60">
              <th className="text-left text-blue-400 text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3 w-[180px]">Day/Date</th>
              <th className="text-left text-blue-400 text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3">Start</th>
              <th className="text-left text-blue-400 text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3">End</th>
              <th className="text-center text-blue-400 text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3 w-[70px]">Break</th>
              <th className="text-center text-blue-400 text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3 w-[130px]">Mandatory</th>
              <th className="text-right text-blue-400 text-[11px] uppercase tracking-[0.12em] font-bold px-4 py-3 w-[80px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <React.Fragment key={`week-${wi}`}>
                {/* Week header */}
                <tr>
                  <td colSpan={6} className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/40">
                    <span className="text-white font-bold text-sm">Week {wi + 1}</span>
                  </td>
                </tr>
                {/* Day rows */}
                {week.map((day) => {
                  const row = rows[day.key]
                  return (
                    <tr key={day.key} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-300 font-medium text-sm whitespace-nowrap">{day.label}</td>
                      <td className="px-4 py-2">
                        <select
                          value={row.start}
                          onChange={(e) => updateRow(day.key, 'start', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/80 border border-slate-600/50 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                        >
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={row.end}
                          onChange={(e) => updateRow(day.key, 'end', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/80 border border-slate-600/50 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                        >
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={row.breakMin}
                          onChange={(e) => updateRow(day.key, 'breakMin', parseInt(e.target.value) || 0)}
                          className="w-14 px-2 py-2 rounded-lg bg-slate-700/80 border border-slate-600/50 text-white text-sm text-center focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`mandatory-${day.key}`}
                              checked={row.mandatory === 'Yes'}
                              onChange={() => updateRow(day.key, 'mandatory', 'Yes')}
                              className="w-3.5 h-3.5 accent-blue-500"
                            />
                            <span className="text-slate-300 text-xs">Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`mandatory-${day.key}`}
                              checked={row.mandatory === 'No'}
                              onChange={() => updateRow(day.key, 'mandatory', 'No')}
                              className="w-3.5 h-3.5 accent-blue-500"
                            />
                            <span className="text-slate-300 text-xs">No</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right text-white font-semibold text-sm">
                        {computeTotal(row)}
                      </td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
            {/* Grand Total Row */}
            <tfoot>
              <tr className="bg-slate-800/70 border-t border-slate-600/50">
                <td colSpan={4} />
                <td className="px-4 py-3 text-right text-white font-bold text-sm">Grand Total (hrs)</td>
                <td className="px-4 py-3 text-right text-white font-bold text-sm">
                  {(() => {
                    const total = Object.values(rows).reduce((sum, r) => sum + parseFloat(computeTotal(r)), 0)
                    return total.toFixed(2)
                  })()}
                </td>
              </tr>
            </tfoot>
          </tbody>
        </table>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <label className="block text-blue-400 text-sm font-medium mb-2">Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-y"
        />
      </div>

      {/* File Upload */}
      <div className="mt-6">
        <h3 className="text-white font-bold text-sm mb-3">Any Receipts or Patrol Sheets (images)</h3>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600/60 bg-slate-800/40 text-slate-300 text-sm cursor-pointer hover:border-blue-500/50 transition-colors">
          <span>Choose Files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="hidden"
          />
        </label>
        <span className="text-slate-500 text-sm ml-3">
          {files.length > 0 ? `${files.length} file(s) selected` : 'No file chosen'}
        </span>
      </div>

      {/* Disclaimer */}
      <div className="mt-8">
        <h3 className="text-white font-bold text-base mb-3">Disclaimer</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          By typing my name below, I certify that this timecard accurately represents the hours I have worked.
          A "Yes" in the break column confirms that I have taken all required breaks in compliance with labor
          laws and company policies. Please include this information in my upcoming payroll report.
        </p>
      </div>

      {/* Signature */}
      <div className="mt-6">
        <label className="block text-blue-400 text-sm font-medium mb-1">Type Your Name (Signature) *</label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Type your full name"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Submit Button */}
      <div className="mt-8 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={!signature.trim()}
          onClick={() => {
            setSubmitted(true)
            setTimeout(() => setSubmitted(false), 3000)
          }}
          className={`px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-[0.15em] transition-colors ${
            signature.trim()
              ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-lg'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          Submit Timecard
        </motion.button>
        {submitted && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-400 text-sm font-medium mt-3"
          >
            ✓ Timecard submitted successfully!
          </motion.p>
        )}
      </div>
    </div>
  )
}

/* ───── Day Off Request View ───── */
function DayOffView() {
  const [personnelId] = useState('Ayan Nath')
  const [assignedPost, setAssignedPost] = useState('')
  const [exemptionStart, setExemptionStart] = useState('')
  const [resumeDuty, setResumeDuty] = useState('')
  const [justification, setJustification] = useState('')
  const [digitalSignature, setDigitalSignature] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!exemptionStart) { alert('Please select exemption start date.'); return }
    if (!resumeDuty) { alert('Please select resume duty date.'); return }
    if (!justification.trim()) { alert('Please enter justification.'); return }
    if (!digitalSignature.trim()) { alert('Please enter digital signature.'); return }
    
    setLoading(true)
    try {
      await addDoc(collection(firestore, 'dayOffRequests'), {
        personnelId,
        assignedPost,
        exemptionStart,
        resumeDuty,
        justification,
        digitalSignature,
        status: 'pending',
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit day off request:', err)
      alert('Failed to submit. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Day off Request</h2>
        <p className="text-slate-400 text-sm mt-1">Formal request for post leave or shift modification.</p>
      </div>

      <div className="bg-slate-800/60 rounded-2xl p-8 border border-white/5">
        <div className="space-y-6">
          {/* Personnel ID & Assigned Post/Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Personnel ID</label>
              <input type="text" value={personnelId} disabled className="w-full px-4 py-3 rounded-xl bg-slate-700/40 border border-slate-600/40 text-slate-400 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Assigned Post/Zone</label>
              <input type="text" value={assignedPost} onChange={(e) => setAssignedPost(e.target.value)} placeholder="Site Identifier" className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>

          {/* Exemption Start & Resume Duty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Exemption Start</label>
              <input type="date" value={exemptionStart} onChange={(e) => setExemptionStart(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Resume Duty</label>
              <input type="date" value={resumeDuty} onChange={(e) => setResumeDuty(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>

          {/* Justification Brief */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Justification Brief</label>
            <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={5} placeholder="Enter justification for day off request..." className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
          </div>

          {/* Digital Signature */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Digital Signature (Legal Name)</label>
            <input type="text" value={digitalSignature} onChange={(e) => setDigitalSignature(e.target.value)} placeholder="Enter your legal name" className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors" />
          </div>

          {/* Submit Button */}
          <motion.button 
            whileHover={{ scale: submitted ? 1 : 1.02 }} 
            whileTap={{ scale: submitted ? 1 : 0.97 }} 
            onClick={handleSubmit}
            disabled={loading || submitted}
            className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
              submitted 
                ? 'bg-emerald-500 text-white cursor-default' 
                : loading 
                  ? 'bg-blue-400 text-slate-900 cursor-wait opacity-80' 
                  : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {submitted ? 'SUBMITTED' : loading ? 'Submitting...' : 'Request Send'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ───── Daily Activity Report View ───── */
function DailyActivityView() {
  const { user } = useAuth()
  const { addDailyReport } = useShift()
  const [dateTime, setDateTime] = useState('')
  const [companyArea, setCompanyArea] = useState('')
  const [report, setReport] = useState('')
  const [images, setImages] = useState([{ id: 1, file: null }])
  const [video, setVideo] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const addImageSlot = () => {
    if (images.length >= 10) return
    setImages(prev => [...prev, { id: Date.now(), file: null }])
  }

  const updateImage = (id, file) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, file } : img))
  }

  const locationNames = {
    'corporate-a': 'Corporate Tower A',
    'retail-b': 'Retail Center B',
    'residential-c': 'Residential Gate C',
    '1133-hope': '1133 S Hope St',
    'demo-company': 'demo company'
  }

  const handleSubmit = async () => {
    if (!report.trim()) { alert('Please write your report before submitting.'); return }
    setLoading(true)

    // Create report object
    const newReport = {
      id: Date.now(),
      guardName: user?.name || 'Guard',
      guardEmail: user?.email || '',
      dateTime: dateTime || new Date().toISOString(),
      location: locationNames[companyArea] || companyArea || 'demo company',
      report: report,
      submittedAt: new Date(),
      imageCount: images.filter(img => img.file).length,
    }

    // Save to global context (syncs to Firebase)
    addDailyReport(newReport)

    // Send to email API
    try {
      await fetch('http://localhost:5001/send-activity-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime, companyArea, report })
      })
    } catch (err) {
      console.error('Failed to send email:', err)
    }

    setSubmitted(true)
    setLoading(false)
  }

  const handleReset = () => {
    setDateTime('')
    setCompanyArea('')
    setReport('')
    setImages([{ id: 1, file: null }])
    setVideo(null)
    setSubmitted(false)
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-slate-800/70 rounded-2xl p-8 border border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Daily Activity Report</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Only list facts. Write all steps: complaining party, problem, action taken, and result.
          </p>
        </div>
        <div className="w-16 h-16 rounded-xl bg-slate-700/60 border border-slate-600/40 flex-shrink-0" />
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Row: Date & Time + Company/Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-blue-400 text-sm font-medium mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-blue-400 text-sm font-medium mb-2">Company / Area *</label>
            <select
              value={companyArea}
              onChange={(e) => setCompanyArea(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="">-- Select Location --</option>
              <option value="corporate-a">Corporate Tower A</option>
              <option value="retail-b">Retail Center B</option>
              <option value="residential-c">Residential Gate C</option>
              <option value="1133-hope">1133 S Hope St</option>
            </select>
          </div>
        </div>

        {/* Report textarea */}
        <div>
          <label className="block text-blue-400 text-sm font-medium mb-2">Write your report *</label>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-y"
          />
        </div>

        {/* Upload Images */}
        <div>
          <h3 className="text-white font-bold text-sm mb-3">Upload Images (Max 10)</h3>
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={img.id} className="flex items-center gap-3">
                <span className="text-blue-400 text-sm font-medium min-w-[60px]">Image {i + 1}</span>
                <label className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-600/60 bg-slate-800/40 text-slate-300 text-sm cursor-pointer hover:border-blue-500/50 transition-colors">
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateImage(img.id, e.target.files[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-500 text-sm">
                  {img.file ? img.file.name : 'No file chosen'}
                </span>
              </div>
            ))}
          </div>
          {images.length < 10 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={addImageSlot}
              className="mt-3 px-5 py-2.5 rounded-lg bg-slate-700 text-white text-xs font-bold uppercase tracking-[0.12em] hover:bg-slate-600 transition-colors cursor-pointer"
            >
              Add More Image
            </motion.button>
          )}
          <p className="text-blue-400 text-xs mt-2">
            Tip: Click "Add More Image" after choosing a file.
          </p>
        </div>

        {/* Upload Video */}
        <div>
          <label className="block text-blue-400 text-sm font-medium mb-2">Upload Video</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-600/60 bg-slate-800/40 text-slate-300 text-sm cursor-pointer hover:border-blue-500/50 transition-colors">
              <span>Choose File</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0] || null)}
                className="hidden"
              />
            </label>
            <span className="text-slate-500 text-sm">
              {video ? video.name : 'No file chosen'}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: submitted || loading ? 1 : 1.02 }}
            whileTap={{ scale: submitted || loading ? 1 : 0.97 }}
            onClick={submitted ? handleReset : handleSubmit}
            disabled={loading}
            className={`px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-[0.15em] transition-colors shadow-lg cursor-pointer ${
              submitted
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {loading ? 'Submitting...' : submitted ? 'SUBMITTED' : 'Submit Report'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ───── Condition Reports View ───── */
function ConditionReportsView() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const { user } = useAuth();
  const [form, setForm] = useState({
    date: new Date(),
    location: '',
    condition: '',
    report: '',
    images: [],
    status: 'Pending',
  });

  useEffect(() => {
    // realtime listener for condition reports
    const q = query(collection(firestore, 'conditionReports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(items);
    });
    return () => unsub();
  }, []);

  const openModal = (index = null) => {
    if (index !== null) {
      const r = reports[index];
      setForm({
        date: r.date ? new Date(r.date) : new Date(),
        location: r.location || '',
        condition: r.condition || '',
        report: r.report || '',
        images: r.images || [],
        status: r.status || 'Pending',
      });
      setEditIndex(index);
    } else {
      setForm({ date: new Date(), location: '', condition: '', report: '', images: [], status: 'Pending' });
      setEditIndex(null);
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setForm({ date: null, type: '', location: '', status: 'Pending' });
    setEditIndex(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e, idx) => {
    const files = Array.from(e.target.files);
    setForm((prev) => {
      const newImages = [...prev.images];
      if (idx !== undefined) {
        newImages[idx] = files[0];
      } else {
        newImages.push(...files);
      }
      return { ...prev, images: newImages.slice(0, 10) };
    });
  };
  const addMoreImage = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, null].slice(0, 10) }));
  };
  const removeImage = (idx) => {
    setForm((prev) => {
      const newImages = [...prev.images];
      newImages.splice(idx, 1);
      return { ...prev, images: newImages };
    });
  };
  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, date }));
  };

  const uploadImages = async (images) => {
    const uploaded = [];
    for (const img of images || []) {
      if (!img) continue;
      // already uploaded image (from Firestore): keep it
      if (typeof img === 'object' && img.url && img.path) {
        uploaded.push(img);
        continue;
      }
      // if it's a File object, upload to Storage
      if (img instanceof File) {
        const path = `conditionReports/${Date.now()}_${img.name}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, img);
        const url = await getDownloadURL(sRef);
        uploaded.push({ url, path });
        continue;
      }
      // if it's an object from Firestore containing url only
      if (typeof img === 'object' && img.url) {
        uploaded.push(img);
      }
    }
    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // upload any new File images and preserve existing ones
    const filesToUpload = (form.images || []).filter(i => i instanceof File);
    const existingImages = (form.images || []).filter(i => !(i instanceof File));
    const uploaded = await uploadImages([...existingImages, ...filesToUpload]);

    const payload = {
      date: form.date instanceof Date ? form.date.toISOString() : form.date,
      location: form.location,
      condition: form.condition,
      report: form.report,
      status: form.status || 'Pending',
      images: uploaded,
      createdBy: user?.email || user?.name || null,
      createdAt: serverTimestamp(),
    };

    try {
      if (editIndex !== null && reports[editIndex]?.id) {
        const id = reports[editIndex].id;
        await updateDoc(doc(firestore, 'conditionReports', id), payload);
      } else {
        await addDoc(collection(firestore, 'conditionReports'), payload);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save report', err);
    }
  };

  const handleDelete = async (index) => {
    const item = reports[index];
    if (!item) return;
    if (item.id) {
      // delete storage images (best-effort)
      try {
        if (item.images && item.images.length) {
          for (const img of item.images) {
            if (img.path) {
              await deleteObject(storageRef(storage, img.path)).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn('Error deleting storage files', err);
      }
      await deleteDoc(doc(firestore, 'conditionReports', item.id));
    } else {
      setReports((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Condition Reports</h2>
          <p className="text-slate-400 text-sm mt-1">Report property or safety conditions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 rounded-xl bg-blue-500 text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-blue-400 transition-colors"
          onClick={() => openModal()}
        >
          + New Report
        </motion.button>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-slate-400 text-xs uppercase tracking-wider font-semibold px-6 py-4">Date</th>
              <th className="text-left text-slate-400 text-xs uppercase tracking-wider font-semibold px-6 py-4">Condition</th>
              <th className="text-left text-slate-400 text-xs uppercase tracking-wider font-semibold px-6 py-4">Location</th>
              <th className="text-left text-slate-400 text-xs uppercase tracking-wider font-semibold px-6 py-4">Status</th>
              <th className="text-left text-slate-400 text-xs uppercase tracking-wider font-semibold px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="text-white px-6 py-4 font-medium">{r.date ? new Date(r.date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                <td className="text-slate-300 px-6 py-4">{r.condition}</td>
                <td className="text-slate-300 px-6 py-4">{r.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => openModal(i)} className="text-blue-400 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(i)} className="text-red-400 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-slate-900 rounded-3xl p-8 w-full max-w-2xl border border-white/10 space-y-6 shadow-2xl"
            >
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-2xl font-bold text-white">Condition Reports</h3>
                </div>
                <p className="text-slate-400 text-sm">Report broken items, alarms, hazards, or safety issues with photos.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date & Time</label>
                  <DatePicker
                    selected={form.date}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp"
                    placeholderText="Select date and time"
                    className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Condition <span className="text-red-500">*</span></label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="Broken Item">Broken Item</option>
                    <option value="Alarm">Alarm</option>
                    <option value="Hazard">Hazard</option>
                    <option value="Safety Issue">Safety Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Write your report <span className="text-red-500">*</span></label>
                  <textarea
                    name="report"
                    value={form.report}
                    onChange={handleChange}
                    placeholder="Describe the issue..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors min-h-[100px]"
                    required
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Upload Image (Max: 10)</label>
                {form.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageChange(e, idx)}
                      className="text-xs text-slate-300"
                    />
                    {img && img instanceof File && (
                      <span className="text-green-400 text-xs">{img.name}</span>
                    )}
                    {img && img.url && (
                      <a href={img.url} target="_blank" rel="noreferrer" className="text-green-400 text-xs">View</a>
                    )}
                    <button type="button" onClick={() => removeImage(idx)} className="text-red-400 text-xs hover:underline">Remove</button>
                  </div>
                ))}
                {form.images.length < 10 && (
                  <button type="button" onClick={addMoreImage} className="px-3 py-1 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-600 mt-2">Add More Image</button>
                )}
                <div className="text-xs text-slate-500 mt-1">Tip: Click "Add More Image" after choosing a file.</div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg bg-slate-600 text-white text-sm font-semibold hover:bg-slate-500 mr-2">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 text-slate-900 text-sm font-bold hover:bg-blue-400">Submit Condition Report</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───── Disciplinary Actions View ───── */
function DisciplinaryView() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    location: '',
    date: new Date(),
    complaint: '',
    explanation: '',
    signature: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, date }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setForm({
      name: user?.name || '',
      location: '',
      date: new Date(),
      complaint: '',
      explanation: '',
      signature: '',
    });
  };
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-3xl p-8 w-full max-w-2xl border border-white/10 space-y-6 shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-2xl font-bold text-white">Disciplinary Action Document</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              readOnly
              className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Site / Post"
              className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date-Time <span className="text-red-500">*</span></label>
            <DatePicker
              selected={form.date}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="Pp"
              placeholderText="Select date and time"
              className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Complaint <span className="text-red-500">*</span></label>
            <select
              name="complaint"
              value={form.complaint}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            >
              <option value="">Select</option>
              <option value="Attendance">Attendance</option>
              <option value="Conduct">Conduct</option>
              <option value="Performance">Performance</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Your Explanation <span className="text-red-500">*</span></label>
          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            placeholder="Write your explanation..."
            className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors min-h-[100px]"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Signature <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="signature"
            value={form.signature}
            onChange={handleChange}
            placeholder="Type your full name"
            className="w-full px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            required
          />
        </div>
        <div className="flex justify-end mt-6">
          <button type="submit" disabled={submitted} className={`px-6 py-2 rounded-lg text-sm font-bold  ${submitted ? 'bg-green-500 text-white' : 'bg-blue-500 text-slate-900 hover:bg-blue-400'}`}>
            {submitted ? 'Submitted' : 'Submit Disciplinary Document'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───── Reports View ───── */
function ReportsView({ onSelectReport }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <p className="text-slate-400 text-sm mt-1">Submit reports for your assigned location</p>
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        <button
          onClick={() => onSelectReport('firewatch')}
          className="w-full max-w-xs py-3 rounded-lg bg-blue-500 text-white font-semibold text-base hover:bg-blue-400 transition-colors cursor-pointer"
        >
          Fire Watch Report
        </button>
        <button
          onClick={() => onSelectReport('parkingviolation')}
          className="w-full max-w-xs py-3 rounded-lg bg-blue-500 text-white font-semibold text-base hover:bg-blue-400 transition-colors cursor-pointer"
        >
          Parking Violation Report
        </button>
      </div>
    </div>
  )
}

/* ───── Information Update View ───── */
function InfoUpdateView() {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    cellPhone: '',
    email: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    stateRegion: '',
    postalCode: '',
    country: '',
    uniformSize: '',
    availability: '',
    digitalSignature: ''
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.dateOfBirth) {
      setError('Full Name and Date of Birth are required.');
      return;
    }
    try {
      await addDoc(collection(firestore, 'personnelUpdates'), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit personnel update:', err);
      setError('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Personnel Record */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Personnel Record</h2>
        <p className="text-slate-400 text-sm mt-1">Your identification and professional history</p>
      </div>

      {/* Static Info Display */}
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Social Security</label>
            <p className="text-white text-sm">***</p>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Personnel ID</label>
            <p className="text-white text-sm">***</p>
          </div>
        </div>
        <div className="border-t border-white/5 pt-4">
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Service History & Bio</label>
          <p className="text-slate-400 text-sm italic">No service history provided.</p>
        </div>
      </div>

      {/* Update Personnel Record Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-2xl p-8 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
          <h3 className="text-white font-bold uppercase tracking-wider text-sm">Update Personnel Record</h3>
        </div>

        <div className="space-y-6">
          {/* Full Name & Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Type Name"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Cell Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Cell Phone</label>
              <input
                type="tel"
                value={formData.cellPhone}
                onChange={(e) => handleChange('cellPhone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-slate-700/30 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Address</label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                placeholder="Street Address"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors mb-3"
              />
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Address Line 2"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <input
                type="text"
                value={formData.stateRegion}
                onChange={(e) => handleChange('stateRegion', e.target.value)}
                placeholder="State/Region/Province"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="Postal / Zip Code"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Country"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Uniform Size & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Shirt/Uniform Size</label>
              <input
                type="text"
                value={formData.uniformSize}
                onChange={(e) => handleChange('uniformSize', e.target.value)}
                placeholder="Shirt Size and Jacket Size"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Availability</label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                placeholder="Example: Mon to Sat anytime or Mon-Wed"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Picture Upload */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Picture of Self (Recents) - Please take a pic that can be used with your applications</label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm cursor-pointer hover:bg-slate-600 transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPictureFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <span className="text-slate-400 text-sm">{pictureFile ? pictureFile.name : 'No file chosen'}</span>
            </div>
          </div>

          {/* ID Upload */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Copy of Competent ID - Please take a pic that can be used with your applications</label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm cursor-pointer hover:bg-slate-600 transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <span className="text-slate-400 text-sm">{idFile ? idFile.name : 'No file chosen'}</span>
            </div>
          </div>

          {/* Digital Signature */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Signature *</label>
            <input
              type="text"
              value={formData.digitalSignature}
              onChange={(e) => handleChange('digitalSignature', e.target.value)}
              placeholder="Type your full name"
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {error && <div className="text-red-500 font-semibold text-sm">{error}</div>}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: submitted ? 1 : 1.02 }}
            whileTap={{ scale: submitted ? 1 : 0.97 }}
            type="submit"
            disabled={submitted}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${
              submitted 
                ? 'bg-emerald-500 text-white cursor-default' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {submitted ? 'SUBMITTED' : 'Initiate Modification'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

/* ───── Notifications View ───── */
function NotificationsView() {
  const [notifications] = useState([
    { id: 1, title: 'Schedule Change', message: 'Your shift on Feb 20 has been updated to 8:00 AM - 4:00 PM.', time: '2 hours ago', read: false },
    { id: 2, title: 'New Policy Update', message: 'Please review the updated uniform policy effective March 1, 2026.', time: '1 day ago', read: false },
    { id: 3, title: 'Training Reminder', message: 'Mandatory CPR certification training scheduled for Feb 25.', time: '2 days ago', read: false },
    { id: 4, title: 'Pay Stub Available', message: 'Your pay stub for the period ending Feb 14 is now available.', time: '5 days ago', read: true },
    { id: 5, title: 'Holiday Notice', message: 'Office closed on Presidents Day, Monday Feb 16.', time: '1 week ago', read: true },
  ])

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-slate-400 text-sm mt-1">{notifications.filter(n => !n.read).length} unread notifications</p>
        </div>
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-sm font-bold">
          {notifications.filter(n => !n.read).length}
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl p-5 border transition-colors ${
              n.read
                ? 'bg-slate-800/40 border-white/5'
                : 'bg-slate-800/80 border-blue-500/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
                <h3 className="text-white font-semibold text-sm">{n.title}</h3>
              </div>
              <span className="text-slate-500 text-xs whitespace-nowrap ml-4">{n.time}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pl-4">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Profile Update View (Firebase synced) ───── */
/* ═══════════════════════════════════════════ */
function ProfileUpdateView() {
  const { user, updateUser } = useAuth()
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Firebase sync is handled centrally in AuthContext

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
        setPhotoFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!photoFile && !newPassword) {
      alert('Please select a photo or enter a new password.')
      return
    }
    setLoading(true)
    
    try {
      const userKey = user?.email?.replace(/[.#$[\]]/g, '_') || 'unknown'
      
      // Always compress the image to keep it small
      let photoToSave = user?.photoURL || null
      
      if (photoPreview) {
        // Compress all photos to small size
        const img = document.createElement('img')
        photoToSave = await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxSize = 100 // Very small for Firebase
            let width = img.width
            let height = img.height
            
            if (width > height && width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            } else if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
            
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/jpeg', 0.4)
            console.log('Compressed photo size:', compressed.length, 'bytes')
            resolve(compressed)
          }
          img.onerror = reject
          img.src = photoPreview
        })
      }
      
      console.log('Saving to Firebase...', userKey)
      await set(ref(db, `profiles/${userKey}`), {
        photoURL: photoToSave,
        userName: user?.name || 'Employee',
        email: user?.email || '',
        hasNewPassword: !!newPassword,
        updatedAt: new Date().toISOString()
      })
      console.log('Firebase save successful!')
      
      // Update local user state
      if (photoToSave) {
        updateUser({ photoURL: photoToSave })
        console.log('Local state updated!')
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Failed to update profile:', err)
      alert('Failed to save: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Profile Update</h2>
        <p className="text-slate-400 text-sm mt-1">Update your password and profile photo.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-2xl p-8 border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Photo */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Profile Photo</label>
            <div className="mb-4">
              {(photoPreview || user?.photoURL) ? (
                <img 
                  src={photoPreview || user?.photoURL} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-xl object-cover border-2 border-slate-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl font-bold">
                    {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'EM'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm cursor-pointer hover:bg-slate-600 transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <span className="text-slate-400 text-sm">{photoFile ? photoFile.name : 'No file chosen'}</span>
            </div>
            <p className="text-slate-500 text-xs mt-2">If you upload, it will replace current photo.</p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">New Password (Optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <p className="text-slate-500 text-xs mt-2">Min 8 characters. Leave blank if you don't want to change.</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: submitted || loading ? 1 : 1.02 }}
          whileTap={{ scale: submitted || loading ? 1 : 0.97 }}
          type={submitted ? 'button' : 'submit'}
          onClick={submitted ? () => {
            setSubmitted(false)
            setPhotoFile(null)
            setPhotoPreview(null)
            setNewPassword('')
          } : undefined}
          disabled={loading}
          className={`mt-8 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer ${
            submitted
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : loading
                ? 'bg-slate-600 text-slate-400 cursor-wait'
                : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          {loading ? 'Saving...' : submitted ? 'Saved! Click to Update Again' : 'Save Changes'}
        </motion.button>
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Main Employee Dashboard ───── */
/* ═══════════════════════════════════════════ */
export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('command');
  const [reportsOpen, setReportsOpen] = useState(false);

  // Get shift & attendance state from global context
  const { shiftState, shiftActions, attendanceRecords } = useShift();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'SG';

  // Sidebar navigation handler
  const handleSidebarSelect = (id) => {
    setActiveView(id);
    if (id === 'reports' || id === 'firewatch' || id === 'parkingviolation') {
      setReportsOpen(true);
    } else {
      setReportsOpen(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'profile': return <ProfileUpdateView />;
      case 'command': return <CommandCenterView shiftState={shiftState} shiftActions={shiftActions} userName={user?.name} />;
      case 'attendance': return <AttendanceView records={attendanceRecords} />;
      case 'timecard': return <TimeCardView />;
      case 'dayoff': return <DayOffView />;
      case 'daily': return <DailyActivityView />;
      case 'condition': return <ConditionReportsView />;
      case 'disciplinary': return <DisciplinaryView />;
      case 'reports': return <ReportsView onSelectReport={handleSidebarSelect} />;
      case 'firewatch':
        return <FireWatchReportView />;
      // Dedicated Fire Watch Report component
      function FireWatchReportView() {
        const { user } = useAuth();
        const [fwForm, setFwForm] = React.useState({
          floor: '',
          status: '',
          explanation: '',
        });
        const [fwSubmitted, setFwSubmitted] = React.useState(false);
        const [fwError, setFwError] = React.useState('');

        const handleFwChange = (e) => {
          const { name, value } = e.target;
          setFwForm((prev) => ({ ...prev, [name]: value }));
        };

        const handleFwSubmit = async (e) => {
          e.preventDefault();
          setFwError('');
          if (!fwForm.floor || !fwForm.status) {
            setFwError('Floor/Area and Status are required.');
            return;
          }
          try {
            await addDoc(collection(firestore, 'fireWatchReports'), {
              floor: fwForm.floor,
              status: fwForm.status,
              explanation: fwForm.explanation,
              submittedBy: user?.name || 'Guard',
              submittedAt: serverTimestamp()
            });
            setFwSubmitted(true);
          } catch (err) {
            console.error('Failed to submit fire watch report:', err);
            setFwError('Failed to submit. Please try again.');
          }
        };

        return (
          <div className="flex justify-center items-center min-h-[60vh]">
            <form onSubmit={handleFwSubmit} className="bg-slate-900 rounded-3xl p-8 w-full max-w-3xl border border-white/10 space-y-8 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-white">Fire Watch Report</h2>
                </div>
                <p className="text-slate-300 text-sm">Report any fire safety concerns or observations from your assigned location.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base text-slate-400 font-bold uppercase tracking-wider mb-1">Floor/Area <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="floor"
                    value={fwForm.floor}
                    onChange={handleFwChange}
                    placeholder="e.g., 1st Floor, 2nd Floor"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base text-slate-400 font-bold uppercase tracking-wider mb-1">Status <span className="text-red-500">*</span></label>
                  <select
                    name="status"
                    value={fwForm.status}
                    onChange={handleFwChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Clear">Clear</option>
                    <option value="Concern">Concern</option>
                    <option value="Hazard">Hazard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-base text-slate-400 font-bold uppercase tracking-wider mb-1">Explanation / Observations</label>
                <textarea
                  name="explanation"
                  value={fwForm.explanation}
                  onChange={handleFwChange}
                  placeholder="Please describe any observations or concerns..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors min-h-[100px]"
                />
              </div>
              {fwError && <div className="text-red-500 font-semibold text-sm">{fwError}</div>}
              <div className="flex justify-start mt-6">
                <button type="submit" disabled={fwSubmitted} className={`px-8 py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-colors ${fwSubmitted ? 'bg-emerald-500 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                  {fwSubmitted ? 'Submitted' : 'Submit Fire Watch Report'}
                </button>
              </div>
            </form>
          </div>
        );
      }
      case 'parkingviolation':
        return <ParkingViolationReportView />;
      case 'infoupdate': return <InfoUpdateView />;
      case 'notifications': return <NotificationsView />;
      default: return <CommandCenterView />;
    }
  };

  // Dedicated Parking Violation Report component
  function ParkingViolationReportView() {
    const { user } = useAuth();
    const [pvForm, setPvForm] = React.useState({
      location: '',
      status: '',
      explanation: '',
    });
    const [pvSubmitted, setPvSubmitted] = React.useState(false);
    const [pvError, setPvError] = React.useState('');

    const handlePvChange = (e) => {
      const { name, value } = e.target;
      setPvForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePvSubmit = async (e) => {
      e.preventDefault();
      setPvError('');
      if (!pvForm.location || !pvForm.status) {
        setPvError('Location and Status are required.');
        return;
      }
      try {
        await addDoc(collection(firestore, 'parkingViolationReports'), {
          location: pvForm.location,
          status: pvForm.status,
          explanation: pvForm.explanation,
          submittedBy: user?.name || 'Guard',
          submittedAt: serverTimestamp()
        });
        setPvSubmitted(true);
      } catch (err) {
        console.error('Failed to submit parking violation report:', err);
        setPvError('Failed to submit. Please try again.');
      }
    };

    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <form onSubmit={handlePvSubmit} className="bg-slate-900 rounded-3xl p-8 w-full max-w-3xl border border-white/10 space-y-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl font-bold text-white">Parking Violation Report</h2>
            </div>
            <p className="text-slate-300 text-sm">Report any parking violations or issues from your assigned location.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-base text-slate-400 font-bold uppercase tracking-wider mb-1">Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="location"
                value={pvForm.location}
                onChange={handlePvChange}
                placeholder="e.g., Lot A, Main Entrance"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-base text-slate-400 font-bold uppercase tracking-wider mb-1">Status <span className="text-red-500">*</span></label>
              <select
                name="status"
                value={pvForm.status}
                onChange={handlePvChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="">-- Select Status --</option>
                <option value="Violation">Violation</option>
                <option value="Warning">Warning</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-base text-slate-400 font-bold uppercase tracking-wider mb-1">Explanation / Observations</label>
            <textarea
              name="explanation"
              value={pvForm.explanation}
              onChange={handlePvChange}
              placeholder="Please describe the violation or issue..."
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-base focus:outline-none focus:border-blue-500/50 transition-colors min-h-[100px]"
            />
          </div>
          {pvError && <div className="text-red-500 font-semibold text-sm">{pvError}</div>}
          <div className="flex justify-start mt-6">
            <button type="submit" disabled={pvSubmitted} className={`px-8 py-3 rounded-xl font-bold text-base uppercase tracking-wider transition-colors ${pvSubmitted ? 'bg-emerald-500 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
              {pvSubmitted ? 'Submitted' : 'Submit Parking Violation Report'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="pt-20" />
      <div className="relative z-10 min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-6 flex">
        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-[260px] flex-shrink-0 py-4"
        >
          <div className="bg-slate-800/40 rounded-2xl border border-white/5 p-6 sticky top-24">
            {/* User Profile */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-700/60 border-2 border-slate-600/50 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xl font-bold">{initials}</span>
                )}
              </div>
              <h3 className="text-white font-bold text-base">{user?.name || 'Employee'}</h3>
              <span className="inline-block mt-2 px-3 py-1 rounded-md bg-blue-500/15 text-blue-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                Authorized Personnel
              </span>
            </div>
            {/* Nav Items (use Sidebar component) */}
            <Sidebar
              selected={activeView}
              onSelect={handleSidebarSelect}
              reportsDropdownOpen={reportsOpen}
              setReportsDropdownOpen={setReportsOpen}
            />
            {/* Terminate Session */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border-2 border-red-500/60 text-red-400 text-xs font-bold uppercase tracking-[0.15em] hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </motion.aside>
        {/* ── Main Content ── */}
        <main className="flex-1 py-4 pl-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
