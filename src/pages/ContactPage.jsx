import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiPhone, HiMail, HiLocationMarker, HiClock, HiShieldCheck } from 'react-icons/hi'

const contactInfo = [
  {
    icon: HiLocationMarker,
    title: 'Address',
    detail: 'Office 101, Blue Tower, Security Rd',
    sub: 'City Center, PK',
    href: 'https://maps.google.com/?q=Office+101+Blue+Tower+Security+Rd+City+Center',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: HiPhone,
    title: 'Emergency Line (24/7)',
    detail: '(+92) 555-123-4567',
    sub: 'Available 24/7',
    href: 'tel:+925551234567',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: HiMail,
    title: 'General Inquiries',
    detail: 'info@tksecurityinc.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:info@tksecurityinc.com',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: HiClock,
    title: 'Working Hours',
    detail: '24/7 Operations',
    sub: 'Always available for emergencies',
    href: null,
    color: 'from-emerald-500 to-teal-600',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your message! We will get back to you shortly.')
    setFormData({ name: '', email: '', phone: '', service: '', message: '' })
  }

  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="pt-24" />

      {/* Contact Hero */}
      <section className="relative pt-8 pb-6 md:pt-12 md:pb-8 z-10 overflow-hidden">
        <div className="absolute top-0 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Get In Touch</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-3 mb-2">
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              <span className="text-white font-semibold">TK Security Company</span> provides reliable, professional security
              services with trained personnel and a client-focused approach.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 mt-4">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 40 }}
                className="w-full"
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {info.href ? (
                  <a
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block group p-5 sm:p-6 rounded-2xl glass hover:border-blue-400/30 transition-all duration-300 text-center h-full"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                      <info.icon className="text-blue-400 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">{info.title}</h3>
                    <p className="text-slate-300 text-xs sm:text-sm">{info.detail}</p>
                    <p className="text-slate-500 text-xs mt-1">{info.sub}</p>
                  </a>
                ) : (
                  <div className="group p-5 sm:p-6 rounded-2xl glass text-center h-full">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                      <info.icon className="text-blue-400 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">{info.title}</h3>
                    <p className="text-slate-300 text-xs sm:text-sm">{info.detail}</p>
                    <p className="text-slate-500 text-xs mt-1">{info.sub}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Form + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mt-0">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Send Us a Message</h2>
              <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-8">
                Fill out the form below and our team will respond promptly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-slate-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm text-slate-400 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(000) 000-0000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-slate-400 mb-1.5">Service Needed</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white focus:outline-none focus:border-blue-400/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-slate-800">Select a service</option>
                      <option value="security-guard" className="bg-slate-800">Security Guard</option>
                      <option value="vehicle-patrol" className="bg-slate-800">Vehicle Patrol</option>
                      <option value="corporate-security" className="bg-slate-800">Corporate Security</option>
                      <option value="event-security" className="bg-slate-800">Event Security</option>
                      <option value="executive-protection" className="bg-slate-800">Executive Protection</option>
                      <option value="other" className="bg-slate-800">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-slate-400 mb-1.5">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your security needs..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 border-2 border-blue-400"
                >
                  Send Message
                </motion.button>

                <p className="text-xs text-slate-500 text-center">
                  Free consultation · No obligation · We respond within 24 hours
                </p>
              </form>
            </motion.div>

            {/* Right side — Info panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-6 mt-8 lg:mt-0"
            >
              {/* Map embed */}
              <div className="rounded-2xl overflow-hidden glass p-1 flex-1 min-h-[250px] sm:min-h-[300px]">
                <iframe
                  title="TK Security Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3298.0!2d-118.53!3d34.28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDE2JzQ4LjAiTiAxMTjCsDMxJzQ4LjAiVw!5e0!3m2!1sen!2sus!4v1"
                  className="w-full h-[250px] sm:h-full min-h-[250px] sm:min-h-[300px] rounded-xl"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Quick CTA */}
              <div className="relative rounded-2xl overflow-hidden mt-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900" />
                <div className="relative p-6 sm:p-8 text-center">
                  <HiShieldCheck className="text-white text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Need Immediate Help?</h3>
                  <p className="text-blue-200 text-xs sm:text-sm mb-3 sm:mb-4">
                    Our team is standing by 24/7 for emergency security requests.
                  </p>
                  <motion.a
                    href="tel:+18187075382"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 rounded-full bg-white text-blue-700 font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <HiPhone />
                    Call Now: (818) 707-5382
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
