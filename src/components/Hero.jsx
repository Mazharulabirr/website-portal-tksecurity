import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight, HiShieldCheck, HiClock, HiPhone } from 'react-icons/hi'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[80vh] flex items-center overflow-hidden"
    >
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:w-[60%] text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-slate-300 mb-5">
              <HiShieldCheck className="text-blue-400 text-sm" />
              We provide reliable protection
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-snug tracking-tight mb-4">
              Professional{' '}
              <span className="gradient-text">Safety & Security</span>
              <br />
              Protection Services
            </h1>

            {/* Subtitle */}
            <p className="text-base text-slate-400 max-w-md mb-8 leading-relaxed mx-auto lg:mx-0">
              Reliable 24/7 security coverage with trained armed and unarmed guards
              to keep your premises safe and secure. Based in Southern California.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <Link to="/contact">
                <motion.span
                  className="group flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get a Quote
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform text-blue-400" />
                </motion.span>
              </Link>
              <Link to="/apply-job">
                <motion.span
                  className="group flex items-center gap-2 px-6 py-3 rounded-full glass text-slate-300 font-semibold text-sm hover:text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply for Job
                </motion.span>
              </Link>
              <motion.a
                href="tel:+18187075382"
                className="group flex items-center gap-2 px-6 py-3 rounded-full glass text-slate-300 font-semibold text-sm hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HiPhone className="text-blue-400" />
                24/7 Available
              </motion.a>
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:w-[40%] w-full max-w-lg lg:max-w-none"
          >
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute -inset-4 bg-blue-500/10 rounded-3xl blur-2xl" />
              
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20">
                <img
                  src="/images/hero-bg.jpg"
                  alt="TK Security Officer"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                  style={{ objectPosition: 'right center' }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/60 via-transparent to-transparent" />
                
                {/* Floating badge on image */}
                <div className="absolute bottom-6 left-6 right-6 glass rounded-xl px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <HiShieldCheck className="text-blue-400 text-lg" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Licensed & Insured</div>
                    <div className="text-slate-400 text-xs">Professional Security Services</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
