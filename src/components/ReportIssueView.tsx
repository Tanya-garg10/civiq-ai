import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, getDocs } from '../firebase';
import { 
  Building2, 
  Camera, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  HelpCircle, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportIssueViewProps {
  language: 'en' | 'hi';
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ language }) => {
  const { user, profile, updateProfileScore } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sanitation & Waste');
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);
  const [address, setAddress] = useState('Central New Delhi, Delhi, India');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ward, setWard] = useState('Ward-1');

  // Image assets
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

  // AI Agent States
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  
  // Duplicate Check State
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Pothole',
    'Garbage',
    'Streetlight',
    'Water Leakage',
    'Broken Road',
    'Illegal Dumping',
    'Construction Damage',
    'Sanitation & Waste',
    'Public Hazard'
  ];

  const wards = ['Ward-1', 'Ward-2', 'Ward-3', 'Ward-4', 'Ward-5'];

  // Automatically lookup user current GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
          setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
          setAddress(`GPS Coordinate Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        (error) => {
          console.warn("Geolocation lookup denied or unavailable. Standard defaults applied.");
        }
      );
    }
  }, []);

  // Handle Image Upload & Compression to keep base64 payloads lightweight
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress the image using HTML5 Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Convert compressed image to standard jpeg base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImageSrc(compressedBase64);
          
          // Instantly trigger Vision Agent analysis
          triggerVisionAgent(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Trigger server-side Vision Agent
  const triggerVisionAgent = async (base64Img: string) => {
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Img,
          description,
          category
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      } else if (data.fallbackAnalysis) {
        setAiAnalysis(data.fallbackAnalysis);
      }
    } catch (e) {
      console.error("Vision agent failed:", e);
      // Fallback diagnostics
      setAiAnalysis({
        issueType: category,
        severity: "6",
        priority: "medium",
        department: category === 'Streetlight' ? 'Electricity Board' : 'Public Works Dept',
        estimatedDays: 5,
        reasoning: "Image uploaded successfully. Diagnostics assigned general public priority standard.",
        confidence: 0.75
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Run validation checks for duplicate reports in same ward
  const validateDuplicateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      alert("Please upload an image of the civic issue.");
      return;
    }

    setCheckingDuplicate(true);
    setDuplicateWarning(null);

    try {
      // Load current reports from Firestore to look for overlaps
      const q = collection(db, 'reports');
      const snap = await getDocs(q);
      const existingReports: any[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.status !== 'resolved' && d.category === category) {
          existingReports.push({ id: doc.id, ...d });
        }
      });

      // Call Validation Agent API
      const res = await fetch('/api/ai/validate-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentReport: { description, category },
          existingReports
        })
      });
      
      const data = await res.json();
      if (data.success && data.result?.isDuplicate) {
        setDuplicateWarning(data.result);
        setCheckingDuplicate(false);
        return; // Pause filing to prompt confirmation
      }
    } catch (err) {
      console.warn("Validation agent skipped:", err);
    }

    setCheckingDuplicate(false);
    // Proceed if clean
    await submitReport();
  };

  // Submit report to firestore database
  const submitReport = async () => {
    setSubmitting(true);
    try {
      const finalReport = {
        description,
        category,
        latitude,
        longitude,
        address,
        date,
        createdAt: new Date().toISOString(),
        reporterId: user?.uid || 'guest_id',
        reporterName: profile?.displayName || 'Guest Contributor',
        reporterPhoto: profile?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest',
        status: 'pending',
        department: aiAnalysis?.department || 'Public Works Dept',
        priority: aiAnalysis?.priority || 'medium',
        severity: aiAnalysis?.severity || '5',
        aiAnalysis: aiAnalysis || {
          issueType: category,
          severity: "5",
          priority: "medium",
          department: "Municipal Corp",
          estimatedDays: 7,
          reasoning: "Direct submission by citizen.",
          confidence: 0.6
        },
        votesCount: 0,
        upvotes: 0,
        downvotes: 0,
        verificationCount: 0,
        rejectionsCount: 0,
        verificationStatus: 'unverified',
        ward,
        timeline: [
          {
            id: '1',
            status: 'pending',
            title: 'Report Registered',
            description: `Issue flagged in ${ward}. Diagnostics handled by AI Planning Agent.`,
            date: new Date().toISOString(),
            updatedBy: profile?.displayName || 'Citizen'
          }
        ],
        duplicatesMerged: []
      };

      await addDoc(collection(db, 'reports'), finalReport);
      
      // Award Contribution score for filing report
      await updateProfileScore(25, 'Active Reporter');

      // Create local alert/notification
      await addDoc(collection(db, 'notifications'), {
        userId: user?.uid || 'guest_id',
        title: "Report Filed Successfully 🎉",
        message: `Your ${category} report has been cataloged under ${ward} and assigned to ${finalReport.department}. (+25 Points)`,
        read: false,
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (e) {
      console.error("Failed to submit report:", e);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 text-slate-800 dark:text-slate-100">
      
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Head */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर लौटें'}</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          {language === 'en' ? 'Report a Community Issue' : 'सामुदायिक समस्या की रिपोर्ट करें'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8">
          Upload photo evidence. CiviQ's AI agents automatically diagnose priority, severity, and schedule dispatching to public officers.
        </p>

        {/* Form Container */}
        <form onSubmit={validateDuplicateAndSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Input fields and location */}
          <div className="space-y-6">
            
            {/* Category Dropdown */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Issue Category' : 'शिकायत श्रेणी'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Description Area */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Description & Location Context' : 'विवरण और स्थान का संदर्भ'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'en' ? "Describe the potholes, leaks, blockages or damage. Be specific to help crew locate it." : "गड्ढे, रिसाव, रुकावट या क्षति का वर्णन करें।"}
                rows={4}
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Ward Selector */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Select Ward' : 'वार्ड चुनें'}
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                {wards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* GPS & Location Selector */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  {language === 'en' ? 'Geoposition GPS' : 'भू-स्थिति जीपीएस'}
                </label>
                <span className="text-4xs px-2 py-0.5 bg-blue-100 dark:bg-slate-800 text-blue-600 rounded font-black">
                  Auto-Locked
                </span>
              </div>
              
              {/* Interactive Fallback Map Selector */}
              <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 text-center">
                <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-600/5 grid grid-cols-6 grid-rows-4 gap-0 pointer-events-none opacity-50">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-slate-200/30 dark:border-slate-800/20" />
                  ))}
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <MapPin className="h-8 w-8 text-rose-500 animate-bounce mb-2" />
                  <span className="text-2xs font-extrabold text-slate-700 dark:text-slate-300">
                    {address}
                  </span>
                  <div className="flex space-x-2 mt-3">
                    <span className="text-4xs font-mono px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200/60 dark:border-slate-800 text-slate-500">
                      Lat: {latitude}
                    </span>
                    <span className="text-4xs font-mono px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200/60 dark:border-slate-800 text-slate-500">
                      Lng: {longitude}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Camera / Image Evidence Upload and AI agent analysis */}
          <div className="space-y-6">
            
            {/* Image Upload Box */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                {language === 'en' ? 'Photo Evidence (Required)' : 'फोटो प्रमाण (आवश्यक)'}
              </label>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden bg-slate-50 dark:bg-slate-950"
              >
                {imageSrc ? (
                  <>
                    <img src={imageSrc} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/75 text-white text-4xs rounded-lg font-bold flex items-center space-x-1">
                      <Camera className="h-3 w-3" />
                      <span>Retake</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 w-max mx-auto mb-3">
                      <Camera className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-extrabold dark:text-slate-200 block">Click or Tap to take/upload Photo</span>
                    <span className="text-4xs text-slate-400 mt-1 block">Supports Drag & Drop, Camera capture</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* AI Diagnostics Box (Visible after image uploaded / during active lookup) */}
            {(analyzing || aiAnalysis) && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl" />

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
                    <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-200">
                      AI Vision Agent Diagnostics
                    </span>
                  </div>
                  <span className="text-4xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-black">
                    Active
                  </span>
                </div>

                {analyzing ? (
                  <div className="py-8 text-center space-y-3">
                    <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin mx-auto" />
                    <span className="text-2xs font-bold text-slate-400 block">Scanning pixels for physical hazards...</span>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-3 text-2xs">
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-4xs uppercase tracking-wider font-extrabold">Detected Type</span>
                        <span className="font-extrabold text-slate-200">{aiAnalysis.issueType}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-4xs uppercase tracking-wider font-extrabold">Assigned Department</span>
                        <span className="font-extrabold text-slate-200">{aiAnalysis.department}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-4xs uppercase tracking-wider font-extrabold">Calculated Severity</span>
                        <span className="font-extrabold text-rose-400">Score: {aiAnalysis.severity}/10</span>
                      </div>
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-4xs uppercase tracking-wider font-extrabold">Resolution Priority</span>
                        <span className="font-extrabold text-amber-400 capitalize">{aiAnalysis.priority}</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-4xs uppercase tracking-wider font-extrabold mb-1">Explainable AI Reasoning</span>
                      <p className="text-4xs text-slate-300 leading-relaxed">
                        {aiAnalysis.reasoning}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-5xs text-slate-500">
                      <span>Model Confidence: {Math.round(aiAnalysis.confidence * 100)}%</span>
                      <span>Estimated Resolve: {aiAnalysis.estimatedDays} days</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Duplicate Validation Warn Box */}
            {duplicateWarning && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-sm space-y-3">
                <div className="flex items-start space-x-2.5">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-800 dark:text-amber-300">Validation Agent: Similar Issue Detected Nearby</h4>
                    <p className="text-3xs text-amber-700 dark:text-amber-400 mt-1">
                      {duplicateWarning.reason}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/report/${duplicateWarning.matchReportId}`)}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-3xs font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    View & Support Existing Issue
                  </button>
                  <button
                    type="button"
                    onClick={submitReport}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-3xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    File New Report Anyway
                  </button>
                </div>
              </div>
            )}

            {/* Submit Bar */}
            <button
              type="submit"
              disabled={submitting || analyzing || checkingDuplicate}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Registering Complaint...' : checkingDuplicate ? 'Verifying Duplicates...' : 'Register Issue & Dispatch'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};
