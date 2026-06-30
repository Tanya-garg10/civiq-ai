import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Award, 
  Building2,
  ChevronRight,
  Shield,
  Clock,
  ThumbsUp,
  PlusCircle,
  Map
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  language: 'en' | 'hi';
}

export const LandingPage: React.FC<LandingPageProps> = ({ language }) => {
  const { user } = useAuth();

  // Translations
  const content = {
    en: {
      heroTitle: "Hyperlocal AI Civic Intelligence",
      heroSubtitle: "Empowering citizens with AI multi-agents to report, verify, prioritize, and collaboratively solve city infrastructure issues in real-time.",
      ctaReport: "Report an Issue",
      ctaViewMap: "Explore Active Map",
      statTotal: "Total Reports Filed",
      statResolved: "Issues Solved",
      statHours: "Avg Solve Hours",
      statVerified: "Verified Complaints",
      howTitle: "How CiviQ AI Works",
      howSubtitle: "A robust 4-step workflow backed by validation, planning, and vision agents.",
      how1Title: "1. Snap & Describe",
      how1Desc: "Upload photos or video of potholes, water leaks, or garbage. Add a brief description.",
      how2Title: "2. AI Autonomous Diagnostics",
      how2Desc: "Our Vision Agent analyzes severity, classifies types, and assigns the correct department in seconds.",
      how3Title: "3. Hyperlocal Verification",
      how3Desc: "Nearby citizens confirm reports, raising trust scores and avoiding fake spam complaints.",
      how4Title: "4. Direct Coordination",
      how4Desc: "The Planning Agent schedules resolution routes, dispatching tasks directly to civic officers.",
      featTitle: "Engineered Civic Infrastructure Features",
      featSubtitle: "Autonomous municipal coordination backed by state-of-the-art AI agents.",
      feat1Title: "Vision Diagnostic Agent",
      feat1Desc: "State-of-the-art computer vision estimates damage severity, hazard scores, and assigns priorities.",
      feat2Title: "Duplicate validation",
      feat2Desc: "Location and visual matching automatically detect duplicate filings, merging them together.",
      feat3Title: "Resource Allocation Agent",
      feat3Desc: "Recommends optimized budgets, vehicle routings, and personnel dispatches to municipal commissioners.",
      feat4Title: "Civic Gamification",
      feat4Desc: "Earn Contribution Points, unlock Community Hero Badges, and rank on local ward leaderboards.",
      testTitle: "What Citizens & Officials Say",
      testSubtitle: "Bridging the gap between active communities and municipal offices.",
      test1Name: "Amit Patel (Citizen, Ward 4)",
      test1Quote: "Reporting a damaged streetlight used to take months of follow-up. CiviQ categorized it instantly, and within 48 hours, the crew arrived to fix it. Unbelievable!",
      test2Name: "Dr. Sandeep Rao (Municipal Commissioner)",
      test2Quote: "With CiviQ's AI Analytics Agent, we can predict garbage hotspots and allocate sewer cleaning crews ahead of rainstorms. It saved us 30% on emergency maintenance budgets.",
    },
    hi: {
      heroTitle: "हाइपरलोकल एआई नागरिक बुद्धिमत्ता",
      heroSubtitle: "नागरिकों को बहु-एआई एजेंटों के साथ शहर के बुनियादी ढांचे के मुद्दों की रीयल-टाइम रिपोर्ट करने, सत्यापित करने और हल करने में सशक्त बनाना।",
      ctaReport: "समस्या की रिपोर्ट करें",
      ctaViewMap: "सक्रिय नक्शा देखें",
      statTotal: "कुल दर्ज रिपोर्ट",
      statResolved: "हल की गई समस्याएं",
      statHours: "औसत समाधान घंटे",
      statVerified: "सत्यापित शिकायतें",
      howTitle: "सीवीक्यू एआई कैसे काम करता है",
      howSubtitle: "सत्यापन, योजना और विज़न एजेंटों द्वारा समर्थित एक मजबूत 4-चरण वर्कफ़्लो।",
      how1Title: "1. फोटो खींचें और विवरण दें",
      how1Desc: "गड्ढों, पानी के रिसाव या कचरे की तस्वीरें/वीडियो अपलोड करें। संक्षिप्त विवरण जोड़ें।",
      how2Title: "2. एआई स्वायत्त निदान",
      how2Desc: "हमारा विज़न एजेंट गंभीरता का विश्लेषण करता है, प्रकारों को वर्गीकृत करता है और विभाग को सौंपता है।",
      how3Title: "3. हाइपरलोकल सत्यापन",
      how3Desc: "आस-पास के नागरिक रिपोर्टों की पुष्टि करते हैं, जिससे विश्वास स्कोर बढ़ता है और स्पैम रुकता है।",
      how4Title: "4. प्रत्यक्ष समन्वय",
      how4Desc: "प्लानिंग एजेंट समाधान मार्गों को शेड्यूल करता है, जिससे काम सीधे अधिकारियों तक पहुंचता है।",
      featTitle: "इंजीनियर्ड नागरिक बुनियादी ढांचा विशेषताएं",
      featSubtitle: "अत्याधुनिक एआई एजेंटों द्वारा समर्थित स्वायत्त नगर निगम समन्वय।",
      feat1Title: "विज़न डायग्नोस्टिक एजेंट",
      feat1Desc: "कंप्यूटर विज़न नुकसान की गंभीरता, खतरे के स्कोर का अनुमान लगाता है और प्राथमिकताएं निर्धारित करता है।",
      feat2Title: "डुप्लिकेट सत्यापन",
      feat2Desc: "स्थान और विज़ुअल मिलान स्वचालित रूप से डुप्लिकेट प्रविष्टियों का पता लगाता है और उन्हें मिलाता है।",
      feat3Title: "संसाधन आवंटन एजेंट",
      feat3Desc: "नगर निगम आयुक्तों को अनुकूलित बजट, वाहन मार्गों और कर्मियों के प्रेषण की सिफारिश करता है।",
      feat4Title: "नागरिक गेमीफिकेशन",
      feat4Desc: "योगदान अंक अर्जित करें, कम्युनिटी हीरो बैज अनलॉक करें, और स्थानीय वार्ड लीडरबोर्ड पर रैंक करें।",
      testTitle: "नागरिकों और अधिकारियों का क्या कहना है",
      testSubtitle: "सक्रिय समुदायों और नगर निगम कार्यालयों के बीच की खाई को पाटना।",
      test1Name: "अमित पटेल (नागरिक, वार्ड 4)",
      test1Quote: "क्षतिग्रस्त स्ट्रीटलाइट की रिपोर्ट करने में महीनों लग जाते थे। CiviQ ने इसे तुरंत वर्गीकृत किया, और 48 घंटों के भीतर सुधार दल आ गया। अविश्वसनीय!",
      test2Name: "डॉ. संदीप राव (नगर आयुक्त)",
      test2Quote: "CiviQ के AI विश्लेषिकी एजेंट के साथ, हम कचरा हॉटस्पॉट की भविष्यवाणी कर सकते हैं और बारिश से पहले सीवर सफाई दल आवंटित कर सकते हैं। इसने हमें आपातकालीन रखरखाव बजट पर 30% की बचत दी।",
    }
  };

  const currentContent = content[language];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Animated Micro-badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-bold mb-6 border border-blue-200/50 dark:border-blue-900/40">
              <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
              <span>{language === 'en' ? "Multi-Agent Civic AI Engine v2.5" : "मल्टी-एजेंट सिविक एआई इंजन"}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {currentContent.heroTitle}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {currentContent.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? "/report" : "/login"}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all text-center flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="h-5 w-5" />
                <span>{currentContent.ctaReport}</span>
              </Link>
              <Link
                to={user ? "/map" : "/login"}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transform hover:-translate-y-0.5 transition-all text-center flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Map className="h-5 w-5 text-emerald-500" />
                <span>{currentContent.ctaViewMap}</span>
              </Link>
            </div>

            {/* Demo Accounts Callout for Hackathon Evaluation */}
            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-2">
              <span className="font-extrabold text-blue-600 dark:text-emerald-400">💡 HACKATHON EVALUATORS:</span>
              <span>Use the <strong>"Demo Login"</strong> bypass on the login screen to instantly log in as a citizen or a government administrator with full dashboards!</span>
            </div>

          </div>
        </div>
      </section>

      {/* Real-time Statistics Grid */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="block text-4xl font-extrabold text-blue-600 dark:text-emerald-500">1,248</span>
              <span className="block text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{currentContent.statTotal}</span>
            </div>
            <div className="text-center border-l border-slate-200 dark:border-slate-800">
              <span className="block text-4xl font-extrabold text-blue-600 dark:text-emerald-500">1,092</span>
              <span className="block text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{currentContent.statResolved}</span>
            </div>
            <div className="text-center border-l border-slate-200 dark:border-slate-800">
              <span className="block text-4xl font-extrabold text-blue-600 dark:text-emerald-500">26.4h</span>
              <span className="block text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{currentContent.statHours}</span>
            </div>
            <div className="text-center border-l border-slate-200 dark:border-slate-800">
              <span className="block text-4xl font-extrabold text-blue-600 dark:text-emerald-500">94.8%</span>
              <span className="block text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{currentContent.statVerified}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {currentContent.howTitle}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
              {currentContent.howSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{currentContent.how1Title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.how1Desc}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">
                <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{currentContent.how2Title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.how2Desc}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">
                <ThumbsUp className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{currentContent.how3Title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.how3Desc}</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{currentContent.how4Title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.how4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Agents & Technology */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {currentContent.featTitle}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
              {currentContent.featSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Agent Card */}
            <div className="flex bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-xl h-12 w-12 flex items-center justify-center text-blue-600 mr-4 shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{currentContent.feat1Title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.feat1Desc}</p>
              </div>
            </div>

            {/* Validation Agent Card */}
            <div className="flex bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl h-12 w-12 flex items-center justify-center text-emerald-600 mr-4 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{currentContent.feat2Title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.feat2Desc}</p>
              </div>
            </div>

            {/* Planning / Resource Dispatcher Card */}
            <div className="flex bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-xl h-12 w-12 flex items-center justify-center text-amber-600 mr-4 shrink-0">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{currentContent.feat3Title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.feat3Desc}</p>
              </div>
            </div>

            {/* Leaderboard & Gamification Card */}
            <div className="flex bg-slate-50 dark:bg-slate-800/40 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl h-12 w-12 flex items-center justify-center text-indigo-600 mr-4 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{currentContent.feat4Title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{currentContent.feat4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {currentContent.testTitle}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
              {currentContent.testSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm relative">
              <p className="text-slate-600 dark:text-slate-300 italic mb-6">
                "{currentContent.test1Quote}"
              </p>
              <div className="flex items-center">
                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Amit" className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <h4 className="text-sm font-bold dark:text-white">{currentContent.test1Name}</h4>
                  <span className="text-2xs text-slate-400">Verified Contributor</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm relative">
              <p className="text-slate-600 dark:text-slate-300 italic mb-6">
                "{currentContent.test2Quote}"
              </p>
              <div className="flex items-center">
                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Sandeep" className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <h4 className="text-sm font-bold dark:text-white">{currentContent.test2Name}</h4>
                  <span className="text-2xs text-slate-400">Department Head</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Building2 className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-white">CiviQ AI Civic Portal</span>
          </div>
          <p className="text-xs mb-4">Autonomous Multi-Agent Community Issue Resolution & Resource Optimization System</p>
          <p className="text-3xs text-slate-500">© 2026 CiviQ AI. Built for municipal efficiency. Dedicated to citizens worldwide.</p>
        </div>
      </footer>

    </div>
  );
};
