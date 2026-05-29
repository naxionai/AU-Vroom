import React, { useState, useEffect, useRef } from "react";
import {
  Bus,
  MapPin,
  CreditCard,
  Users,
  Radio,
  Clock,
  Sparkles,
  TrendingUp,
  Send,
  RefreshCw,
  Bell,
  Heart,
  Navigation,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  Activity,
  LogOut,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
  Plus,
  Coins,
  Compass,
  ArrowRightLeft,
  X,
  Search,
  MessageSquare,
  ChevronDown,
  Lock,
  LogIn,
  UserPlus
} from "lucide-react";

interface MutareStop {
  id: string;
  name: string;
  description: string;
  coords: { x: number; y: number };
  estStandardFare: number;
}

interface DriverOffer {
  driverId: string;
  driverName: string;
  vehicleDetails: string;
  rating: number;
  offeredFare: number;
  etaMinutes: number;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleName: string;
  vehiclePlate: string;
  rating: number;
  tripsCount: number;
  avatarColor: string;
  isActive: boolean;
  currentStopId: string;
  status: "idle" | "bidding" | "driving" | "resting";
  coords: { x: number; y: number };
}

interface BidBooking {
  id: string;
  riderName: string;
  riderRole: "Student" | "Staff";
  pickupStopId: string;
  dropoffStopId: string;
  riderOfferedFare: number;
  finalAgreedFare: number | null;
  seatsBooked: number;
  paymentMethod: "EcoCash" | "InBucks" | "CBZ Pay" | "Stanbic Wallet" | "Cash Guard" | "Cash";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  status: "Requested" | "Negotiating" | "Accepted" | "InTransit" | "Completed" | "Canceled";
  requestedAt: string;
  selectedDriverId: string | null;
  driverOffers: DriverOffer[];
}

function VroomLogo() {
  return (
    <div id="vroom-logo-card" className="relative flex-1 flex flex-col items-center justify-center p-6 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-md select-none text-stone-900 w-full min-h-[340px]">
      {/* Background blobs matching screenshot of logo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-48 h-48 rounded-full bg-[#f472b6]/40 blur-2xl font-sans"></div>
        <div className="absolute top-[5%] -right-[10%] w-44 h-44 rounded-full bg-[#fde047]/40 blur-2xl"></div>
        <div className="absolute -bottom-[10%] right-[10%] w-44 h-44 rounded-full bg-[#fb923c]/35 blur-2xl"></div>
        <div className="absolute top-[8%] right-[8%] w-10 h-10 rounded-full bg-[#c084fc]/35 blur-md"></div>
      </div>

      <img 
        src="assets/img/logo.png" 
        className="w-72 h-72 object-contain z-10 transition-transform duration-300 hover:scale-105" 
        alt="AU Vroom Logo" 
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
          const fb = document.getElementById("logo-fallback-design");
          if (fb) fb.classList.remove("hidden");
        }}
      />

      {/* Fallback designed manually to fit perfectly if image is blank */}
      <div id="logo-fallback-design" className="hidden z-10 flex flex-col items-center justify-center">
        <div className="text-black text-center font-black uppercase tracking-[0.15em] text-[13px] font-mono whitespace-nowrap bg-white/50 px-3 py-1 rounded border border-black/5 shadow-sm mb-3">
          No Waits , Just Vroom
        </div>
        <div className="relative w-36 h-36 flex flex-col items-center justify-center my-3">
          <div className="absolute w-28 h-28 rounded-full border-[3px] border-black flex items-center justify-center bg-white/40 shadow-inner">
            <div className="absolute w-24 h-24 rounded-full border border-black/5"></div>
          </div>
          <div className="relative z-20 flex flex-col items-center top-[-4px]">
            <div className="w-14 h-14 bg-white rounded-full border-2 border-black flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8c-.7 0-1.3.3-1.8.7C5.3 8.6 4 10 4 10s-2.7.6-4.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
                <path d="M6 13h12" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-[2px] w-28 flex flex-col items-center">
            <div className="w-28 h-5 rounded-[50%] border-2 border-black bg-transparent"></div>
            <div className="w-20 h-3.5 rounded-[50%] border border-black/60 bg-transparent -mt-[3px]"></div>
          </div>
        </div>
        <h3 className="text-black font-extrabold text-xl tracking-widest font-mono uppercase mt-2 bg-white/55 px-5 py-1.5 rounded-full border border-black/15 shadow-sm">
          VroomAU
        </h3>
      </div>
    </div>
  );
}

export default function App() {
  // Navigation & Role Configuration States
  const [activeTab, setActiveTab] = useState<"rider" | "driver" | "admin">("rider");
  const [viewMode, setViewMode] = useState<"transit" | "about" | "companion" | "login" | "signup">("transit");
  
  // User authentication state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: "Rider" | "Driver" } | null>(() => {
    try {
      const saved = localStorage.getItem("au_vroom_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authRole, setAuthRole] = useState<"Rider" | "Driver">("Rider");
  const [authFeedback, setAuthFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleAuthSubmit = (e: React.FormEvent, mode: "login" | "signup") => {
    e.preventDefault();
    setAuthFeedback(null);

    if (mode === "login") {
      if (!authEmail || !authPassword) {
        setAuthFeedback({ type: "error", msg: "Please fill in all credentials" });
        return;
      }
      // Simple mock validation
      const resolvedRole = authEmail.toLowerCase().includes("driver") ? "Driver" : "Rider";
      const resolvedName = authEmail.includes("@") 
        ? authEmail.split("@")[0].split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "Takudzwa Musora";
      
      const userObj = { name: resolvedName || "Takudzwa Musora", email: authEmail, role: resolvedRole as "Rider" | "Driver" };
      
      setCurrentUser(userObj);
      localStorage.setItem("au_vroom_user", JSON.stringify(userObj));
      
      // If student rider, update riderName automatically
      if (resolvedRole === "Rider") {
        setRiderName(userObj.name);
      } else {
        // If driver, set driver dashboard ID if matched
        const matchedDriver = drivers.find(d => d.name.toLowerCase().includes(userObj.name.toLowerCase()));
        if (matchedDriver) {
          setSimulatedActiveDriverId(matchedDriver.id);
        }
      }
      
      setAuthFeedback({ type: "success", msg: "Successfully authenticated!" });
      setTimeout(() => {
        setViewMode("transit");
        setAuthFeedback(null);
        setAuthEmail("");
        setAuthPassword("");
      }, 1000);
    } else {
      if (!authName || !authEmail || !authPassword) {
        setAuthFeedback({ type: "error", msg: "Please specify all account details" });
        return;
      }
      const userObj = { name: authName, email: authEmail, role: authRole };
      setCurrentUser(userObj);
      localStorage.setItem("au_vroom_user", JSON.stringify(userObj));
      
      // If student rider, update riderName automatically
      if (authRole === "Rider") {
        setRiderName(authName);
      } else {
        // If signed up as driver, dynamically seed them into drivers list of the client
        const newDrvId = `drv-${Date.now()}`;
        const newDriverObj: Driver = {
          id: newDrvId,
          name: authName,
          phone: "+263 77 " + Math.floor(1000000 + Math.random() * 9000000),
          vehicleName: "Nissan Elgrand Taxi (Premium)",
          vehiclePlate: "AU-" + Math.floor(100 + Math.random() * 900) + "-XY",
          rating: 5.0,
          tripsCount: 0,
          avatarColor: "bg-[#c20000] text-white",
          isActive: true,
          currentStopId: "stop-au",
          status: "idle",
          coords: { x: 20, y: 18 }
        };
        setDrivers(prev => [newDriverObj, ...prev]);
        setSimulatedActiveDriverId(newDrvId);
      }

      setAuthFeedback({ type: "success", msg: "Created account successfully!" });
      setTimeout(() => {
        setViewMode("transit");
        setAuthFeedback(null);
        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");
      }, 1000);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("au_vroom_user");
    setViewMode("transit");
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "Rider") {
      setRiderName(currentUser.name);
    }
  }, [currentUser]);
  
  // State from server
  const [stops, setStops] = useState<MutareStop[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [bookings, setBookings] = useState<BidBooking[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [apiMode, setApiMode] = useState<"Gemini" | "LocalFallback">("LocalFallback");
  const [loadingState, setLoadingState] = useState<boolean>(true);

  // Search Filter for Stops
  const [stopSearchQuery, setStopSearchQuery] = useState<string>("");

  // Rider Booking Flow Form
  const [riderName, setRiderName] = useState<string>("Takudzwa Musora");
  const [riderRole, setRiderRole] = useState<"Student" | "Staff">("Student");
  const [pickupStop, setPickupStop] = useState<string>("stop-au");
  const [dropoffStop, setDropoffStop] = useState<string>("stop-city");
  const [seatsCount, setSeatsCount] = useState<number>(1);
  const [proposedFare, setProposedFare] = useState<string>("3.00");
  const [paymentMethod, setPaymentMethod] = useState<"EcoCash" | "InBucks" | "CBZ Pay" | "Stanbic Wallet" | "Cash Guard" | "Cash">("EcoCash");

  // Counter Offering State for Passenger
  const [lastBiddedRide, setLastBiddedRide] = useState<BidBooking | null>(null);

  // Simulated EcoCash PIN pop-up (Zimbabwe USSD flow)
  const [showUssdModal, setShowUssdModal] = useState<boolean>(false);
  const [ussdPin, setUssdPin] = useState<string>("");
  const [ussdBookingPayload, setUssdBookingPayload] = useState<any>(null);

  // AI Chat Assistant State
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Salibonani! I am your AI Vroom Travel Companion. Ask me anything about Christmas Pass altitudes, fair pricing bids from Sakubva, or how to reach Penhalonga!",
      time: "11:15 AM"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Simulated interactive driver panel states
  const [simulatedActiveDriverId, setSimulatedActiveDriverId] = useState<string>("drv-tinashe");
  const [driverCounterAmount, setDriverCounterAmount] = useState<string>("3.50");
  const [driverEta, setDriverEta] = useState<number>(5);

  // Map Animation Coordinates Tick state
  const [gpsTick, setGpsTick] = useState<number>(0);
  const mapPathRef = useRef<SVGPathElement>(null);

  // Fetch state on mount
  const loadStateFromServer = async () => {
    try {
      setLoadingState(true);
      const stateRes = await fetch("/api/state");
      const stateData = await stateRes.json();
      setStops(stateData.stops);
      setDrivers(stateData.drivers);
      setBookings(stateData.bookings);
      setNotifications(stateData.notifications);
      setApiMode(stateData.apiMode);

      // Restore active negotiating ride if any
      const activeObj = stateData.bookings.find(
        (b: BidBooking) => b.riderName === riderName && (b.status === "Requested" || b.status === "Negotiating" || b.status === "Accepted" || b.status === "InTransit")
      );
      if (activeObj) {
        setLastBiddedRide(activeObj);
      }
    } catch (e) {
      console.error("Failed to load state:", e);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    loadStateFromServer();
  }, []);

  // Soft poll simulation increments
  useEffect(() => {
    const timer = setInterval(() => {
      setGpsTick(t => t + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Update map visual layout and driver simulator movement paths
  useEffect(() => {
    if (stops.length === 0) return;

    setDrivers(prevDrivers => {
      return prevDrivers.map(drv => {
        if (!drv.isActive) return drv;

        // If driving and has booking, interpolate movement towards destination
        if (drv.status === "driving") {
          const activeRide = bookings.find(b => b.selectedDriverId === drv.id && (b.status === "InTransit" || b.status === "Accepted"));
          if (activeRide) {
            const startStop = stops.find(s => s.id === activeRide.pickupStopId);
            const destinationStop = stops.find(s => s.id === activeRide.dropoffStopId);
            if (startStop && destinationStop) {
              const fraction = (gpsTick % 6) / 5; // move from 0 to 1
              const newX = startStop.coords.x + (destinationStop.coords.x - startStop.coords.x) * fraction;
              const newY = startStop.coords.y + (destinationStop.coords.y - startStop.coords.y) * fraction;
              return {
                ...drv,
                coords: { x: Math.round(newX), y: Math.round(newY) }
              };
            }
          }
        }

        // Otherwise keep gently drifting near base stop to indicate live tracking activity
        const baseStop = stops.find(s => s.id === drv.currentStopId);
        if (baseStop) {
          const oscX = Math.sin(gpsTick + drv.name.charCodeAt(0)) * 1.5;
          const oscY = Math.cos(gpsTick + drv.name.charCodeAt(0)) * 1.5;
          return {
            ...drv,
            coords: { x: baseStop.coords.x + oscX, y: baseStop.coords.y + oscY }
          };
        }
        return drv;
      });
    });
  }, [gpsTick, bookings, stops]);

  // Set suggested base fare when pickup/dropoff changes
  useEffect(() => {
    if (stops.length > 0) {
      const pStop = stops.find(s => s.id === pickupStop);
      const dStop = stops.find(s => s.id === dropoffStop);
      if (pStop && dStop) {
        // Calculate estimated fair
        const distanceValue = Math.sqrt(
          Math.pow(pStop.coords.x - dStop.coords.x, 2) + 
          Math.pow(pStop.coords.y - dStop.coords.y, 2)
        );
        // Map to standard Mutare pricing points
        const calculated = (distanceValue / 12) + 1.50;
        setProposedFare(calculated.toFixed(2));
      }
    }
  }, [pickupStop, dropoffStop, stops]);

  // Register Vroom Bid Booking
  const handleProposeRide = async () => {
    if (pickupStop === dropoffStop) {
      alert("Uh oh! Pick-up and destination points must be different nodes on the Mutare map.");
      return;
    }

    const payload = {
      riderName,
      riderRole,
      pickupStopId: pickupStop,
      dropoffStopId: dropoffStop,
      riderOfferedFare: parseFloat(proposedFare) || 2.50,
      seatsBooked: seatsCount,
      paymentMethod
    };

    if (paymentMethod !== "Cash Guard" && paymentMethod !== "Cash") {
      // Trigger USSD Modal popup
      setUssdBookingPayload(payload);
      setShowUssdModal(true);
    } else {
      executeRegisterProposal(payload);
    }
  };

  const executeRegisterProposal = async (payload: any) => {
    try {
      const res = await fetch("/api/bookings/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setDrivers(data.drivers);
        // Find latest matching proposal
        const activeProp = data.bookings.find((b: BidBooking) => b.riderName === riderName);
        if (activeProp) {
          setLastBiddedRide(activeProp);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const verifyUssdPinCode = () => {
    if (ussdPin.length < 4) {
      alert("Authenticate by entering your 4-digit Sandbox Wallet PIN code first.");
      return;
    }
    setShowUssdModal(false);
    setUssdPin("");
    if (ussdBookingPayload) {
      executeRegisterProposal(ussdBookingPayload);
      setUssdBookingPayload(null);
    }
  };

  // Ride accepted
  const handleAcceptDriverOffer = async (drvOffer: DriverOffer) => {
    if (!lastBiddedRide) return;
    try {
      const res = await fetch("/api/bookings/accept-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: lastBiddedRide.id,
          driverId: drvOffer.driverId,
          agreedFare: drvOffer.offeredFare
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setDrivers(data.drivers);
        setLastBiddedRide(data.booking);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Passenger Cancels / Declines Ride Negotiation
  const handleCancelBid = async () => {
    if (!lastBiddedRide) return;
    try {
      const res = await fetch("/api/bookings/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: lastBiddedRide.id,
          status: "Canceled"
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setLastBiddedRide(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Counter from the driver simulation console
  const handleDriverSubmitCounter = async (targetBookingId: string) => {
    try {
      const res = await fetch("/api/bookings/driver-counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: targetBookingId,
          driverId: simulatedActiveDriverId,
          counterFare: parseFloat(driverCounterAmount) || 3.00,
          etaMinutes: driverEta
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        // Refresh local bidded state if matches active passenger rider
        if (lastBiddedRide && lastBiddedRide.id === targetBookingId) {
          setLastBiddedRide(data.booking);
        }
        alert("Counter-offered bid sent out successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Driver Simulated: Mark journey as Complete or transit
  const handleUpdateJourneyStatus = async (bookingId: string, status: "InTransit" | "Completed") => {
    try {
      const res = await fetch("/api/bookings/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setDrivers(data.drivers);
        const match = data.bookings.find((b: BidBooking) => b.id === bookingId);
        if (match) {
          if (status === "Completed") {
            setLastBiddedRide(null);
          } else {
            setLastBiddedRide(match);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send AI companion question
  const sendCompanionQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const queryText = chatPrompt;
    setChatPrompt("");
    setChatLoading(true);

    setChatMessages(prev => [...prev, { sender: "user", text: queryText, time: "Now" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryText })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: "bot", text: data.responseText, time: "Now" }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch("/api/bookings/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setDrivers(data.drivers);
        setNotifications(data.notifications);
        setLastBiddedRide(null);
        alert("Mutare sandbox simulator states reverted to factory seed settings!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Analytics totals for stats summary block
  const completedRides = bookings.filter(b => b.status === "Completed");
  const liveRides = bookings.filter(b => b.status === "Negotiating" || b.status === "Accepted" || b.status === "InTransit");
  const totalRidesRevenue = completedRides.reduce((sum, b) => sum + (b.finalAgreedFare || 0), 0);

  // Filters stops list according to input query for fast accessibility
  const filteredStops = stops.filter(s => 
    s.name.toLowerCase().includes(stopSearchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(stopSearchQuery.toLowerCase())
  );

  return (
    <div id="vroom-app-root" className="min-h-screen bg-stone-100 font-sans text-stone-900 flex flex-col selection:bg-red-700 selection:text-white">
      
      {/* 1. AU VROOM BRANDED HEADER & DESCRIPTIVE NAV SWITCHER */}
      <div id="au-vroom-main-header" className="bg-[#c20000] text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl flex items-center justify-center border border-red-800 shadow-md w-11 h-11 relative">
              <img 
                src="assets/img/logo.png" 
                className="w-8 h-8 object-contain" 
                alt="AU Vroom Logo" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = document.getElementById("header-logo-fallback");
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
              <span id="header-logo-fallback" className="hidden text-xl">🚐</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider font-mono flex items-center gap-2 cursor-pointer" onClick={() => setViewMode("transit")}>
                AU VROOM
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-red-100 opacity-90 block font-mono">
                Don’t Wait, Just Vroom
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
            {/* Nav toggles to switch between the Live tracker simulator workspace, About system, and AI Companion */}
            <div className="flex bg-black/25 p-1 rounded-xl border border-red-500/20 shadow-inner">
              <button 
                onClick={() => setViewMode("transit")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                  viewMode === "transit" 
                    ? "bg-white text-[#c20000] shadow-sm font-black" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                Live Transit
              </button>
              <button 
                onClick={() => setViewMode("about")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                  viewMode === "about" 
                    ? "bg-white text-[#c20000] shadow-sm font-black" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                About System
              </button>
              <button 
                onClick={() => setViewMode("companion")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                  viewMode === "companion" 
                    ? "bg-white text-[#c20000] shadow-sm font-black" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                AI Companion
              </button>
            </div>

            {/* Login / Dynamic User Navigation Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-black/25 pl-2 pr-3 py-1 rounded-xl border border-red-500/20">
                <div className="w-8 h-8 rounded-lg bg-white text-[#c20000] font-black flex items-center justify-center text-xs shadow-inner">
                  {currentUser.name ? currentUser.name.split(" ").map(n => n.charAt(0)).join("").substring(0, 2) : "AU"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black font-mono text-white tracking-wide truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[8px] font-mono text-red-200">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-black/30 hover:bg-black/50 text-white p-1 rounded transition-colors ml-1.5"
                  title="Log Out"
                >
                  <LogOut className="w-3 h-3 text-red-300" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setViewMode("login")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                  viewMode === "login" || viewMode === "signup"
                    ? "bg-amber-400 text-stone-900 font-extrabold border border-amber-500"
                    : "bg-white hover:bg-stone-100 text-[#c20000]"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
            {viewMode === "about" && (
          /* ABOUT SYSTEM DOCUMENTATION VIEW WITH SCREENSHOT FOOTER */
          <div id="about-system-view" className="flex flex-col gap-10 animate-fade-in text-left">
            
            {/* Header intro slogan banner with logo integration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              <section className="lg:col-span-8 bg-stone-950 text-stone-100 py-8 px-6 md:py-10 md:px-8 rounded-2xl border border-stone-800 shadow-xl flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-3">
                  <span className="text-[#f87171] font-mono text-xs uppercase tracking-widest font-black flex items-center gap-2 w-fit bg-red-950/40 px-3 py-1 rounded-full border border-red-500/20">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    Modernizing Campus Transportation
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    🚐💨 AU VROOM — Don’t Wait, Just Vroom
                  </h2>
                  <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-3xl">
                    AU VROOM is a full-stack, mobile-first campus transportation platform designed to modernize shuttle services at Africa University. It combines real-time shuttle tracking, seat booking, on-demand rides, and digital payments into one seamless student-centered experience.
                  </p>
                  <p className="text-[11px] text-stone-400 font-mono italic max-w-3xl border-l-2 border-red-650 pl-3.5 py-1">
                    Built from scratch with a production-grade architecture inspired by modern ride-hailing platforms (Uber-style systems) and reimagined specifically for Mutare campus mobility.
                  </p>
                </div>

                {/* Why AU Vroom Details */}
                <div className="mt-4 bg-stone-900/60 rounded-xl p-4 border border-stone-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-white border-b border-stone-800 pb-1.5">
                    <Shield className="w-4 h-4 text-[#ef4444]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                      Why AU VROOM? Core Capabilities
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-300">
                    <div className="flex items-start gap-2 bg-stone-950/40 p-2.5 rounded-lg border border-stone-800/50">
                      <span className="text-[#ef4444] font-black">⚡</span>
                      <p><strong>Rider Price Bids:</strong> Name your budget and hold instant transactions with local drivers.</p>
                    </div>
                    <div className="flex items-start gap-2 bg-stone-950/40 p-2.5 rounded-lg border border-stone-800/50">
                      <span className="text-[#ef4444] font-black">🛰️</span>
                      <p><strong>Live GPS Tracking:</strong> Watch shuttle movements transition across the mountain pass.</p>
                    </div>
                    <div className="flex items-start gap-2 bg-stone-950/40 p-2.5 rounded-lg border border-stone-800/50">
                      <span className="text-[#ef4444] font-black">💳</span>
                      <p><strong>Digital Payments:</strong> EcoCash, InBucks, and CBZ sandbox corridors.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* BRAND LOGO CARD */}
              <div className="lg:col-span-4 flex items-stretch">
                <VroomLogo />
              </div>

            </div>

            {/* Bento Grid layout inside About */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Problem statement card */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between text-left border-t-4 border-t-[#c20000]">
                <div className="flex flex-col gap-3">
                  <div className="bg-[#c20000]/10 text-[#c20000] p-2.5 rounded-lg w-fit">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-widest font-mono">
                    The Problem Statement
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Campus transport systems often suffer from uncertainty around shuttle arrival times, overcrowding and missed rides, lack of real-time visibility, and no structured data for planning and optimization.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-bold text-[#c20000] font-mono flex items-center gap-1">
                  <span>AU VROOM solves this transport gridlock</span>
                  <span>➔</span>
                </div>
              </div>

              {/* What AU Vroom is card */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between text-left border-t-4 border-t-stone-800">
                <div className="flex flex-col gap-3">
                  <div className="bg-stone-100 text-stone-800 p-2.5 rounded-lg w-fit">
                    <Bus className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-widest font-mono">
                    What AU VROOM Is
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    It is a full-stack transport management system with live GPS-based vehicle tracking, fixed-route shuttle monitoring, on-demand ride requests (Flexi drivers), seat booking, and digital payments.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-bold text-stone-800 font-mono flex items-center gap-1">
                  <span>Modern micro-route orchestration</span>
                  <span>⚡</span>
                </div>
              </div>

              {/* Explore Destinations card */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between text-left border-t-4 border-t-amber-500">
                <div className="flex flex-col gap-3">
                  <div className="bg-amber-100 text-amber-700 p-2.5 rounded-lg w-fit">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#c20000] uppercase tracking-widest font-mono">
                    Explore Destinations
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Standard pricing ranges from Africa University campus to Christmas Pass ridge and Sakubva. Standard stations are listed on the interactive workspace maps.
                  </p>
                </div>
                <div className="mt-4 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-[10.5px] font-mono text-stone-600 flex justify-between">
                  <span>Available Stations:</span>
                  <span className="font-extrabold text-[#c20000]">{stops.length} stations</span>
                </div>
              </div>

            </section>

            {/* SCREENSHOT REPLICATION BANNER AT BOTTOM OF ABOUT PAGE */}
            <div className="bg-[#c20000] border-2 border-red-800 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl flex items-center justify-center border border-red-800 shadow-md">
                  <span className="text-2xl select-none">🛰️</span>
                </div>
                <div className="text-left text-white">
                  <h4 className="text-sm font-bold uppercase tracking-wider font-mono">AU VROOM GPS Network Controller</h4>
                  <p className="text-[10px] text-red-100 font-mono">MUTARE GEODEFENSE: {stops.length} ACTIVE STOPS | {bookings.length} BIDS PROCESSED</p>
                </div>
              </div>

              <div className="text-white text-xs font-mono border border-red-500/30 bg-black/20 rounded-lg px-3 py-1.5">
                Mutare Base Center
              </div>
            </div>
          </div>
        )}

        {viewMode === "transit" && (
          /* WORKSPACE RIDE-BOOKING SIMULATION INTERFACE */
          <div id="live-workspace-view" className="flex flex-col gap-6 animate-fade-in">
            
            {/* 3. SIMULATOR WORKSPACE LIVE TITLE & STATUS BAR */}
            <section className="text-left border-b border-stone-200 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-stone-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="text-[#c20000]">●</span> Live Transit Center
                  </h2>
                  <p className="text-xs text-stone-500">
                    Plot coordinates on the mountain road, view passenger proposals, simulate transaction requests, or ask the Gemini GPS assistant.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 font-mono text-xs bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-300">
                  <span className="text-stone-700 font-bold">MUTARE DATABASE:</span>
                  <span className="text-[#c20000] font-black">{stops.length} STOPS</span>
                  <span className="text-stone-400">|</span>
                  <span className="text-[#c20000] font-black">{bookings.length} BIDS active</span>
                </div>
              </div>
            </section>

            {/* 4. HIGH FIDELITY TWO-COLUMN RIDE-BOOKING WORKSPACE BODY */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT 7-COLUMNS: VROOM INTERACTIVE MUTARE SIMULATOR MAP */}
              <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Map Frame Card */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#c20000] animate-ping" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                    Mutare mountain road route network (Vroom Tracker)
                  </h3>
                </div>
                <span className="text-[9px] text-[#c20000] bg-red-50 border border-red-100 px-2 py-0.5 rounded font-mono">
                  Scale: 1 : 15,000 km
                </span>
              </div>

              {/* Interactive SVG City & Pass Map */}
              <div className="relative bg-stone-950 rounded-xl aspect-[16/10] w-full border border-stone-850 overflow-hidden group">
                
                {/* SVG Visual lines for roads and Christmas Mountain Pass contours */}
                <svg className="absolute inset-0 w-full. h-full opacity-35" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Contour Mountain Topography Hatching Lines */}
                  <path d="M 0,20 Q 20,30 40,25 T 80,15 T 100,5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <path d="M 0,35 Q 25,45 50,40 T 90,30 T 100,15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <path d="M 0,50 Q 30,60 60,55 T 100,35" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <path d="M 0,70 Q 35,80 70,75 T 100,60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

                  {/* Primary mountain ridge backbone (Christmas Pass highway path) */}
                  <path 
                    d="M 20,18 L 45,28 L 62,48 L 50,70 L 75,82"
                    fill="none" 
                    stroke="#fee2e2" 
                    strokeWidth="2" 
                    strokeOpacity="0.12"
                  />
                  
                  {/* Secondary Forbes border connection */}
                  <path 
                    d="M 62,48 L 88,40"
                    fill="none" 
                    stroke="#fee2e2" 
                    strokeWidth="1.5" 
                    strokeOpacity="0.12"
                  />

                  {/* High Density zone border wireframe outline */}
                  <path 
                    d="M 30,56 L 50,70"
                    fill="none" 
                    stroke="rgba(194,0,0,0.18)" 
                    strokeWidth="3" 
                    strokeDasharray="1,2"
                  />
                </svg>

                {/* Animated current booking path line */}
                {lastBiddedRide && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {(() => {
                      const fromNode = stops.find(s => s.id === lastBiddedRide.pickupStopId);
                      const toNode = stops.find(s => s.id === lastBiddedRide.dropoffStopId);
                      if (fromNode && toNode) {
                        return (
                          <g>
                            <line 
                              x1={fromNode.coords.x} 
                              y1={fromNode.coords.y} 
                              x2={toNode.coords.x} 
                              y2={toNode.coords.y} 
                              stroke="#c20000" 
                              strokeWidth="2" 
                              strokeDasharray="4,3" 
                              className="animate-[pulse_1s_infinite]"
                            />
                            <line 
                              x1={fromNode.coords.x} 
                              y1={fromNode.coords.y} 
                              x2={toNode.coords.x} 
                              y2={toNode.coords.y} 
                              stroke="#fff" 
                              strokeWidth="0.5" 
                            />
                            {/* Animated rider bullet */}
                            <circle cx={fromNode.coords.x} cy={fromNode.coords.y} r="2.5" fill="#fca5a5" className="animate-ping" />
                          </g>
                        );
                      }
                      return null;
                    })()}
                  </svg>
                )}

                {/* Draw stops on Map */}
                {stops.map(st => {
                  const isFiltered = stopSearchQuery && !st.name.toLowerCase().includes(stopSearchQuery.toLowerCase());
                  const isPickup = pickupStop === st.id;
                  const isDropoff = dropoffStop === st.id;

                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        if (activeTab === "rider") {
                          setPickupStop(st.id);
                        } else {
                          setPickupStop(st.id);
                        }
                      }}
                      style={{ left: `${st.coords.x}%`, top: `${st.coords.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-300 z-20 group/nodemarker ${
                        isFiltered ? "opacity-25" : "opacity-100"
                      }`}
                    >
                      {/* Active selections indicator halos */}
                      {isPickup && (
                        <span className="absolute -inset-5 rounded-full border border-red-500 animate-pulse bg-red-900/10"></span>
                      )}
                      {isDropoff && (
                        <span className="absolute -inset-5 rounded-full border border-stone-200 animate-pulse bg-stone-100/10"></span>
                      )}

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                        isPickup ? "bg-[#c20000] border-red-500 text-white shadow-xl scale-110" :
                        isDropoff ? "bg-white border-stone-700 text-stone-950 shadow-xl scale-110" :
                        "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850 hover:text-white"
                      }`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>

                      {/* Floating tooltip badge */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-750 text-[9px] text-stone-150 px-2 py-0.5 rounded whitespace-nowrap opacity-90 group-hover/nodemarker:opacity-100 shadow-md group-hover/nodemarker:scale-105 transition-all pointer-events-none">
                        <span className="font-semibold block text-white">{st.name}</span>
                        <span className="text-[7.5px] text-stone-400 font-mono block">Base fare: ${st.estStandardFare.toFixed(2)} USD</span>
                      </div>
                    </button>
                  );
                })}

                {/* Moving Driver Car badges */}
                {drivers.filter(d => d.isActive).map(drv => {
                  const isCurrentDriverDriving = drv.status === "driving";
                  return (
                    <div
                      key={drv.id}
                      style={{
                        left: `${drv.coords.x}%`,
                        top: `${drv.coords.y}%`,
                        transition: "left 4s cubic-bezier(0.25, 1, 0.5, 1), top 4s cubic-bezier(0.25, 1, 0.5, 1)"
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                    >
                      <div className={`px-2 py-1.5 rounded border shadow-xl flex items-center gap-1 font-mono text-[8.5px] transition-colors ${
                        drv.status === "driving" ? "bg-stone-100 text-stone-950 border-white scale-105" :
                        drv.id === simulatedActiveDriverId ? "bg-amber-550 text-white border-amber-400" :
                        "bg-[#c20000] text-stone-100 border-red-500"
                      }`}>
                        <Bus className="w-3 h-3" />
                        <span className="font-bold truncate max-w-[60px]">{drv.name.split(" ")[0]}</span>
                      </div>

                      <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-stone-950 ${
                        drv.status === "driving" ? "bg-emerald-400" : "bg-amber-400"
                      }`}></span>
                    </div>
                  );
                })}

              </div>

              {/* Map Filter & Highlights Helper */}
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-stone-600 text-xs flex flex-wrap justify-between items-center gap-2">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="w-3 h-3 rounded-full bg-[#c20000] inline-block"></span>
                    Rider Pickup
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="w-3 h-3 rounded bg-white border border-stone-400 inline-block"></span>
                    Rider Drop-off
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="w-3 h-3 rounded bg-stone-900 border border-stone-750 inline-block text-white flex items-center justify-center text-[7px]">✓</span>
                    Kombi/Taxi Base
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono italic">
                  *Christmas Pass commute increases fuel by approx 35% compared to bypasses.
                </span>
              </div>

            </div>

            {/* TAB-STOPS DIRECT SELECTION GRID */}
            <div id="all-stops" className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-stone-150 pb-3 mb-4">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">
                    Browse Mutare Commute Stations
                  </span>
                  <span className="text-[10px] text-[#c20000] font-semibold">
                    (Click any row to book)
                  </span>
                </div>
                
                {/* Compact Station Search bar */}
                <div className="flex bg-stone-50 border border-stone-200 rounded-lg overflow-hidden items-center max-w-xs w-full">
                  <input
                    type="text"
                    value={stopSearchQuery}
                    onChange={(e) => setStopSearchQuery(e.target.value)}
                    placeholder="Search route stations..."
                    className="w-full bg-transparent px-2.5 py-1 text-[11px] focus:outline-none placeholder:text-stone-300 font-mono"
                  />
                  {stopSearchQuery && (
                    <button 
                      onClick={() => setStopSearchQuery("")}
                      className="bg-[#c20000] text-white px-2.5 py-1 text-[9px] uppercase font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[195px] overflow-y-auto">
                {filteredStops.map(st => {
                  const isPickup = pickupStop === st.id;
                  const isDropoff = dropoffStop === st.id;

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setPickupStop(st.id);
                        addNotification && addNotification(`Selected ${st.name} as ride origin.`);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer text-left transition-all hover:border-[#c20000] ${
                        isPickup ? "bg-red-50/50 border-[#c20000]" : "bg-stone-50 border-stone-250/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <strong className="text-xs text-stone-850 block">{st.name}</strong>
                        <span className="text-[10px] font-mono text-[#c20000] bg-white border border-red-100 px-1.5 py-0.2 rounded font-bold whitespace-nowrap">
                          Est: ${st.estStandardFare.toFixed(2)} USD
                        </span>
                      </div>
                      <p className="text-[10.5px] text-stone-500 mt-1 leading-normal truncate">{st.description}</p>
                    </div>
                  );
                })}
                {filteredStops.length === 0 && (
                  <p className="text-xs text-stone-400 py-3 text-center sm:col-span-2">No matching Mutare stations found for "{stopSearchQuery}"</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT 5-COLUMNS: VROOM BID WORKSPACE & DRIVER NEGOTIATION */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* IN-APP TAB SYSTEM */}
            <div className="flex bg-stone-200 p-1 rounded-lg border border-stone-300">
              <button 
                onClick={() => setActiveTab("rider")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${
                  activeTab === "rider" ? "bg-[#c20000] text-white shadow-sm" : "text-stone-700 hover:text-stone-900"
                }`}
              >
                Rider Portal
              </button>
              <button 
                onClick={() => setActiveTab("driver")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${
                  activeTab === "driver" ? "bg-[#c20000] text-white shadow-sm" : "text-stone-700 hover:text-stone-900"
                }`}
              >
                Driver Room
              </button>
              <button 
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${
                  activeTab === "admin" ? "bg-[#c20000] text-white shadow-sm" : "text-stone-700 hover:text-stone-900"
                }`}
              >
                Control Tower
              </button>
            </div>

            {/* TAB CONTENTS 1: PASSENGER / RIDER PORTAL BIDDING HUB */}
            {activeTab === "rider" && (
              <div id="passenger-portal-view" className="flex flex-col gap-5">
                
                {/* PROPOSE FARE FORM CARD */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider font-mono">
                      "Name Your Fare" Ride Proposal
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Rider sets the price. Drivers counter back with their own terms.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    
                    {/* Rider details */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase font-mono block mb-1">Rider Name</label>
                        <input 
                          type="text" 
                          value={riderName}
                          onChange={(e) => setRiderName(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#c20000]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase font-mono block mb-1">AU Affiliation</label>
                        <select 
                          value={riderRole}
                          onChange={(e) => setRiderRole(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="Student">Active Student</option>
                          <option value="Staff">University Faculty</option>
                        </select>
                      </div>
                    </div>

                    {/* From & To Station nodes */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase font-mono block mb-1">From (Origin)</label>
                        <select 
                          value={pickupStop}
                          onChange={(e) => setPickupStop(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-850"
                        >
                          {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase font-mono block mb-1">To (Destination)</label>
                        <select 
                          value={dropoffStop}
                          onChange={(e) => setDropoffStop(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-850"
                        >
                          {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Numeric Bid Input Box */}
                    <div className="border-t border-stone-100 pt-3 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                        <span>SUGGESTED BID FARE</span>
                        <span className="font-semibold text-stone-800">
                          Est: ${((stops.find(s => s.id === pickupStop)?.estStandardFare || 1.50) + (stops.find(s => s.id === dropoffStop)?.estStandardFare || 1.50)).toFixed(2)} USD
                        </span>
                      </div>
                      
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-600 font-bold">
                          $
                        </div>
                        <input 
                          type="number" 
                          step="0.10"
                          value={proposedFare}
                          onChange={(e) => setProposedFare(e.target.value)}
                          className="w-full bg-stone-50 border-2 border-stone-200 rounded-lg pl-8 pr-20 py-3 font-mono font-black text-lg text-stone-900 focus:outline-none focus:border-[#c20000]"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] font-mono text-stone-400">
                          USD CASH / WALLET
                        </div>
                      </div>
                    </div>

                    {/* Seat request count & Wallet provider */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase font-mono block mb-1">Riders</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="4" 
                          value={seatsCount}
                          onChange={(e) => setSeatsCount(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 uppercase font-mono block mb-1">Zimbabwe Gateway</label>
                        <select 
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-200 rounded px-1.5 py-1 text-xs text-stone-850 focus:outline-none"
                        >
                          <option value="EcoCash">EcoCash Mobile PIN</option>
                          <option value="InBucks">InBucks USD</option>
                          <option value="CBZ Pay">CBZ Wallet Pay</option>
                          <option value="Stanbic Wallet">Stanbic Wallet</option>
                          <option value="Cash Guard">Zimbabwe Cash Handover</option>
                          <option value="Cash">Cash Box (Physical Handover)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleProposeRide}
                      disabled={lastBiddedRide && (lastBiddedRide.status === "InTransit" || lastBiddedRide.status === "Accepted")}
                      className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest mt-2 transition-all flex items-center justify-center gap-2 shadow-sm ${
                        lastBiddedRide && (lastBiddedRide.status === "InTransit" || lastBiddedRide.status === "Accepted")
                          ? "bg-stone-200 border border-stone-300 text-stone-500 cursor-not-allowed"
                          : "bg-[#c20000] hover:bg-[#a30000] text-white font-extrabold border-2 border-red-700/25 active:scale-95"
                      }`}
                    >
                      <Coins className="w-4 h-4 text-rose-300" />
                      Propose My Fare ${parseFloat(proposedFare) || 0} USD
                    </button>

                  </div>
                </div>

                {/* PASSENGER REALTIME BID NEGOTIATOR PANEL */}
                {lastBiddedRide && (
                  <div className="bg-[#a30000] text-white border-2 border-red-700 rounded-xl p-5 shadow-lg flex flex-col gap-4 animate-fade-in relative overflow-hidden">
                    
                    {/* Visual pattern background overlay */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-radial pointer-events-none"></div>

                    <div className="flex justify-between items-start border-b border-red-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-black/45 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                          Negotiating Bids (Vroom)
                        </span>
                        <h4 className="text-xs text-stone-100 font-mono mt-1">
                          Session: {lastBiddedRide.id} ({lastBiddedRide.requestedAt})
                        </h4>
                      </div>
                      <button 
                        onClick={handleCancelBid}
                        className="text-white hover:text-red-100 bg-red-950/40 p-1.5 rounded-full transition-colors"
                        title="Cancel ride bid"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Trip details overview */}
                    <div className="bg-red-950/45 p-3 rounded-lg border border-red-800 text-xs flex flex-col gap-1 text-red-100 leading-normal">
                      <span><strong>Origin Stop:</strong> {stops.find(s => s.id === lastBiddedRide.pickupStopId)?.name}</span>
                      <span><strong>Destination:</strong> {stops.find(s => s.id === lastBiddedRide.dropoffStopId)?.name}</span>
                      <span><strong>Your Offered Base Fare:</strong> <strong className="text-yellow-300">$ {lastBiddedRide.riderOfferedFare.toFixed(2)} USD</strong></span>
                      <span className="flex items-center gap-1 mt-1 text-[10.5px]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        Status: <strong className="uppercase font-mono text-yellow-300">{lastBiddedRide.status}</strong>
                      </span>
                    </div>

                    {/* Driver Bid counters list */}
                    {lastBiddedRide.status === "Negotiating" && (
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-bold text-red-100 tracking-wider">
                          Offers received from Mutare Drivers:
                        </span>

                        <div className="flex flex-col gap-2 max-h-[195px] overflow-y-auto">
                          {lastBiddedRide.driverOffers.map(offer => (
                            <div 
                              key={offer.driverId}
                              className="bg-white text-stone-900 rounded-lg p-3.5 border border-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition-shadow"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-xs text-stone-900">{offer.driverName}</strong>
                                  <span className="text-[10px] text-stone-500 font-mono flex items-center gap-0.5">
                                    ★ {offer.rating} • {drivers.find(d => d.id === offer.driverId)?.tripsCount} trips
                                  </span>
                                </div>
                                <span className="text-[10.5px] text-stone-500 font-mono block">
                                  Vehicle: {offer.vehicleDetails}
                                </span>
                                <span className="text-[10.5px] text-stone-600 block mt-0.5">
                                  ⏱ ETA: <strong>{offer.etaMinutes} mins</strong> away
                                </span>
                              </div>

                              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                                <span className="text-sm font-black text-rose-750 font-mono mr-2">
                                  ${offer.offeredFare.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => handleAcceptDriverOffer(offer)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-mono text-[10px] px-3.5 py-1.5 rounded transition-all uppercase tracking-wide"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          ))}

                          {lastBiddedRide.driverOffers.length === 0 && (
                            <div className="text-center py-4 bg-red-950/20 border border-red-800 rounded-lg">
                              <span className="text-[10.5px] text-red-200">Waiting for driver connections. Try countering in the 'Driver Room' tab to simulate a driver bid!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Accepted status tracker screen */}
                    {lastBiddedRide.status === "Accepted" && (
                      <div className="bg-white text-stone-950 rounded-lg p-4 border border-emerald-500 flex flex-col gap-3 animate-pulse">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          <strong className="text-xs uppercase font-mono tracking-wide">Driver Assigned successfully!</strong>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-normal">
                          {drivers.find(d => d.id === lastBiddedRide.selectedDriverId)?.name} is setting up GPS systems to pick you up at {stops.find(s => s.id === lastBiddedRide.pickupStopId)?.name} for <strong className="text-emerald-700 font-bold">${lastBiddedRide.finalAgreedFare?.toFixed(2)} USD</strong>.
                        </p>
                      </div>
                    )}

                    {/* InTransit simulation screen */}
                    {lastBiddedRide.status === "InTransit" && (
                      <div className="bg-white text-stone-950 rounded-lg p-4 border border-blue-500 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Bus className="w-5 h-5 animate-bounce flex-shrink-0" />
                          <strong className="text-xs uppercase font-mono tracking-wide">Trip In Transit Loop</strong>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-normal">
                          Safely crossing Christmas Pass scenic highway road towards your final drop-off at {stops.find(s => s.id === lastBiddedRide.dropoffStopId)?.name}. Feel the mountain breeze.
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENTS 2: DRIVER SIMULATION CENTER (INBOX WORKSPACE AND COUNTERS) */}
            {activeTab === "driver" && (
              <div id="driver-portal-view" className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                
                {/* SELECT ACTIVE SIMULATED DRIVER */}
                <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-tight font-mono">Driver Cockpit</h4>
                    <span className="text-[10px] text-stone-400">Play/Control the drivers listed on the map</span>
                  </div>
                  
                  <select
                    value={simulatedActiveDriverId}
                    onChange={(e) => setSimulatedActiveDriverId(e.target.value)}
                    className="bg-stone-50 border border-stone-250 text-xs font-mono rounded px-2.5 py-1 text-stone-800 focus:outline-none"
                  >
                    {drivers.map(drv => (
                      <option key={drv.id} value={drv.id}>{drv.name} ({drv.vehicleName.split(" ")[0]})</option>
                    ))}
                  </select>
                </div>

                {/* Driver profile status info */}
                {(() => {
                  const currentSimDrv = drivers.find(d => d.id === simulatedActiveDriverId);
                  if (!currentSimDrv) return null;
                  return (
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-250/60 grid grid-cols-2 gap-2 text-xs text-stone-700 font-mono">
                      <span>Driver: <strong>{currentSimDrv.name}</strong></span>
                      <span>Phone: <strong className="text-[10.5px]">{currentSimDrv.phone}</strong></span>
                      <span className="truncate">Car: <strong>{currentSimDrv.vehicleName}</strong></span>
                      <span>Trips Logged: <strong>{currentSimDrv.tripsCount}</strong></span>
                      <span className="col-span-2 text-[#c20000]">Currently stationed near: <strong>{stops.find(s => s.id === currentSimDrv.currentStopId)?.name}</strong></span>
                    </div>
                  );
                })()}

                {/* Active passenger bids in Driver's inbox */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-[10.5px] font-bold text-[#c20000] uppercase tracking-wider font-mono">
                    Incoming Bidding Requests Terminal:
                  </span>

                  <div className="flex flex-col gap-3">
                    {bookings.filter(b => b.status !== "Completed" && b.status !== "Canceled").length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-stone-300 rounded-lg bg-stone-50 flex flex-col items-center gap-1">
                        <HelpCircle className="w-6 h-6 text-stone-400 animate-spin" />
                        <span className="text-xs text-stone-700 font-bold">No active rider request available.</span>
                        <p className="text-[10px] text-stone-450 max-w-xs leading-normal">
                          Switch to Rider Portal, select origin and destination nodes, then press 'Propose My Fare' to trigger instant driver biddings!
                        </p>
                      </div>
                    ) : (
                      bookings.filter(b => b.status !== "Completed" && b.status !== "Canceled").map(bk => {
                        const isBidSelectedByRider = bk.selectedDriverId === simulatedActiveDriverId;
                        return (
                          <div 
                            key={bk.id}
                            className="bg-stone-50 rounded-lg p-4 border border-stone-250/70 flex flex-col gap-3 text-stone-850"
                          >
                            <div className="flex justify-between items-start border-b border-stone-200 pb-2">
                              <div>
                                <span className="text-[9.5px] font-mono text-stone-500 uppercase block">RIDE OFFERED</span>
                                <strong className="text-xs text-stone-900">{bk.riderName} ({bk.riderRole})</strong>
                              </div>
                              <span className="text-sm font-black text-[#c20000] font-mono">
                                Offer: ${bk.riderOfferedFare.toFixed(2)} USD
                              </span>
                            </div>

                            <div className="text-[10.5px] flex flex-col gap-0.5 text-stone-600 bg-white p-2.5 rounded border border-stone-200">
                              <span>Origin: <strong>{stops.find(s => s.id === bk.pickupStopId)?.name}</strong></span>
                              <span>Drop-off: <strong>{stops.find(s => s.id === bk.dropoffStopId)?.name}</strong></span>
                              <span>Seats: <strong>{bk.seatsBooked} passengers</strong></span>
                              <span>Wallet: <strong className="text-[#c20000]">{bk.paymentMethod}</strong></span>
                              <span>Status: <strong className="uppercase">{bk.status}</strong></span>
                            </div>

                            {/* Negotiation actions for driver */}
                            {bk.status === "Negotiating" && (
                              <div className="flex flex-col gap-2 bg-stone-50 pt-2">
                                <span className="text-[9px] font-bold text-stone-500 uppercase font-mono block">Driver Bid Adjuster</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-mono font-bold text-stone-500">$</span>
                                    <input 
                                      type="number" 
                                      step="0.10"
                                      value={driverCounterAmount}
                                      onChange={(e) => setDriverCounterAmount(e.target.value)}
                                      className="w-full bg-white border border-stone-300 rounded text-xs py-1 px-5 font-mono"
                                      placeholder="Counter price"
                                    />
                                  </div>
                                  <input 
                                    type="number" 
                                    value={driverEta}
                                    onChange={(e) => setDriverEta(parseInt(e.target.value) || 5)}
                                    className="w-full bg-white border border-stone-300 rounded text-xs py-1 px-2.5 font-mono"
                                    placeholder="ETA minutes"
                                  />
                                </div>
                                
                                <div className="flex gap-2 mt-1">
                                  <button
                                    onClick={() => handleDriverSubmitCounter(bk.id)}
                                    className="flex-1 bg-stone-900 hover:bg-stone-850 text-white font-mono text-[9px] font-bold uppercase py-1.5 rounded transition-all"
                                  >
                                    Counter Rider bid
                                  </button>
                                  <button
                                    onClick={() => handleAcceptDriverOffer({
                                      driverId: simulatedActiveDriverId,
                                      driverName: drivers.find(d => d.id === simulatedActiveDriverId)?.name || "",
                                      vehicleDetails: drivers.find(d => d.id === simulatedActiveDriverId)?.vehicleName || "",
                                      rating: 4.8,
                                      offeredFare: bk.riderOfferedFare,
                                      etaMinutes: 3
                                    })}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] font-bold uppercase py-1.5 rounded transition-all"
                                  >
                                    Accept standard ${bk.riderOfferedFare.toFixed(2)}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Shift trip into movement simulation once accepted */}
                            {bk.status === "Accepted" && isBidSelectedByRider && (
                              <div className="pt-2 flex flex-col gap-1 text-center">
                                <span className="text-[10px] text-emerald-700 font-bold block">✓ Rider accepted your bid offer!</span>
                                <button
                                  onClick={() => handleUpdateJourneyStatus(bk.id, "InTransit")}
                                  className="w-full bg-stone-900 hover:bg-stone-850 text-white font-bold uppercase text-[10px] tracking-wide py-2 rounded-lg"
                                >
                                  Begin Transit Road
                                </button>
                              </div>
                            )}

                            {/* Complete Transit simulation step */}
                            {bk.status === "InTransit" && isBidSelectedByRider && (
                              <div className="pt-2 flex flex-col gap-1 text-center">
                                <span className="text-[10px] text-blue-700 block animate-pulse">🚗 Traveling Christmas pass loop...</span>
                                <button
                                  onClick={() => handleUpdateJourneyStatus(bk.id, "Completed")}
                                  className="w-full bg-[#c20000] hover:bg-[#a30000] text-white font-bold uppercase text-[10px] tracking-wide py-2 rounded-lg"
                                >
                                  Complete Shuttle Journey
                                </button>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENTS 3: ADMIN STABILIZATION CONTROL TOWER */}
            {activeTab === "admin" && (
              <div id="admin-view" className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="border-b border-stone-150 pb-2">
                  <h4 className="text-sm font-bold text-stone-900 uppercase font-mono tracking-wide">
                    Admin Operations Control
                  </h4>
                  <p className="text-[10px] text-stone-500">Live operational oversight of the Africa University Vroom network</p>
                </div>

                {/* Operations Key Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-stone-50 p-4 border border-stone-250/60 rounded-lg text-left">
                    <span className="text-[9px] text-[#c20050] font-mono font-bold block uppercase tracking-wider">
                      Aggregate Business Revenue
                    </span>
                    <strong className="text-xl text-stone-950 font-mono block mt-1">
                      ${totalRidesRevenue.toFixed(2)} USD
                    </strong>
                    <span className="text-[8.5px] text-stone-400 block mt-0.5">
                      Completed trips: {completedRides.length}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-4 border border-stone-250/60 rounded-lg text-left">
                    <span className="text-[9px] text-[#c20050] font-mono font-bold block uppercase tracking-wider">
                      Active Negotiations
                    </span>
                    <strong className="text-xl text-stone-950 font-mono block mt-1">
                      {liveRides.length} In-Air
                    </strong>
                    <span className="text-[8.5px] text-stone-400 block mt-0.5">
                      Online partners: {drivers.length}
                    </span>
                  </div>
                </div>

                {/* Live Audit Log Feed */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center text-[10.5px] font-mono font-bold text-[#c20000] uppercase tracking-wider">
                    <span>Live Audit Log Feed:</span>
                    <Bell className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-stone-950 rounded-lg p-3 max-h-[145px] overflow-y-auto text-[9.5px] font-mono text-stone-300 flex flex-col gap-1.5 text-left border border-stone-850">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="border-b border-stone-900 pb-1 last:border-b-0">
                        <span className="text-rose-450 mr-1.5">•</span>
                        <span>{notif}</span>
                      </div>
                    ))}
                    {notifications.length === 0 && <span className="text-stone-500">Log sandbox feed ready.</span>}
                  </div>
                </div>

                <div className="bg-stone-550/15 p-3 rounded-lg border border-stone-200 text-[10.5px] text-stone-600 leading-normal flex items-start gap-2 text-left">
                  <Shield className="w-4 h-4 text-[#c20000] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Africa University Governance Code</strong>: Local pricing structures are managed utilizing our smart negotiation tool. Drivers are vetted directly by Campus Security.
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-150 flex justify-end">
                  <button
                    onClick={handleResetSandbox}
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all border border-stone-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-red-500" />
                    Reset System State
                  </button>
                </div>

              </div>
            )}

          </div>

        </section>

      </div>
      )}

      {viewMode === "companion" && (
        /* DEDICATED GEMINI AI TRAVEL COMPANION PAGE */
        <div id="companion-system-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
          {/* Left FAQ / Local Guide helpers */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <span className="text-[#c20000] font-mono text-xs uppercase tracking-widest font-bold block mb-2">
                📍 Mutare Handbook
              </span>
              <h4 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider font-mono mb-2">
                Mutare Commute Guideline
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Campus transportation flows along standard points from Mutare city center up through the Christmas Pass mountain range and Penhalonga.
              </p>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono">
                  <span className="font-bold block text-stone-850">Christmas Pass Route:</span>
                  <span className="text-stone-500">Known for high altitudes and winding curves. Keep bids realistic around $3.00 - $4.00 USD.</span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-205 rounded-lg text-xs font-mono">
                  <span className="font-bold block text-stone-850">Sakubva Local Corridor:</span>
                  <span className="text-stone-500">High density shuttle hub. Kombi routes run standard schedules with digital EcoCash integration.</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest font-mono">
                Suggested Queries
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  "What is the coordinates and elevation of Christmas Pass?",
                  "How do students bid on ride fares inside AU VROOM?",
                  "What is typical fare for Africa University campus to Sakubva?",
                  "Tell me about Zimbabwe payment gateway security."
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChatPrompt(q)}
                    className="text-left text-[11px] text-stone-600 hover:text-[#c20000] hover:bg-red-50 p-2.5 rounded-lg border border-stone-150 transition-all font-mono"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Interactive Chat Console */}
          <div className="lg:col-span-8 bg-stone-900 text-white border border-stone-800 rounded-xl p-6 shadow-xl flex flex-col gap-5 min-h-[500px]">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-white font-mono">
                    Gemini Intelligent Co-Pilot
                  </h4>
                  <p className="text-[10px] text-stone-400 font-mono">Mutare Travel Navigation Engine</p>
                </div>
              </div>
              <span className="text-[9px] bg-red-800/80 text-rose-100 font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider">
                {apiMode} Live
              </span>
            </div>

            {/* Messages pane */}
            <div className="bg-stone-950 rounded-xl border border-stone-800 p-4 flex-1 h-[320px] overflow-y-auto flex flex-col gap-3 text-[11.5px] font-mono shadow-inner">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div className={`p-3 rounded-2xl leading-relaxed ${
                    msg.sender === "user" ? "bg-red-700 text-white rounded-br-none" : "bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-stone-500 block px-1">{msg.time} • {msg.sender === "user" ? "Rider" : "AI"}</span>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-stone-400 animate-pulse text-xs pl-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>Gemini is compiling Mutare GPS network rules...</span>
                </div>
              )}
            </div>

            {/* Form dispatch query */}
            <form onSubmit={sendCompanionQuestion} className="flex gap-2.5">
              <input
                type="text"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask about Christmas Pass altitude or typical fare..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-red-600 transition-colors"
              />
              <button
                type="submit"
                className="bg-[#c20000] hover:bg-[#a30000] p-3 rounded-xl transition-all text-white shadow-md font-bold px-5 uppercase text-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {(viewMode === "login" || viewMode === "signup") && (
        <div id="auth-system-portal" className="max-w-4xl w-full mx-auto my-4 min-h-[500px] flex items-center justify-center animate-fade-in text-center">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden w-full grid grid-cols-1 lg:grid-cols-12 min-h-[520px] transition-all">
            
            {/* View Mode: "login" */}
            {viewMode === "login" && (
              <>
                {/* Left Side: Interactive Sign In Form */}
                <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center items-center bg-white text-center w-full gap-4">
                  <div className="w-full max-w-sm flex flex-col items-center">
                    <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Sign In</h2>
                    
                    {/* Social logins */}
                    <div className="flex gap-3 my-5">
                      <button type="button" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm text-stone-700 font-bold font-mono">f</button>
                      <button type="button" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm text-stone-750 font-bold font-mono">G+</button>
                      <button type="button" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm text-stone-750 font-bold font-mono">in</button>
                    </div>

                    <span className="text-xs text-stone-400 font-mono tracking-wide">or use your email account</span>

                    {/* Auth Feedback banner */}
                    {authFeedback && (
                      <div className={`mt-4 w-full p-3 rounded-xl text-xs font-mono border ${
                        authFeedback.type === "success" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                          : "bg-rose-50 text-rose-800 border-rose-250"
                      }`}>
                        {authFeedback.msg}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={(e) => handleAuthSubmit(e, "login")} className="w-full flex flex-col gap-3.5 mt-5">
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-stone-100 border border-stone-150 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white transition-all text-left"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="Password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-stone-100 border border-stone-150 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white transition-all text-left"
                        />
                      </div>

                      <button type="button" className="text-stone-450 hover:text-[#c20000] hover:underline text-xs tracking-tight transition-colors mt-1 block mx-auto">
                        Forgot your password?
                      </button>

                      <button
                        type="submit"
                        className="bg-[#c20000] hover:bg-[#a30000] text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-12 rounded-full shadow-md hover:shadow-lg transition-all border border-red-800 mt-4 cursor-pointer"
                      >
                        Sign In
                      </button>
                    </form>
                  </div>
                  
                  {/* Small screens toggle link helper */}
                  <div className="lg:hidden mt-8 text-xs text-stone-500 font-sans">
                    Don't have an account?{" "}
                    <button onClick={() => setViewMode("signup")} className="text-[#c20000] font-bold hover:underline">
                      Sign Up Now
                    </button>
                  </div>
                </div>

                {/* Right Side: Welcome Banner */}
                <div className="lg:col-span-5 bg-gradient-to-tr from-[#9a0000] via-[#c20000] to-[#f87171] p-10 flex flex-col justify-center items-center text-center text-white hidden lg:flex relative">
                  {/* Subtle overlays */}
                  <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                  <div className="relative z-10 max-w-sm flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-extrabold tracking-tight">Hello, Friend!</h2>
                    <p className="text-rose-100 text-xs font-mono leading-relaxed max-w-xs">
                      Enter your personal details to sign up and start naming your destination fare bids around Mutare.
                    </p>
                    <button
                      onClick={() => {
                        setAuthFeedback(null);
                        setViewMode("signup");
                      }}
                      className="border-2 border-white hover:bg-white hover:text-[#c20000] text-white font-bold py-2.5 px-8 rounded-full transition-all text-xs uppercase tracking-wider mt-4 cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* View Mode: "signup" */}
            {viewMode === "signup" && (
              <>
                {/* Left Side: Welcome Banner */}
                <div className="lg:col-span-5 bg-gradient-to-tr from-[#9a0000] via-[#c20000] to-[#f87171] p-10 flex flex-col justify-center items-center text-center text-white hidden lg:flex relative">
                  <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                  <div className="relative z-10 max-w-sm flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back!</h2>
                    <p className="text-rose-100 text-xs font-mono leading-relaxed max-w-xs">
                      To keep connected with our campus rides system, please log in with your credentials.
                    </p>
                    <button
                      onClick={() => {
                        setAuthFeedback(null);
                        setViewMode("login");
                      }}
                      className="border-2 border-white hover:bg-white hover:text-[#c20000] text-white font-bold py-2.5 px-8 rounded-full transition-all text-xs uppercase tracking-wider mt-4 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                {/* Right Side: Create Account Form */}
                <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center items-center bg-white text-center w-full gap-4">
                  <div className="w-full max-w-sm flex flex-col items-center">
                    <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Create Account</h2>
                    
                    {/* Social logins */}
                    <div className="flex gap-3 my-4">
                      <button type="button" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm text-stone-700 font-bold font-mono">f</button>
                      <button type="button" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm text-stone-750 font-bold font-mono">G+</button>
                      <button type="button" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm text-stone-750 font-bold font-mono">in</button>
                    </div>

                    <span className="text-xs text-stone-400 font-mono tracking-wide">or use your email for registration</span>

                    {/* Auth Feedback banner */}
                    {authFeedback && (
                      <div className={`mt-3 w-full p-3 rounded-xl text-xs font-mono border ${
                        authFeedback.type === "success" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                          : "bg-rose-50 text-rose-800 border-rose-250"
                      }`}>
                        {authFeedback.msg}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={(e) => handleAuthSubmit(e, "signup")} className="w-full flex flex-col gap-3 mt-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-stone-100 border border-stone-150 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white transition-all text-left"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-stone-100 border border-stone-150 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white transition-all text-left"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-stone-100 border border-stone-150 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white transition-all text-left"
                      />

                      {/* Role selection */}
                      <div className="flex flex-col gap-1.5 mt-1 text-left">
                        <label className="text-[10px] uppercase tracking-wide font-bold font-mono text-stone-500 pl-1">Primary Role</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAuthRole("Rider")}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-center border transition-all ${
                              authRole === "Rider"
                                ? "bg-stone-900 border-stone-900 text-white shadow-sm"
                                : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600"
                            }`}
                          >
                            Rider (Student)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthRole("Driver")}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-center border transition-all ${
                              authRole === "Driver"
                                ? "bg-stone-900 border-stone-900 text-white shadow-sm"
                                : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600"
                            }`}
                          >
                            Driver Partner
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-[#c20000] hover:bg-[#a30000] text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-12 rounded-full shadow-md hover:shadow-lg transition-all border border-red-800 mt-4 cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </form>
                  </div>

                  {/* Small screens toggle link helper */}
                  <div className="lg:hidden mt-8 text-xs text-stone-500 font-sans">
                    Already have an account?{" "}
                    <button onClick={() => setViewMode("login")} className="text-[#c20000] font-bold hover:underline">
                      Sign In Now
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
      </main>

      {/* 5. PORTAL FOOTER DETAILS */}
      <footer id="au-portal-footer" className="bg-stone-900 text-stone-400 border-t border-stone-800 py-6 mt-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center border border-stone-800 shadow-sm overflow-hidden relative">
              <img 
                src="assets/img/logo.png" 
                className="w-5 h-5 object-contain" 
                alt="AU Vroom Logo" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = document.getElementById("footer-logo-fallback");
                  if (fb) fb.classList.remove("hidden");
                }}
              />
              <span id="footer-logo-fallback" className="hidden text-[10px] font-bold text-[#c20000] font-sans">AU</span>
            </div>
            <span>Dev Time © 2025 - 2026 AU Vroom, Zimbabwe. Don't Wait, Just Vroom.</span>
          </div>
          <div className="text-stone-500 font-mono text-[10.5px] sm:text-right">
            NaxionAI Freelancer (Nature)
          </div>
        </div>
      </footer>

      {/* USSD SIMULATED MOBILE GATEWAY MODAL POPUP */}
      {showUssdModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-750 rounded-xl p-6 max-w-sm w-full shadow-2xl text-stone-100 flex flex-col gap-4 text-center animate-scale-up">
            
            <div className="w-12 h-12 bg-[#c20000]/25 rounded-full border border-[#c20000] flex items-center justify-center mx-auto text-[#c20000]">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white">USSD PIN Authentication</h3>
              <p className="text-xs text-stone-400 mt-1">Simulated Zimbabwe Sandbox Payment Promenade</p>
            </div>

            <div className="bg-stone-950 p-3 rounded-lg text-left text-xs border border-stone-850 flex flex-col gap-1 leading-normal font-mono">
              <span className="text-stone-400">Merchant: <strong>AU Vroom Commutes</strong></span>
              <span className="text-stone-400">Total Fare Value: <strong className="text-red-500">${(parseFloat(proposedFare) * seatsCount).toFixed(2)} USD</strong></span>
              <span className="text-stone-400">Method selected: <strong className="text-yellow-400">{paymentMethod}</strong></span>
              <span className="text-[10px] text-stone-500 mt-1.5 border-t border-stone-850 pt-1.5">Enter sandbox PIN to authorize transaction automatically. Use <strong>'1234'</strong> or any code for test credits!</span>
            </div>

            <div>
              <input
                type="password"
                maxLength={4}
                value={ussdPin}
                onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • 4-digit Wallet Pin"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg text-center font-mono py-2.5 text-lg text-white font-semibold focus:outline-none focus:border-[#c20000]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowUssdModal(false);
                  setUssdBookingPayload(null);
                }}
                className="flex-1 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-bold uppercase text-[10px] py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={verifyUssdPinCode}
                className="flex-1 bg-[#c20000] hover:bg-[#a30000] text-white font-bold uppercase text-[10px] py-2 rounded-lg"
              >
                Authorize USD
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Simple custom component references
function SupportIcon() {
  return (
    <svg className="w-5 h-5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function addNotification(text: string) {
  // Safe helper placeholder function
  try {
    const el = document.getElementById("admin-view");
    if (el) {
      console.log("Logged sandbox action notification feed item:", text);
    }
  } catch (err) {}
}
