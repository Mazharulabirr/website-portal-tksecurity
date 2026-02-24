import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ref, push, set } from 'firebase/database'
import { db } from '../firebase'
import { FiUpload, FiCheck } from 'react-icons/fi'

export default function JobApplicationPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    email: '',
    streetAddress: '',
    streetAddress2: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Position Information
    availableStartDate: '',
    preferredShift: '',
    
    // Employment History - Current
    currentEmployerName: '',
    currentJobTitle: '',
    currentEmploymentStartDate: '',
    currentEmploymentEndDate: '',
    currentReasonForLeaving: '',
    currentResponsibility1: '',
    currentResponsibility1Desc: '',
    currentResponsibility2: '',
    currentResponsibility2Desc: '',
    
    // Employment History - Previous
    previousEmployerName: '',
    previousJobTitle: '',
    previousEmploymentStartDate: '',
    previousEmploymentEndDate: '',
    previousReasonForLeaving: '',
    previousResponsibility1: '',
    previousResponsibility1Desc: '',
    previousResponsibility2: '',
    previousResponsibility2Desc: '',
    
    // Qualifications
    hasSecurityCertifications: '',
    certifications: [],
    hasDriversLicense: '',
    willingToBackgroundCheck: '',
    
    // Skills
    relevantSkills: '',
    technicalSkills: '',
    
    // Physical Requirements
    canStandExtended: '',
    comfortableHighStress: '',
    
    // Availability
    daysAvailable: [],
    availableHours: '',
    
    // References
    reference1Name: '',
    reference1Relationship: '',
    reference1Phone: '',
    reference1Email: '',
    reference2Name: '',
    reference2Relationship: '',
    reference2Phone: '',
    reference2Email: '',
    
    // Background Information
    convictedOfCrime: '',
    crimeExplanation: '',
    hasMilitaryExperience: '',
    militaryDetails: '',
    
    // Additional Information
    whyInterestedInPosition: '',
    additionalNotes: '',
    
    // Signature
    signatureName: '',
    signatureDate: ''
  })

  const [uploadedFile, setUploadedFile] = useState(null)
  const [signature, setSignature] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const signatureRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'daysAvailable' || name === 'certifications') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedFile({
          name: file.name,
          data: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignature(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const applicationData = {
        ...formData,
        uploadedFile: uploadedFile?.data || null,
        signature: signature || null,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      }

      const newApplicationRef = push(ref(db, 'jobApplications'))
      await set(newApplicationRef, applicationData)

      setSubmitSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/40 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
  const labelClass = "text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block"
  const sectionClass = "bg-slate-800/60 rounded-2xl p-6 md:p-8 border border-white/5"

  if (submitSuccess) {
    return (
      <>
        <div className="pt-24" />
        <section className="relative py-16 z-10 min-h-[70vh] flex items-center">
          <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px]" />
          <div className="max-w-2xl mx-auto text-center px-4 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
            >
              <FiCheck className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-4">Application Submitted!</h1>
            <p className="text-slate-400 mb-8">Thank you for applying. We will review your application and contact you soon.</p>
            <a href="/" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25">
              Return to Home
            </a>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <div className="pt-24" />
      <section className="relative py-12 z-10 min-h-screen">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px]" />
        
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/40 rounded-2xl p-8 text-center mb-6 border border-white/5"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white font-bold text-xl">TK</span>
              </div>
              <span className="text-blue-400 font-bold text-lg">TK Security Service</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Security Guard Job Application</h1>
            <p className="text-slate-400 mt-2 text-sm">Please complete this form to apply for a security guard position.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className={inputClass} required />
                  </div>
                  <div>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className={inputClass} required />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Date of Birth <span className="text-red-400">*</span></label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(000) 000-0000" className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@example.com" className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Address <span className="text-red-400">*</span></label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} placeholder="Street Address" className={`${inputClass} mb-2`} required />
                <input type="text" name="streetAddress2" value={formData.streetAddress2} onChange={handleChange} placeholder="Street Address Line 2" className={`${inputClass} mb-2`} />
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className={inputClass} required />
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State / Province" className={inputClass} required />
                </div>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Postal / Zip Code" className={inputClass} required />
              </div>
            </div>
          </div>

          {/* Position Information */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Position Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Available Start Date <span className="text-red-400">*</span></label>
                <input type="date" name="availableStartDate" value={formData.availableStartDate} onChange={handleChange} className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Preferred Shift <span className="text-red-400">*</span></label>
                <div className="space-y-2 mt-2">
                  {['Day', 'Night', 'Flexible'].map(shift => (
                    <label key={shift} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="preferredShift" value={shift} checked={formData.preferredShift === shift} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-300">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Employment History */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Employment History</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Current/Most Recent Employer Name <span className="text-red-400">*</span></label>
                <input type="text" name="currentEmployerName" value={formData.currentEmployerName} onChange={handleChange} placeholder="Type your answer" className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
                <input type="text" name="currentJobTitle" value={formData.currentJobTitle} onChange={handleChange} className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Employment Start Date <span className="text-red-400">*</span></label>
                <input type="date" name="currentEmploymentStartDate" value={formData.currentEmploymentStartDate} onChange={handleChange} className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Employment End Date</label>
                <input type="date" name="currentEmploymentEndDate" value={formData.currentEmploymentEndDate} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Reason for Leaving</label>
                <input type="text" name="currentReasonForLeaving" value={formData.currentReasonForLeaving} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Key Responsibilities</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="currentResponsibility1" value={formData.currentResponsibility1} onChange={handleChange} placeholder="Responsibility" className={inputClass} />
                  <input type="text" name="currentResponsibility1Desc" value={formData.currentResponsibility1Desc} onChange={handleChange} placeholder="Description" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input type="text" name="currentResponsibility2" value={formData.currentResponsibility2} onChange={handleChange} placeholder="Responsibility" className={inputClass} />
                  <input type="text" name="currentResponsibility2Desc" value={formData.currentResponsibility2Desc} onChange={handleChange} placeholder="Description" className={inputClass} />
                </div>
              </div>

              <hr className="my-6 border-slate-700" />

              <div>
                <label className={labelClass}>Previous Employer Name <span className="text-red-400">*</span></label>
                <input type="text" name="previousEmployerName" value={formData.previousEmployerName} onChange={handleChange} placeholder="Type your answer" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
                <input type="text" name="previousJobTitle" value={formData.previousJobTitle} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Employment Start Date <span className="text-red-400">*</span></label>
                <input type="date" name="previousEmploymentStartDate" value={formData.previousEmploymentStartDate} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Employment End Date <span className="text-red-400">*</span></label>
                <input type="date" name="previousEmploymentEndDate" value={formData.previousEmploymentEndDate} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Reason for Leaving</label>
                <input type="text" name="previousReasonForLeaving" value={formData.previousReasonForLeaving} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Key Responsibilities</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="previousResponsibility1" value={formData.previousResponsibility1} onChange={handleChange} placeholder="Responsibility" className={inputClass} />
                  <input type="text" name="previousResponsibility1Desc" value={formData.previousResponsibility1Desc} onChange={handleChange} placeholder="Description" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input type="text" name="previousResponsibility2" value={formData.previousResponsibility2} onChange={handleChange} placeholder="Responsibility" className={inputClass} />
                  <input type="text" name="previousResponsibility2Desc" value={formData.previousResponsibility2Desc} onChange={handleChange} placeholder="Description" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Qualifications and Certifications */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Qualifications and Certifications</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Do you hold any security-related certifications or licenses? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasSecurityCertifications" value="Yes" checked={formData.hasSecurityCertifications === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasSecurityCertifications" value="No" checked={formData.hasSecurityCertifications === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>

              {formData.hasSecurityCertifications === 'Yes' && (
                <div>
                  <label className={labelClass}>If yes, please choose below: <span className="text-red-400">*</span></label>
                  <div className="space-y-2 mt-2">
                    {['Security Guard License', 'CPR/First Aid', 'Defensive Tactics', 'Other'].map(cert => (
                      <label key={cert} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="certifications" value={cert} checked={formData.certifications.includes(cert)} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-slate-300">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Do you have a valid driver's license? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasDriversLicense" value="Yes" checked={formData.hasDriversLicense === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasDriversLicense" value="No" checked={formData.hasDriversLicense === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Are you willing to undergo a background check? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="willingToBackgroundCheck" value="Yes" checked={formData.willingToBackgroundCheck === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="willingToBackgroundCheck" value="No" checked={formData.willingToBackgroundCheck === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Skills</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Relevant Skills</label>
                <textarea name="relevantSkills" value={formData.relevantSkills} onChange={handleChange} rows={4} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Technical Skills</label>
                <textarea name="technicalSkills" value={formData.technicalSkills} onChange={handleChange} rows={4} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Physical Requirements */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Physical Requirements</h2>
            <p className="text-slate-500 text-sm mb-4">Please indicate your ability to meet the physical demands of this role.</p>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Are you able to stand and patrol for extended periods? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="canStandExtended" value="Yes" checked={formData.canStandExtended === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="canStandExtended" value="No" checked={formData.canStandExtended === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Are you comfortable working in high-stress situations? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="comfortableHighStress" value="Yes" checked={formData.comfortableHighStress === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="comfortableHighStress" value="No" checked={formData.comfortableHighStress === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Availability</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Days Available to Work</label>
                <div className="space-y-2 mt-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="daysAvailable" value={day} checked={formData.daysAvailable.includes(day)} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-slate-300">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Available Hours <span className="text-red-400">*</span></label>
                <textarea name="availableHours" value={formData.availableHours} onChange={handleChange} rows={3} className={inputClass} placeholder="e.g., 6 AM - 6 PM, Flexible weekends" required />
              </div>
            </div>
          </div>

          {/* References */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">References</h2>
            <p className="text-slate-500 text-sm mb-4">Please list at least two professional references.</p>
            
            <div className="space-y-6">
              {/* Reference 1 */}
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Reference #1 Name <span className="text-red-400">*</span></label>
                  <input type="text" name="reference1Name" value={formData.reference1Name} onChange={handleChange} placeholder="First Last" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Relationship <span className="text-red-400">*</span></label>
                  <input type="text" name="reference1Relationship" value={formData.reference1Relationship} onChange={handleChange} placeholder="e.g., Former Supervisor" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                  <input type="tel" name="reference1Phone" value={formData.reference1Phone} onChange={handleChange} placeholder="(000) 000-0000" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                  <input type="email" name="reference1Email" value={formData.reference1Email} onChange={handleChange} placeholder="example@example.com" className={inputClass} required />
                </div>
              </div>

              <hr className="border-slate-700" />

              {/* Reference 2 */}
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Reference #2 Name <span className="text-red-400">*</span></label>
                  <input type="text" name="reference2Name" value={formData.reference2Name} onChange={handleChange} placeholder="First Last" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Relationship <span className="text-red-400">*</span></label>
                  <input type="text" name="reference2Relationship" value={formData.reference2Relationship} onChange={handleChange} placeholder="e.g., Former Supervisor" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                  <input type="tel" name="reference2Phone" value={formData.reference2Phone} onChange={handleChange} placeholder="(000) 000-0000" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                  <input type="email" name="reference2Email" value={formData.reference2Email} onChange={handleChange} placeholder="example@example.com" className={inputClass} required />
                </div>
              </div>
            </div>
          </div>

          {/* Background Information */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Background Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Have you ever been convicted of a crime? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="convictedOfCrime" value="Yes" checked={formData.convictedOfCrime === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="convictedOfCrime" value="No" checked={formData.convictedOfCrime === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>

              {formData.convictedOfCrime === 'Yes' && (
                <div>
                  <label className={labelClass}>If yes, please explain:</label>
                  <textarea name="crimeExplanation" value={formData.crimeExplanation} onChange={handleChange} rows={3} className={inputClass} />
                </div>
              )}

              <div>
                <label className={labelClass}>Do you have any military or law enforcement experience? <span className="text-red-400">*</span></label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasMilitaryExperience" value="Yes" checked={formData.hasMilitaryExperience === 'Yes'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasMilitaryExperience" value="No" checked={formData.hasMilitaryExperience === 'No'} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-slate-300">No</span>
                  </label>
                </div>
              </div>

              {formData.hasMilitaryExperience === 'Yes' && (
                <div>
                  <label className={labelClass}>If yes, please specify branch and dates:</label>
                  <textarea name="militaryDetails" value={formData.militaryDetails} onChange={handleChange} rows={3} className={inputClass} />
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-6">Additional Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Why are you interested in a security guard position with Your Company Name?</label>
                <textarea name="whyInterestedInPosition" value={formData.whyInterestedInPosition} onChange={handleChange} rows={4} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Any Additional Notes or Special Requests</label>
                <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={4} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-white mb-4">Upload File</h2>
            
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center bg-slate-700/30">
              <input type="file" id="fileUpload" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              <label htmlFor="fileUpload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <FiUpload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-slate-300 font-medium">Browse Files</span>
                  <span className="text-slate-500 text-sm mt-1">Drag and drop files here</span>
                </div>
              </label>
              {uploadedFile && (
                <p className="mt-4 text-green-400 font-medium">✓ {uploadedFile.name}</p>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className={sectionClass}>
            <p className="text-slate-400 text-sm mb-4">
              By signing below, you confirm that all information provided is accurate and complete to the best of your knowledge.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Signature of Applicant</label>
                <div className="mt-2">
                  <input type="file" id="signatureUpload" className="hidden" onChange={handleSignatureCapture} accept="image/*" ref={signatureRef} />
                  <label htmlFor="signatureUpload" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg cursor-pointer hover:bg-blue-600/30 transition-colors border border-blue-500/30">
                    <FiUpload className="w-4 h-4" />
                    Click to sign here
                  </label>
                  {signature && (
                    <div className="mt-3">
                      <img src={signature} alt="Signature" className="max-h-20 border border-slate-600 rounded bg-slate-800/50 p-2" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Name</label>
                <input type="text" name="signatureName" value={formData.signatureName} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Date</label>
                <input type="date" name="signatureDate" value={formData.signatureDate} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-600/25"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </section>
    </>
  )
}
