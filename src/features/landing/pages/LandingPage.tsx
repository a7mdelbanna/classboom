import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { 
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlinePlay,
  HiOutlineStar,
  HiOutlinePlus,
  HiOutlineMinus
} from 'react-icons/hi';

export function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: HiOutlineUsers,
      title: 'Smart Student Management',
      description: 'Modern card UI with comprehensive profiles, social media integration, and parent portals',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Multi-Role Authentication',
      description: 'Secure, separate portals for schools, students, parents, and teachers',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: HiOutlineAcademicCap,
      title: '25+ Institution Types',
      description: 'From schools to yoga studios, with dynamic terminology for each',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: HiOutlineCalendar,
      title: 'Dynamic Scheduling',
      description: 'Class management, attendance tracking, and automated reminders',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: HiOutlineCurrencyDollar,
      title: 'Financial Management',
      description: 'Multiple payment models, automated billing, and financial reports',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: HiOutlineChartBar,
      title: 'Real-time Analytics',
      description: 'Track performance, enrollment trends, and institutional growth',
      color: 'from-red-500 to-red-600'
    }
  ];

  const audiences = [
    {
      category: 'Educational Institutions',
      types: ['Public Schools', 'Private Schools', 'Universities', 'Community Colleges'],
      icon: '🏫',
      color: 'from-blue-500 to-blue-600'
    },
    {
      category: 'Specialized Learning',
      types: ['Music Schools', 'Art Studios', 'Language Centers', 'Dance Studios'],
      icon: '🎨',
      color: 'from-purple-500 to-purple-600'
    },
    {
      category: 'Sports & Fitness',
      types: ['Gyms', 'Martial Arts Dojos', 'Sports Academies', 'Yoga Studios'],
      icon: '💪',
      color: 'from-green-500 to-green-600'
    },
    {
      category: 'Individual Providers',
      types: ['Private Tutors', 'Personal Trainers', 'Music Teachers', 'Coaches'],
      icon: '👨‍🏫',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const benefits = [
    { icon: HiOutlineClock, text: 'Save 10+ hours per week on admin tasks' },
    { icon: HiOutlineUsers, text: 'Increase enrollment by 30% with parent portals' },
    { icon: HiOutlineCalendar, text: 'Reduce no-shows with automated reminders' },
    { icon: HiOutlineChartBar, text: 'Scale from 10 to 10,000 students seamlessly' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <HiOutlineSparkles className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ClassBoom</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <HiOutlineSun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <HiOutlineMoon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full
                  font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Free Trial
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 
                text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full mb-6"
            >
              <HiOutlineSparkles className="w-5 h-5" />
              <span className="font-semibold">Trusted by 1,000+ Institutions Worldwide</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
              style={{ opacity }}
            >
              Transform Your Educational
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500">
                Institution with ClassBoom
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              The All-in-One Management Platform for Schools, Studios, and Learning Centers
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full
                  font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200
                  flex items-center space-x-2"
              >
                <span>Start Your 14-Day Free Trial</span>
                <HiOutlineArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full
                  font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200
                  flex items-center space-x-2 border border-gray-200 dark:border-gray-700"
              >
                <HiOutlinePlay className="w-5 h-5" />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            <motion.p 
              className="mt-8 text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Join 1,000+ institutions • No credit card required • Setup in 5 minutes
            </motion.p>
          </motion.div>

          {/* Floating UI Elements */}
          <motion.div 
            className="absolute top-20 left-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 hidden lg:block"
            style={{ y: y1 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">2,456</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="absolute top-40 right-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 hidden lg:block"
            style={{ y: y2 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <HiOutlineCheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">98%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="absolute bottom-10 left-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 hidden lg:block"
            style={{ y: y1 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <HiOutlineStar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">4.9/5</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">User Rating</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30" />
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Beautiful, Intuitive Interface
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Designed for simplicity and efficiency, loved by users
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Dashboard Mock */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">ClassBoom Dashboard</span>
                </div>
              </div>
              
              <div className="p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Students', value: '2,456', change: '+12%', color: 'blue' },
                    { label: 'Teachers', value: '45', change: '+5%', color: 'purple' },
                    { label: 'Classes', value: '132', change: '+8%', color: 'green' },
                    { label: 'Revenue', value: '$45,632', change: '+15%', color: 'orange' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 md:p-4"
                    >
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs md:text-sm text-green-500">{stat.change}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent Students</h3>
                    {['Alice Johnson', 'Bob Smith', 'Carol Davis'].map((name, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">{name}</p>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Just enrolled</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Classes</h3>
                    {['Math 101', 'Science Lab', 'Art Workshop'].map((class_, index) => (
                      <div key={index} className="p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{class_}</p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">In {index + 1} hour{index !== 0 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-40 h-40 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to streamline your operations and enhance the learning experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color}
                  flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Who Is ClassBoom For?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for every type of educational institution and learning provider
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {audiences.map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center mb-6">
                  <span className="text-5xl mr-4">{audience.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {audience.category}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {audience.types.map((type, typeIndex) => (
                    <div 
                      key={typeIndex}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
                    >
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose ClassBoom?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of institutions experiencing transformative results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full
                  flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {benefit.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what our customers have to say about ClassBoom
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Principal, Sunshine Elementary",
                content: "ClassBoom has revolutionized how we manage our school. The parent portal alone has saved us countless hours.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Director, Elite Martial Arts",
                content: "Perfect for our dojo! The belt tracking and attendance features are exactly what we needed.",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                role: "Owner, Creative Dance Studio",
                content: "From scheduling to payments, ClassBoom handles everything. Our enrollment increased by 40% this year!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HiOutlineStar key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Start Free, Scale As You Grow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transparent pricing that grows with your institution
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                description: "Perfect for small institutions",
                features: ["Up to 50 students", "Basic features", "Email support", "1 location"],
                highlighted: false
              },
              {
                name: "Professional",
                price: "$99",
                period: "/month",
                description: "For growing institutions",
                features: ["Up to 500 students", "All features", "Priority support", "3 locations", "Parent portal", "Advanced analytics"],
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large institutions",
                features: ["Unlimited students", "All features", "Dedicated support", "Unlimited locations", "Custom integrations", "White labeling"],
                highlighted: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 
                  ${plan.highlighted ? 'ring-2 ring-orange-500 scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white 
                      px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {plan.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200
                    ${plan.highlighted 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  Start Free Trial
                </motion.button>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about ClassBoom
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "How long is the free trial?",
                answer: "ClassBoom offers a generous 14-day free trial with full access to all features. No credit card required to start!"
              },
              {
                question: "Can I switch plans later?",
                answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the next billing cycle."
              },
              {
                question: "Is my data secure?",
                answer: "Yes! We use enterprise-grade security with encrypted data storage, secure authentication, and row-level security to ensure your data is completely isolated and protected."
              },
              {
                question: "Do you support multiple locations?",
                answer: "Yes! ClassBoom supports multi-location management. You can manage multiple branches from a single dashboard with our Professional and Enterprise plans."
              },
              {
                question: "Can parents access the platform?",
                answer: "Yes! We offer dedicated parent portals where parents can view their children's progress, communicate with teachers, and stay updated on school activities."
              },
              {
                question: "What kind of support do you offer?",
                answer: "We provide email support for all plans, priority support for Professional plans, and dedicated support with phone access for Enterprise customers."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of institutions already using ClassBoom to streamline their operations
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-12 py-5 bg-white text-orange-600 rounded-full font-bold text-xl
                shadow-2xl hover:shadow-3xl transition-all duration-200 inline-flex items-center space-x-3"
            >
              <span>Start Your Free Trial</span>
              <HiOutlineArrowRight className="w-6 h-6" />
            </motion.button>
            
            <p className="mt-6 text-white/80">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HiOutlineSparkles className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ClassBoom</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 ClassBoom. All rights reserved. Made with ❤️ for educators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          {isOpen ? (
            <HiOutlineMinus className="w-5 h-5 text-orange-500" />
          ) : (
            <HiOutlinePlus className="w-5 h-5 text-orange-500" />
          )}
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-4">
              <p className="text-gray-600 dark:text-gray-300">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}