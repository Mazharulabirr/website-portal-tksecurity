import { motion } from 'framer-motion'
import { HiCheckCircle, HiShieldCheck, HiHeart, HiUsers, HiLightningBolt, HiClock, HiEye } from 'react-icons/hi'

const whyChooseUs = [
  {
    icon: HiHeart,
    title: 'Honesty, Reliability & Commitment',
    description: 'Our company is built on strong values. Every decision we make is guided by honesty, responsibility, and dedication. We believe real security begins with trust, and we work hard to earn it.',
  },
  {
    icon: HiUsers,
    title: 'Skilled & Professional Team',
    description: 'Every security officer goes through strict background screening and professional training. Our team is disciplined, experienced, and prepared to handle any situation with confidence and respect.',
  },
  {
    icon: HiLightningBolt,
    title: 'Smart & Modern Security Solutions',
    description: 'We use advanced security tools and monitoring systems to enhance protection. From real-time surveillance to intelligent tracking, our technology helps us stay proactive and one step ahead.',
  },
  {
    icon: HiClock,
    title: '24/7 Reliable Support',
    description: 'Your safety matters at every hour. Our team is always on standby, ready to respond quickly to any concern, incident, or emergency—day or night.',
  },
]

const whatWeDo = [
  'Armed and Unarmed Security Guards',
  'Mobile & Marked Vehicle Patrol',
  'Corporate & Commercial Security',
  'Residential & Retail Security',
  'Event Security & Crowd Control',
  '24/7 Monitoring and Rapid Response',
]

const industriesWeServe = [
  'Corporate offices and commercial buildings',
  'Residential communities and apartment complexes',
  'Retail stores and shopping centers',
  'Construction sites and warehouses',
  'Hospitals and healthcare facilities',
  'Events, concerts, and private functions',
]

export default function AboutPage() {
  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="pt-24" />

      {/* Hero Header Section */}
      <section className="relative py-16 z-10 overflow-hidden">
        <div className="absolute top-0 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">About Us</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-3 mb-4">
              About <span className="gradient-text">TK Security</span>
            </h1>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg">
              <span className="text-white font-semibold">TK Security Company</span> provides reliable, professional security 
              services with trained personnel and a client-focused approach.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Our Mission */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-8 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <HiShieldCheck className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Our mission is to provide dependable, efficient, and ethical security 
                services that protect people, property, and assets while maintaining 
                the highest standards of integrity and professionalism.
              </p>
            </motion.div>

            {/* Our Vision */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-8 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <HiEye className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Our vision is to become a leading security services company 
                recognized for excellence, trust, and innovation in the security 
                industry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose TK Security */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Why Choose <span className="gradient-text">TK Security?</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex gap-4 p-6 rounded-2xl glass hover:border-blue-400/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-400 text-sm mt-8"
          >
            We specialize in a wide range of security services, including:
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-500 text-sm mt-4"
          >
            Each service is carefully customized to match the specific risks and 
            requirements of our clients.
          </motion.p>
        </div>
      </section>

      {/* What We Do */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              What We <span className="gradient-text">Do</span>
            </h2>
            <p className="text-slate-400">
              We specialize in a wide range of security services, including:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 border border-white/5"
          >
            <ul className="grid sm:grid-cols-2 gap-4">
              {whatWeDo.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <HiCheckCircle className="text-blue-400 text-lg flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-500 text-sm mt-6">
              Each service is carefully customized to match the specific risks and requirements of our clients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Industries We <span className="gradient-text">Serve</span>
            </h2>
            <p className="text-slate-400">
              We proudly provide security services for a wide range of industries, including:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 border border-white/5"
          >
            <ul className="grid sm:grid-cols-2 gap-4">
              {industriesWeServe.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <HiCheckCircle className="text-blue-400 text-lg flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-500 text-sm mt-6">
              Each service is carefully customized to match the specific risks and requirements of our clients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 24/7 Protection */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8 border border-white/5 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              24/7 Protection <span className="gradient-text">You Can Trust</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4 max-w-3xl mx-auto">
              Security threats don't follow a schedule—and neither do we. Our team operates 24/7 to ensure constant monitoring, rapid response, and 
              uninterrupted protection.
            </p>
            <p className="text-slate-500">
              Day or night, TK Security remains vigilant and ready.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8 border border-white/5 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Our Promise <span className="gradient-text">to You</span>
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-3xl mx-auto">
              We promise to deliver security services that are professional, responsive, and effective—without compromise. When you choose TK Security, 
              you choose confidence, protection, and peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="relative py-16 z-10 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8 border border-white/5 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Our <span className="gradient-text">Commitment</span>
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-3xl mx-auto">
              At <span className="text-white font-semibold">TK Security Company</span>, security is more than a service—it is a responsibility. We are committed to building long-term relationships based on 
              trust, reliability, and consistent performance.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
