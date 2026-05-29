import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Mutare, Zimbabwe & Africa University Locations
interface MutareStop {
  id: string;
  name: string;
  description: string;
  coords: { x: number; y: number }; // Percentage coords on our high-fidelity SVG Mutare Map
  estStandardFare: number; // Suggested base fare in USD
}

const MUTARE_STOPS: MutareStop[] = [
  { id: "stop-au", name: "Africa University (AU) Campus", description: "Main gate, hostels & LRC academic blocks", coords: { x: 20, y: 18 }, estStandardFare: 1.00 },
  { id: "stop-xmas", name: "Christmas Pass Viewpoint", description: "Scenic mountain pass highway overlook", coords: { x: 45, y: 28 }, estStandardFare: 2.50 },
  { id: "stop-city", name: "Mutare Town Center (First St)", description: "Central business district & banks", coords: { x: 62, y: 48 }, estStandardFare: 3.00 },
  { id: "stop-sakubva", name: "Sakubva Market Hub", description: "Busy transport loop & vegetable market", coords: { x: 50, y: 70 }, estStandardFare: 3.50 },
  { id: "stop-chikanga", name: "Chikanga Shopping Centre", description: "Chikanga high-density residential zone", coords: { x: 30, y: 56 }, estStandardFare: 2.00 },
  { id: "stop-dangamvura", name: "Dangamvura Complex", description: "Dangamvura area transit terminal", coords: { x: 75, y: 82 }, estStandardFare: 4.00 },
  { id: "stop-border", name: "Forbes Border Post", description: "Mozambique border gateway terminal", coords: { x: 88, y: 40 }, estStandardFare: 5.00 }
];

// inDrive Driver Offers
interface DriverOffer {
  driverId: string;
  driverName: string;
  vehicleDetails: string;
  rating: number;
  offeredFare: number; // Bid amount
  etaMinutes: number;
}

// In-Memory Database for AU Vroom Ride System (inDrive bid-based model)
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
  riderOfferedFare: number; // initial fare offered by rider
  finalAgreedFare: number | null;
  seatsBooked: number;
  paymentMethod: "EcoCash" | "InBucks" | "CBZ Pay" | "Stanbic Wallet" | "Cash Guard" | "Cash";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  status: "Requested" | "Negotiating" | "Accepted" | "InTransit" | "Completed" | "Canceled";
  requestedAt: string;
  selectedDriverId: string | null;
  driverOffers: DriverOffer[]; // List of driver counters
}

// Pre-seeded drivers representing Mutare Kombi & taxi operators
let drivers: Driver[] = [
  {
    id: "drv-tinashe",
    name: "Tinashe Gumbo",
    phone: "+263 77 123 4567",
    vehicleName: "Toyota HiAce (Kombi Red Dash)",
    vehiclePlate: "AU-001-BT",
    rating: 4.9,
    tripsCount: 382,
    avatarColor: "bg-red-800 text-white",
    isActive: true,
    currentStopId: "stop-au",
    status: "idle",
    coords: { x: 20, y: 18 }
  },
  {
    id: "drv-chipo",
    name: "Chipo Moyo",
    phone: "+263 78 456 7890",
    vehicleName: "Toyota Quantum (Silver Wing)",
    vehiclePlate: "AU-012-HT",
    rating: 4.8,
    tripsCount: 194,
    avatarColor: "bg-zinc-800 text-white",
    isActive: true,
    currentStopId: "stop-city",
    status: "idle",
    coords: { x: 62, y: 48 }
  },
  {
    id: "drv-farai",
    name: "Farai Mutasa",
    phone: "+263 71 888 1122",
    vehicleName: "Nissan Elgrand Taxi",
    vehiclePlate: "AU-034-NV",
    rating: 4.7,
    tripsCount: 520,
    avatarColor: "bg-neutral-900 text-white",
    isActive: true,
    currentStopId: "stop-chikanga",
    status: "idle",
    coords: { x: 30, y: 56 }
  }
];

// Seeded bookings/negotiations history
let bidBookings: BidBooking[] = [
  {
    id: "bid-101",
    riderName: "Takudzwa Musora",
    riderRole: "Student",
    pickupStopId: "stop-au",
    dropoffStopId: "stop-city",
    riderOfferedFare: 3.50,
    finalAgreedFare: 4.00,
    seatsBooked: 1,
    paymentMethod: "EcoCash",
    paymentStatus: "Paid",
    status: "Completed",
    requestedAt: "11:15 AM",
    selectedDriverId: "drv-chipo",
    driverOffers: []
  },
  {
    id: "bid-102",
    riderName: "Nesta Sibanda",
    riderRole: "Student",
    pickupStopId: "stop-au",
    dropoffStopId: "stop-xmas",
    riderOfferedFare: 2.00,
    finalAgreedFare: 2.00,
    seatsBooked: 2,
    paymentMethod: "InBucks",
    paymentStatus: "Paid",
    status: "Completed",
    requestedAt: "11:22 AM",
    selectedDriverId: "drv-tinashe",
    driverOffers: []
  }
];

// System notifications logs
let notifications: string[] = [
  "Welcome to AU Vroom inDrive Mode! Set your own fare amount, and negotiate with drivers.",
  "Forbes Border Post is highly active today. Drivers might request slightly higher counter prices.",
  "EcoCash payment prompts are ready in Zimbabwe Sandbox Mode."
];

// Lazy Initialize GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): { client: GoogleGenAI | null; mode: "Gemini" | "LocalFallback" } {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("MY_GEMINI_API_KEY")) {
    return { client: null, mode: "LocalFallback" };
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize Google GenAI SDK:", e);
      return { client: null, mode: "LocalFallback" };
    }
  }
  return { client: aiClient, mode: "Gemini" };
}

// --- REST API Endpoints ---

// 1. Get Stops
app.get("/api/stops", (req, res) => {
  res.json(MUTARE_STOPS);
});

// 2. Get Application State (all drivers, bidBookings, notifications)
app.get("/api/state", (req, res) => {
  res.json({
    stops: MUTARE_STOPS,
    drivers,
    bookings: bidBookings,
    notifications,
    apiMode: getGeminiClient().mode
  });
});

// 3. Passenger creates a ride proposal (inDrive Name Your Price flow)
app.post("/api/bookings/propose", (req, res) => {
  const { riderName, riderRole, pickupStopId, dropoffStopId, riderOfferedFare, seatsBooked, paymentMethod } = req.body;

  if (!riderName || !pickupStopId || !dropoffStopId || !riderOfferedFare) {
    return res.status(400).json({ error: "Missing ride parameters" });
  }

  const requestedAt = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const newBookingId = `bid-${Date.now()}`;

  // Generate automated driver counter-offers based on the offered fare!
  // This simulates actual interactive inDrive bidding instantly!
  const offers: DriverOffer[] = [];
  
  // Custom counter-offering engine based on geographical distances
  drivers.forEach(drv => {
    if (drv.isActive) {
      const offered = Number(riderOfferedFare);
      const randomFactor = Number((Math.random() * 0.8).toFixed(2));
      const distanceSkewCost = 0.50;
      
      // Calculate a counter fare
      let counterFare = offered;
      const baseExpected = 3.00;
      
      if (offered < baseExpected) {
        counterFare = Number((baseExpected + randomFactor).toFixed(2));
      } else {
        // slightly undercut or counter with clean margins
        counterFare = Number((offered + randomFactor - 0.20).toFixed(2));
      }

      // Ensure counter is never stupidly low
      if (counterFare < 1.00) counterFare = 1.50;

      // Calculate automated rough ETA based on driver positions
      const eta = Math.floor(Math.random() * 10) + 3;

      offers.push({
        driverId: drv.id,
        driverName: drv.name,
        vehicleDetails: drv.vehicleName,
        rating: drv.rating,
        offeredFare: counterFare,
        etaMinutes: eta
      });
    }
  });

  const newBooking: BidBooking = {
    id: newBookingId,
    riderName,
    riderRole: riderRole || "Student",
    pickupStopId,
    dropoffStopId,
    riderOfferedFare: Number(riderOfferedFare),
    finalAgreedFare: null,
    seatsBooked: Number(seatsBooked) || 1,
    paymentMethod,
    paymentStatus: "Pending",
    status: "Negotiating",
    requestedAt,
    selectedDriverId: null,
    driverOffers: offers
  };

  bidBookings.unshift(newBooking);

  // Add notification to stack
  notifications.unshift(`New Ride request created by ${riderName} in Mutare! 3 driver counter-offers logged.`);
  if (notifications.length > 8) notifications.pop();

  res.json({ success: true, booking: newBooking, bookings: bidBookings, drivers });
});

// 4. Passenger accepts a specific Driver's offer or counter-bid
app.post("/api/bookings/accept-offer", (req, res) => {
  const { bookingId, driverId, agreedFare } = req.body;
  const booking = bidBookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Ride request was not found" });
  }

  const driver = drivers.find(d => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  booking.selectedDriverId = driverId;
  booking.finalAgreedFare = Number(agreedFare);
  booking.status = "Accepted";
  booking.paymentStatus = (booking.paymentMethod === "Cash Guard" || booking.paymentMethod === "Cash") ? "Pending" : "Paid";

  // Set driver status to "driving"
  driver.status = "driving";

  notifications.unshift(`${booking.riderName} accepted ${driver.name}'s counter offer of $${booking.finalAgreedFare} USD!`);
  if (notifications.length > 8) notifications.pop();

  res.json({ success: true, booking, bookings: bidBookings, drivers });
});

// 5. Driver counters the proposal with an individual custom fare (Driver-side inDrive bidding action!)
app.post("/api/bookings/driver-counter", (req, res) => {
  const { bookingId, driverId, counterFare, etaMinutes } = req.body;
  const booking = bidBookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking session not found" });
  }

  const driver = drivers.find(d => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  // Check if driver already countered. If so, update otherwise push
  const existingOfferIndex = booking.driverOffers.findIndex(o => o.driverId === driverId);
  const updatedOffer = {
    driverId,
    driverName: driver.name,
    vehicleDetails: driver.vehicleName,
    rating: driver.rating,
    offeredFare: Number(counterFare),
    etaMinutes: Number(etaMinutes) || 5
  };

  if (existingOfferIndex !== -1) {
    booking.driverOffers[existingOfferIndex] = updatedOffer;
  } else {
    booking.driverOffers.push(updatedOffer);
  }

  booking.status = "Negotiating";

  notifications.unshift(`${driver.name} counter-offered $${counterFare} USD to ${booking.riderName}!`);
  if (notifications.length > 8) notifications.pop();

  res.json({ success: true, booking, bookings: bidBookings });
});

// 6. Update Transit state (InTransit / Completed / Canceled)
app.post("/api/bookings/update-status", (req, res) => {
  const { bookingId, status } = req.body;
  const booking = bidBookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking session not found" });
  }

  booking.status = status;

  if (booking.selectedDriverId) {
    const driver = drivers.find(d => d.id === booking.selectedDriverId);
    if (driver) {
      if (status === "Completed") {
        driver.status = "idle";
        // Complete transit to dropoff stop coordinates
        driver.currentStopId = booking.dropoffStopId;
        const stop = MUTARE_STOPS.find(s => s.id === booking.dropoffStopId);
        if (stop) {
          driver.coords = { ...stop.coords };
        }
        driver.tripsCount += 1;
        notifications.unshift(`Trip successfully completed! ${booking.riderName} arrived at ${stop?.name || 'destination'}.`);
      } else if (status === "InTransit") {
        driver.status = "driving";
        notifications.unshift(`Driver ${driver.name} is now in transit with ${booking.riderName}.`);
      } else if (status === "Canceled") {
        driver.status = "idle";
        notifications.unshift(`Trip negotiation canceled.`);
      }
    }
  }

  if (notifications.length > 8) notifications.pop();
  res.json({ success: true, booking, bookings: bidBookings, drivers });
});

// 7. Reset the system
app.post("/api/bookings/reset", (req, res) => {
  bidBookings = bidBookings.filter(b => b.id === "bid-101" || b.id === "bid-102");
  
  drivers.forEach(d => {
    d.status = "idle";
    d.isActive = true;
    if (d.id === "drv-tinashe") {
      d.currentStopId = "stop-au";
      d.coords = { x: 20, y: 18 };
    } else if (d.id === "drv-chipo") {
      d.currentStopId = "stop-city";
      d.coords = { x: 62, y: 48 };
    } else if (d.id === "drv-farai") {
      d.currentStopId = "stop-chikanga";
      d.coords = { x: 30, y: 56 };
    }
  });

  notifications = [
    "AU Vroom inDrive Simulator restarted successfully.",
    "Bidding counters reset to default.",
    "Ready for high-fidelity smart rides around Mutare mountain routes."
  ];

  res.json({ success: true, bookings: bidBookings, drivers, notifications });
});

// 8. Gemini prompt handler (Specifically guides users on Mutare mountain geography routes, tips, and fare pricing negotiations)
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const { client, mode } = getGeminiClient();

  // Handle local offline rules instantly without API Key
  if (mode === "LocalFallback" || !client) {
    let reply = "Hello! I am your Mutare Travel companion. I recommend starting with low bids (around $1.50 USD) for short inner-city runs and offering $3.00+ for the long commute up Christmas Pass to the Africa University (AU) Campus!";
    const lower = prompt.toLowerCase();

    if (lower.includes("price") || lower.includes("fare") || lower.includes("how much") || lower.includes("negotiat")) {
      reply = "Our Africa University Mutare inDrive model relies on negotiation! If you offer too little (e.g. $0.50), drivers Farai or Chipo will likely counter with $1.50 or $2.00 to account for Christmas Pass fuel consumption. Try to find a healthy middle ground!";
    } else if (lower.includes("pass") || lower.includes("scenic") || lower.includes("christmas")) {
      reply = "Christmas Pass is a majestic mountain road that links Mutare City Centre with Penhalonga and Russia road, leading directly to the iconic AU Campus. It rises over 1,100 meters above sea level. It requires a resilient vehicle and usually costs $2 to $3 USD per ride!";
    } else if (lower.includes("stops") || lower.includes("route") || lower.includes("where")) {
      reply = "We map 7 major geographical Hubs in Mutare: 1) Africa University Campus, 2) Christmas Pass, 3) Mutare Town Center (First St), 4) Busy Sakubva Market, 5) Chikanga Suburb, 6) Dangamvura Terminal, and 7) Forbes Border-Mozambique. You can bid on any of these!";
    } else if (lower.includes("ecocash") || lower.includes("pay")) {
      reply = "We support instant local pay channels: EcoCash wallet codes, InBucks USD credit, CBZ mobile prompts, and cash in hand paid upon arrival!";
    }

    return res.json({ success: true, responseText: reply });
  }

  try {
    const systemInstruction = `
      You are the official inDrive digital travel coordinator for Africa University's "AU Vroom" service in Mutare, Zimbabwe.
      Your primary purpose is to help students, staff, and visitors negotiate fair bid prices, understand Christmas Pass terrain, and map trips to locations.

      In Mutare, typical transport ranges:
      - Short inner-city run (e.g., Sakubva to Town Center): $1.00 - $2.00 USD.
      - Highway scenic run through the mountains (Mutare Town to Christmas Pass Viewpoint): $2.00 - $3.00 USD.
      - Academic long-haul (Mutare Town uphill through Christmas Pass directly to AU Campus): $3.50 - $5.00 USD.
      - Border / high haul (Forbes Border Post to AU Campus): $5.00 - $7.00 USD.

      Tone Guide:
      Reflect the premium, secure, United Methodist-led Africa University (Zimbabwe) spirit. Use vibrant local phrases such as "Salibonani!", "Mhoroi!", "Chapel Hill", "Mutare City of mountains". Keep it highly warm, clear, crisp, and proud of Zimbabwean hospitality. Explain how bidding helps driver partners live sustainably with fuel expenses.
    `;

    const chatResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.65
      }
    });

    const reply = chatResponse.text || "Hello and welcome to Mutare! Name any two locations to start bidding immediately.";
    return res.json({ success: true, responseText: reply });

  } catch (error: any) {
    console.error("Gemini AI API Travel guide failed:", error);
    return res.json({
      success: true,
      responseText: "Hello! Our standard Mutare Town Centre to Africa University Campus bid stands at roughly $3.50. Let's start typing a bid above to match our drivers!"
    });
  }
});

// Configure Vite or Static Web server middleware
async function startWebRouting() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AU-VROOM IN-DISPATCH SERVER] Running successfully on port ${PORT}`);
  });
}

startWebRouting();
