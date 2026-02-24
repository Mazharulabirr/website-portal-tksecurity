import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { HiUserGroup, HiBriefcase, HiChartBar, HiCog, HiDocumentReport, HiShieldCheck, HiClipboardList, HiEye, HiMail, HiPhone, HiCalendar, HiLocationMarker, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HiChartBar },
  { id: 'jobapplications', label: 'Job Applications', icon: HiClipboardList },
  { id: 'staff', label: 'Staff Management', icon: HiUserGroup },
  { id: 'clients', label: 'Client Management', icon: HiBriefcase },
  { id: 'reports', label: 'All Reports', icon: HiDocumentReport },
  { id: 'compliance', label: 'Compliance', icon: HiShieldCheck },
  { id: 'settings', label: 'System Settings', icon: HiCog },
]

const quickLinks = [
  { icon: HiUserGroup, title: 'Staff Management', desc: 'Manage employees & schedules', color: 'from-indigo-600 to-indigo-400' },
  { icon: HiBriefcase, title: 'Client Management', desc: 'Clients, contracts & sites', color: 'from-cyan-600 to-cyan-400' },
  { icon: HiChartBar, title: 'Analytics', desc: 'Performance & revenue data', color: 'from-blue-600 to-blue-400' },
  { icon: HiDocumentReport, title: 'All Reports', desc: 'Daily, incident & audit logs', color: 'from-emerald-600 to-emerald-400' },
  { icon: HiShieldCheck, title: 'Compliance', desc: 'Licenses, trainings & audits', color: 'from-blue-600 to-blue-400' },
  { icon: HiCog, title: 'System Settings', desc: 'Roles, permissions & config', color: 'from-purple-600 to-purple-400' },
]

/* ═══════════════════════════════════════════ */
/* ───── Sidebar Component ───── */
/* ═══════════════════════════════════════════ */
function Sidebar({ selected, onSelect }) {
  return (
    <nav className="flex flex-col gap-2">
      {sidebarItems.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
            selected === item.id
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <item.icon className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Dashboard View ───── */
/* ═══════════════════════════════════════════ */
function DashboardView({ user }) {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Employees', value: '156', color: 'text-indigo-400', change: '+5 this month' },
          { label: 'Active Clients', value: '42', color: 'text-cyan-400', change: '+3 this month' },
          { label: 'Active Sites', value: '67', color: 'text-blue-400', change: '98% covered' },
          { label: 'Monthly Revenue', value: '$284K', color: 'text-emerald-400', change: '+12% vs last' },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-5 border border-white/5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-600 mt-1">{item.change}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quickLinks.map((link, i) => (
          <motion.div
            key={link.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
            className="group glass rounded-xl p-6 border border-white/5 hover:border-white/15 cursor-pointer transition-all duration-300"
          >
            <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
              <link.icon className="text-white text-xl" />
            </div>
            <h3 className="text-white font-semibold mb-1">{link.title}</h3>
            <p className="text-slate-500 text-xs">{link.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* System Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-white font-semibold mb-4">System Alerts</h3>
        <div className="space-y-3">
          {[
            { text: '3 employees require license renewal before March', time: 'Action needed', color: 'bg-blue-400' },
            { text: 'New client onboarding: Ford Construction — pending setup', time: 'Today', color: 'bg-blue-400' },
            { text: 'Monthly compliance audit completed — all passed', time: 'Yesterday', color: 'bg-emerald-400' },
            { text: 'Payroll processing scheduled for Feb 28', time: 'Upcoming', color: 'bg-indigo-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
              <span className="text-slate-300 text-sm flex-1">{item.text}</span>
              <span className="text-slate-600 text-xs whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Job Applications View ───── */
/* ═══════════════════════════════════════════ */
function JobApplicationsView() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const applicationsRef = ref(db, 'jobApplications')
    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const appsList = Object.entries(data).map(([id, app]) => ({
          id,
          ...app
        })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        setApplications(appsList)
      } else {
        setApplications([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full flex items-center gap-1"><HiCheckCircle /> Approved</span>
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full flex items-center gap-1"><HiXCircle /> Rejected</span>
      default:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1"><HiClock /> Pending</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Job Applications</h2>
            <p className="text-slate-400 text-sm mt-1">Review and manage security guard applications</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All ({applications.length})</option>
              <option value="pending">Pending ({applications.filter(a => a.status === 'pending').length})</option>
              <option value="approved">Approved ({applications.filter(a => a.status === 'approved').length})</option>
              <option value="rejected">Rejected ({applications.filter(a => a.status === 'rejected').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 text-center">
          <p className="text-3xl font-bold text-white">{applications.length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 text-center">
          <p className="text-3xl font-bold text-yellow-400">{applications.filter(a => a.status === 'pending').length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 text-center">
          <p className="text-3xl font-bold text-green-400">{applications.filter(a => a.status === 'approved').length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Approved</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 text-center">
          <p className="text-3xl font-bold text-red-400">{applications.filter(a => a.status === 'rejected').length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Rejected</p>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl p-12 border border-white/5 text-center">
          <HiClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/60 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {app.firstName} {app.lastName}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <HiMail className="text-slate-500" /> {app.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiPhone className="text-slate-500" /> {app.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiCalendar className="text-slate-500" /> {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiLocationMarker className="text-slate-500" /> {app.city}, {app.state}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded">
                      Shift: {app.preferredShift || 'Not specified'}
                    </span>
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">
                      Available: {app.availableStartDate ? new Date(app.availableStartDate).toLocaleDateString() : 'Not specified'}
                    </span>
                    {app.hasDriversLicense === 'Yes' && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                        Driver's License ✓
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <HiEye /> View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedApp.firstName} {selectedApp.lastName}</h3>
                  <p className="text-slate-400 text-sm">Applied on {new Date(selectedApp.submittedAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Status:</span>
                  {getStatusBadge(selectedApp.status)}
                </div>

                {/* Personal Info */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">Name:</span> <span className="text-white">{selectedApp.firstName} {selectedApp.lastName}</span></div>
                    <div><span className="text-slate-500">DOB:</span> <span className="text-white">{selectedApp.dob}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="text-white">{selectedApp.email}</span></div>
                    <div><span className="text-slate-500">Phone:</span> <span className="text-white">{selectedApp.phone}</span></div>
                    <div className="col-span-2"><span className="text-slate-500">Address:</span> <span className="text-white">{selectedApp.streetAddress}, {selectedApp.city}, {selectedApp.state} {selectedApp.zipCode}</span></div>
                  </div>
                </div>

                {/* Position Info */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Position Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">Available Start:</span> <span className="text-white">{selectedApp.availableStartDate}</span></div>
                    <div><span className="text-slate-500">Preferred Shift:</span> <span className="text-white">{selectedApp.preferredShift}</span></div>
                  </div>
                </div>

                {/* Employment History */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Employment History</h4>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-indigo-400 font-medium">Current/Recent Employer</p>
                      <p className="text-white">{selectedApp.currentEmployerName || 'N/A'} - {selectedApp.currentJobTitle || 'N/A'}</p>
                      <p className="text-slate-500">{selectedApp.currentEmploymentStartDate} to {selectedApp.currentEmploymentEndDate || 'Present'}</p>
                      {selectedApp.currentReasonForLeaving && <p className="text-slate-400">Reason: {selectedApp.currentReasonForLeaving}</p>}
                    </div>
                    {selectedApp.previousEmployerName && (
                      <div>
                        <p className="text-indigo-400 font-medium">Previous Employer</p>
                        <p className="text-white">{selectedApp.previousEmployerName} - {selectedApp.previousJobTitle}</p>
                        <p className="text-slate-500">{selectedApp.previousEmploymentStartDate} to {selectedApp.previousEmploymentEndDate}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Qualifications</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500">Security Certifications:</span> <span className="text-white">{selectedApp.hasSecurityCertifications}</span></div>
                    <div><span className="text-slate-500">Driver's License:</span> <span className="text-white">{selectedApp.hasDriversLicense}</span></div>
                    <div><span className="text-slate-500">Background Check:</span> <span className="text-white">{selectedApp.willingToBackgroundCheck}</span></div>
                    {selectedApp.certifications?.length > 0 && (
                      <div className="col-span-2"><span className="text-slate-500">Certifications:</span> <span className="text-white">{selectedApp.certifications.join(', ')}</span></div>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Availability</h4>
                  <div className="text-sm">
                    <div className="mb-2"><span className="text-slate-500">Days Available:</span> <span className="text-white">{selectedApp.daysAvailable?.join(', ') || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Hours:</span> <span className="text-white">{selectedApp.availableHours || 'N/A'}</span></div>
                  </div>
                </div>

                {/* References */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">References</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-indigo-400 font-medium">Reference #1</p>
                      <p className="text-white">{selectedApp.reference1Name}</p>
                      <p className="text-slate-400">{selectedApp.reference1Relationship}</p>
                      <p className="text-slate-500">{selectedApp.reference1Phone} | {selectedApp.reference1Email}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Reference #2</p>
                      <p className="text-white">{selectedApp.reference2Name}</p>
                      <p className="text-slate-400">{selectedApp.reference2Relationship}</p>
                      <p className="text-slate-500">{selectedApp.reference2Phone} | {selectedApp.reference2Email}</p>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Background Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-500">Convicted of Crime:</span> <span className="text-white">{selectedApp.convictedOfCrime}</span></div>
                    {selectedApp.crimeExplanation && <div><span className="text-slate-500">Explanation:</span> <span className="text-white">{selectedApp.crimeExplanation}</span></div>}
                    <div><span className="text-slate-500">Military/Law Enforcement:</span> <span className="text-white">{selectedApp.hasMilitaryExperience}</span></div>
                    {selectedApp.militaryDetails && <div><span className="text-slate-500">Details:</span> <span className="text-white">{selectedApp.militaryDetails}</span></div>}
                  </div>
                </div>

                {/* Additional Info */}
                {(selectedApp.whyInterestedInPosition || selectedApp.additionalNotes) && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h4 className="text-white font-semibold mb-3">Additional Information</h4>
                    {selectedApp.whyInterestedInPosition && (
                      <div className="mb-3">
                        <p className="text-slate-500 text-sm">Why interested:</p>
                        <p className="text-white text-sm">{selectedApp.whyInterestedInPosition}</p>
                      </div>
                    )}
                    {selectedApp.additionalNotes && (
                      <div>
                        <p className="text-slate-500 text-sm">Additional Notes:</p>
                        <p className="text-white text-sm">{selectedApp.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Signature */}
                {selectedApp.signature && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <h4 className="text-white font-semibold mb-3">Signature</h4>
                    <img src={selectedApp.signature} alt="Signature" className="max-h-20 bg-white rounded p-2" />
                    <p className="text-slate-400 text-sm mt-2">{selectedApp.signatureName} - {selectedApp.signatureDate}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Placeholder Views ───── */
/* ═══════════════════════════════════════════ */
function PlaceholderView({ title, description }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 text-sm mt-1">{description}</p>
      </div>
      <div className="bg-slate-800/60 rounded-2xl p-12 border border-white/5 text-center">
        <p className="text-slate-500">Coming soon...</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Main Admin Dashboard ───── */
/* ═══════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView user={user} />
      case 'jobapplications': return <JobApplicationsView />
      case 'staff': return <PlaceholderView title="Staff Management" description="Manage employees & schedules" />
      case 'clients': return <PlaceholderView title="Client Management" description="Clients, contracts & sites" />
      case 'reports': return <PlaceholderView title="All Reports" description="Daily, incident & audit logs" />
      case 'compliance': return <PlaceholderView title="Compliance" description="Licenses, trainings & audits" />
      case 'settings': return <PlaceholderView title="System Settings" description="Roles, permissions & config" />
      default: return <DashboardView user={user} />
    }
  }

  return (
    <>
      <div className="pt-20" />

      <section className="relative z-10 min-h-[90vh]">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[140px]" />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="glass rounded-2xl p-5 border border-white/5 sticky top-28">
                {/* Profile */}
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-700/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                    <p className="text-indigo-400 text-xs">Super Admin</p>
                  </div>
                </div>

                {/* Navigation */}
                <Sidebar selected={activeView} onSelect={setActiveView} />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <FiLogOut />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user?.name}</p>
                    <p className="text-indigo-400 text-xs">Super Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400"
                >
                  {sidebarOpen ? <FiX /> : <FiMenu />}
                </button>
              </div>

              {/* Mobile Menu */}
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <Sidebar selected={activeView} onSelect={(id) => { setActiveView(id); setSidebarOpen(false); }} />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <FiLogOut />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 lg:pt-0 pt-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </section>
    </>
  )
}
