import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useShift } from '../context/ShiftContext'
import { ref, set, push, onValue } from 'firebase/database'
import { db } from '../firebase'
import { FiLogOut } from 'react-icons/fi'

const sidebarItems = [
  { id: 'profile', label: 'Profile Update' },
  { id: 'contact', label: 'Contact' },
  { id: 'activeguard', label: 'Active Guard' },
  { id: 'guards', label: 'Guards' },
  { id: 'reports', label: 'Reports' },
  { id: 'guardrequest', label: 'Additional Guard Request' },
  { id: 'complaints', label: 'Complaints' },
]

/* ───── Sidebar Component ───── */
function Sidebar({ selected, onSelect }) {
  return (
    <nav className="flex flex-col gap-2">
      {sidebarItems.map(item => (
        <div key={item.id}>
          <button
            className={`w-full flex items-center gap-3 px-6 py-2.5 rounded-xl text-left font-semibold transition-colors ${selected === item.id ? 'bg-slate-800 text-[#ffb32c]' : 'text-slate-300 hover:bg-slate-800/60'}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="flex items-center gap-3">
              {item.label}
            </span>
          </button>
        </div>
      ))}
    </nav>
  );
}

/* ───── Profile Update View ───── */
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
      // Simple approach - just read the file directly
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
        // Compress all photos to small size for Firebase
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
      // Save to Firebase Realtime Database
      await set(ref(db, `profiles/${userKey}`), {
        photoURL: photoToSave,
        userName: user?.name || 'Client',
        email: user?.email || '',
        hasNewPassword: !!newPassword,
        updatedAt: new Date().toISOString()
      })
      console.log('Firebase save successful!')
      
      // Update local user state with new photo
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
            {/* Photo Preview */}
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
                    {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CL'}
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
          {loading ? 'Saving...' : submitted ? 'PROFILE UPDATED' : 'Save Profile'}
        </motion.button>
      </form>
    </div>
  )
}

/* ───── Contact View ───── */
function ContactView() {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setLoading(true)
    try {
      await addDoc(collection(firestore, 'contactMessages'), {
        subject: form.subject,
        message: form.message,
        submittedAt: serverTimestamp()
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send. Please try again.')
    }
    setLoading(false)
  }

  const handleReset = () => {
    setForm({ subject: '', message: '' })
    setSubmitted(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Contact Help Center</h2>
        <p className="text-slate-400 text-sm mt-1">Call or message the help center, or send a message to Admin/Super Admin.</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Call Help Center */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-base mb-1">Call Help Center</h3>
          <p className="text-slate-400 text-xs mb-3">Speak directly with our team</p>
          <a href="tel:+18187075382" className="text-blue-400 font-bold text-lg hover:underline">+(818) 707-5382</a>
        </div>

        {/* Send Text Message */}
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-base mb-1">Send Text Message</h3>
          <p className="text-slate-400 text-xs mb-3">Quick message to our support team</p>
          <a href="sms:+18187075382" className="text-green-400 font-bold text-lg hover:underline">+(818) 707-5382</a>
        </div>
      </div>

      {/* Message Form */}
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Subject *</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Example: Please assign my access"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/60"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              placeholder="Write your message..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/60"
            />
          </div>

          {/* Submit Button */}
          <button
            type={submitted ? 'button' : 'submit'}
            onClick={submitted ? handleReset : undefined}
            disabled={loading}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer ${
              submitted
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {loading ? 'Sending...' : submitted ? 'MESSAGE SENT' : 'SEND MESSAGE'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ───── Active Guard View ───── */
function ActiveGuardView() {
  const { activeGuards } = useShift()

  const formatTime = (date) => {
    if (!date) return '—'
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Active Guard</h2>
        <p className="text-slate-400 text-sm mt-1">Currently active guards at your location.</p>
      </div>

      {activeGuards.length === 0 ? (
        <div className="bg-slate-800/60 rounded-2xl p-8 border border-white/5 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/60 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No Active Guards</p>
          <p className="text-slate-500 text-sm mt-1">Guards will appear here when they check in.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeGuards.map((guard) => (
            <div key={guard.id} className="bg-slate-800/60 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-4">
                {/* Guard Avatar */}
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                  <span className="text-emerald-400 text-lg font-bold">
                    {guard.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GD'}
                  </span>
                </div>
                {/* Guard Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg">{guard.name || 'Guard'}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{guard.post || 'Assigned Post'}</p>
                </div>
                {/* Check-in Time */}
                <div className="text-right">
                  <p className="text-slate-500 text-xs uppercase tracking-wider">Checked In</p>
                  <p className="text-amber-400 font-bold text-sm">{formatTime(guard.checkInTime)}</p>
                  <p className="text-slate-500 text-xs">{formatDate(guard.checkInTime)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───── Guards View ───── */
function GuardsView() {
  // Demo guards data
  const guards = [
    {
      id: 1,
      name: 'Mazharul islam',
      company: 'demo company',
      email: 'mazharulabir241@gmail.com',
      assignedDate: '2026-02-07 04:46:15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Ariful islam',
      company: 'demo company',
      email: 'mail961r@gmail.com',
      assignedDate: '2026-01-31 16:22:08',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mazharul islam',
      company: 'demo company',
      email: 'mazharulabir241@gmail.com',
      assignedDate: '2026-01-31 08:28:07',
      status: 'active'
    }
  ]

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'SG'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Guards</h2>
        <p className="text-slate-400 text-sm mt-1">All assigned guard history and details.</p>
      </div>

      {/* Guards List */}
      <div className="space-y-4">
        {guards.map((guard) => (
          <div key={guard.id} className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <span className="text-slate-500 text-sm font-bold">{getInitials(guard.name)}</span>
            </div>

            {/* Guard Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 font-bold text-base">{guard.name}</h3>
              <p className="text-amber-500 text-xs font-medium">{guard.company}</p>
              <p className="text-slate-500 text-xs">Email: {guard.email}</p>
              <p className="text-slate-400 text-xs mt-1">Assigned: <span className="text-blue-500">{guard.assignedDate}</span></p>
            </div>

            {/* Status Badge */}
            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───── Reports View ───── */
function ReportsView() {
  const { dailyReports } = useShift()
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 10

  const totalPages = Math.ceil(dailyReports.length / reportsPerPage)
  const startIndex = (currentPage - 1) * reportsPerPage
  const currentReports = dailyReports.slice(startIndex, startIndex + reportsPerPage)

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).replace(',', '')
  }

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'SG'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Guard Activity Reports</h2>
        <p className="text-slate-400 text-sm mt-1">View Daily Activity Reports submitted by your assigned guards.</p>
      </div>

      {/* Reports List */}
      {dailyReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <p className="text-slate-500">No reports submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentReports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                    <span className="text-white text-sm font-bold">{getInitials(report.guardName)}</span>
                  </div>
                </div>

                {/* Report Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-slate-900 font-bold text-base">
                        {report.guardName} <span className="text-slate-400 font-normal text-sm">#{report.id?.toString().slice(-3) || '000'}</span>
                      </h3>
                      <p className="text-slate-500 text-xs">{formatDateTime(report.dateTime)}</p>
                      <p className="text-slate-500 text-xs">Employee: {report.guardName}</p>
                      <p className="text-slate-500 text-xs">Location: <span className="text-amber-500 font-medium">{report.location}</span></p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                      submitted
                    </span>
                  </div>

                  {/* Report Text */}
                  <p className="text-slate-600 text-sm mt-3 line-clamp-3">{report.report}</p>

                  {/* Details Button */}
                  <button className="mt-3 px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors cursor-pointer">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <span className="text-slate-600 text-sm">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

/* ───── Additional Guard Request View ───── */
function GuardRequestView() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    propertyName: '',
    propertyAddress: '',
    guardsRequired: '',
    numberOfHours: '',
    reportingTime: '',
    requestDetails: '',
    signature: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.propertyName || !form.propertyAddress || !form.guardsRequired || !form.numberOfHours || !form.reportingTime || !form.signature) {
      alert('Please fill all required fields.')
      return
    }
    setLoading(true)
    try {
      await set(ref(db, `guardRequests/${Date.now()}`), {
        ...form,
        requestedBy: user?.name || 'Client',
        requestedByEmail: user?.email || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit guard request:', err)
      alert('Failed to submit. Please try again.')
    }
    setLoading(false)
  }

  const handleReset = () => {
    setForm({
      propertyName: '',
      propertyAddress: '',
      guardsRequired: '',
      numberOfHours: '',
      reportingTime: '',
      requestDetails: '',
      signature: ''
    })
    setSubmitted(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Additional Guard Request</h2>
        <p className="text-slate-400 text-sm mt-1">Send a request to Admin / Super Admin for additional guard deployment.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-2xl p-8 border border-white/5">
        <div className="space-y-6">
          {/* Property Name */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Property Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.propertyName}
              onChange={(e) => handleChange('propertyName', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Property Address <span className="text-red-500">*</span></label>
            <textarea
              value={form.propertyAddress}
              onChange={(e) => handleChange('propertyAddress', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              required
            />
          </div>

          {/* Number of Guards & Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Number of Guards Required <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={form.guardsRequired}
                onChange={(e) => handleChange('guardsRequired', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Number of Hours <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={form.numberOfHours}
                onChange={(e) => handleChange('numberOfHours', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                required
              />
            </div>
          </div>

          {/* Reporting Time */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Reporting Time <span className="text-red-500">*</span></label>
            <input
              type="time"
              value={form.reportingTime}
              onChange={(e) => handleChange('reportingTime', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>

          {/* Request Details */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Request Details <span className="text-red-500">*</span></label>
            <textarea
              value={form.requestDetails}
              onChange={(e) => handleChange('requestDetails', e.target.value)}
              rows={4}
              placeholder="Briefly explain your request..."
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          {/* Signature */}
          <div>
            <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Signature (Full Name) <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.signature}
              onChange={(e) => handleChange('signature', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: submitted || loading ? 1 : 1.02 }}
              whileTap={{ scale: submitted || loading ? 1 : 0.97 }}
              type={submitted ? 'button' : 'submit'}
              onClick={submitted ? handleReset : undefined}
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer ${
                submitted
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : loading
                    ? 'bg-slate-600 text-slate-400 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {loading ? 'Submitting...' : submitted ? 'Submitted! Click to Send Another' : 'Send Request'}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}

/* ───── Complaints View ───── */
function ComplaintsView() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    company: '',
    area: '',
    complaint: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const companies = [
    'ABC Corporation',
    'XYZ Industries',
    'Global Tech Solutions',
    'Metro Properties',
    'Sunrise Ventures',
    'Prime Security Services'
  ]

  const areas = [
    'All / Not specified',
    'Main Gate',
    'Parking Area',
    'Building Entrance',
    'Reception',
    'Warehouse',
    'Office Floor',
    'Perimeter'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.company || !formData.complaint) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const complaintData = {
        ...formData,
        clientEmail: user?.email || '',
        clientName: user?.name || '',
        submittedAt: new Date().toISOString(),
        status: 'pending'
      }
      
      const newComplaintRef = push(ref(db, 'complaints'))
      await set(newComplaintRef, complaintData)
      
      setSubmitSuccess(true)
      setFormData({ company: '', area: '', complaint: '' })
      
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      console.error('Error submitting complaint:', error)
      alert('Failed to submit complaint. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
        <h2 className="text-2xl font-bold text-white">Complaints</h2>
        <p className="text-slate-400 text-sm mt-1">Report issues to Admin with details.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-2xl p-8 border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Company */}
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">
              Company <span className="text-red-400">*</span>
            </label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            >
              <option value="">-- Select Company --</option>
              {companies.map((company, idx) => (
                <option key={idx} value={company}>{company}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">
              Area (Optional)
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All / Not specified</option>
              {areas.slice(1).map((area, idx) => (
                <option key={idx} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Complaint */}
        <div className="mb-6">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">
            Complaint <span className="text-red-400">*</span>
          </label>
          <textarea
            name="complaint"
            value={formData.complaint}
            onChange={handleChange}
            placeholder="Write the complaint clearly (facts + dates + guard name if applicable)."
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600/40 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || submitSuccess}
          className={`px-8 py-3 ${submitSuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Submitting...' : submitSuccess ? 'Submitted' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ───── Main Client Dashboard ───── */
/* ═══════════════════════════════════════════ */
export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('profile')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'CL'

  const renderView = () => {
    switch (activeView) {
      case 'profile': return <ProfileUpdateView />
      case 'contact': return <ContactView />
      case 'activeguard': return <ActiveGuardView />
      case 'guards': return <GuardsView />
      case 'reports': return <ReportsView />
      case 'guardrequest': return <GuardRequestView />
      case 'complaints': return <ComplaintsView />
      default: return <ProfileUpdateView />
    }
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
              <h3 className="text-white font-bold text-base">{user?.name || 'Client'}</h3>
              <span className="inline-block mt-2 px-3 py-1 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                Demo Company
              </span>
            </div>
            {/* Nav Items */}
            <Sidebar
              selected={activeView}
              onSelect={setActiveView}
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
  )
}
