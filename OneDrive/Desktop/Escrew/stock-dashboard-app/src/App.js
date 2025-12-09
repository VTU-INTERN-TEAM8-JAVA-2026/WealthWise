/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  runTransaction,
  setLogLevel,
} from "firebase/firestore";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  LogOut,
  Loader2,
  Mail,
  Lock,
  Plus,
  Check,
  LayoutDashboard,
  Wallet,
  PlayCircle,
  StopCircle,
  User,
  AlertCircle, // Added for error display
} from "lucide-react";

// --- CONFIGURATION ---
// Using your provided credentials
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA6LevOl9qcGRiCUBT_r5wPLWSj4o_Ue9w",
  authDomain: "stock-project-e0e5a.firebaseapp.com",
  projectId: "stock-project-e0e5a",
  storageBucket: "stock-project-e0e5a.firebasestorage.app",
  messagingSenderId: "128387304020",
  appId: "1:128387304020:web:130afd9181640d24c37bc1",
  measurementId: "G-4YNJP6RP93",
};

// The requested stock list
const SUPPORTED_TICKERS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

const App = () => {
  // --- STATE MANAGEMENT ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null); // Global error state

  // Data State
  const [stockPrices, setStockPrices] = useState({});
  const [subscribedTickers, setSubscribedTickers] = useState([]);

  // Simulation State
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState("");

  // Safely handle app_id for Firestore paths
  const currentAppId =
    typeof __app_id !== "undefined" ? __app_id : "local-stock-app";

  // --- AUTO-FIX: INJECT TAILWIND CSS ---
  useEffect(() => {
    try {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      script.onerror = () => setGlobalError("Failed to load styling engine.");
      document.head.appendChild(script);
    } catch (e) {
      console.error("Style Injection Error:", e);
    }
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    setLogLevel("silent"); // Clean console

    try {
      // 1. Initialize Firebase
      let config = LOCAL_FIREBASE_CONFIG;
      if (typeof __firebase_config !== "undefined") {
        try {
          config = JSON.parse(__firebase_config);
        } catch (e) {
          console.warn("External config parse failed, using local fallback.");
        }
      }

      const app = initializeApp(config);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      // 2. Setup Auth Listener
      const unsubscribe = onAuthStateChanged(
        firebaseAuth,
        (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        },
        (error) => {
          console.error("Auth Listener Error:", error);
          setGlobalError("Authentication service interrupted.");
          setAuthLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase Init Failed:", err);
      setGlobalError("Failed to connect to application services.");
      setAuthLoading(false);
    }
  }, []);

  // --- REAL-TIME MARKET DATA LISTENER ---
  useEffect(() => {
    if (!db) return;
    try {
      const pricesRef = collection(
        db,
        `artifacts/${currentAppId}/public/data/stock_prices`
      );

      const unsubscribe = onSnapshot(
        pricesRef,
        (snapshot) => {
          const prices = {};
          snapshot.forEach((doc) => (prices[doc.id] = doc.data()));
          setStockPrices(prices);
          // Clear any previous market data errors on success
          setGlobalError((prev) =>
            prev === "Market data unavailable." ? null : prev
          );
        },
        (error) => {
          console.error("Market Data Error:", error);
          // Handle permission errors or network drops
          setGlobalError("Market data unavailable. Reconnecting...");
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Market Listener Setup Error:", err);
      setGlobalError("Critical error loading market module.");
    }
  }, [db, currentAppId]);

  // --- USER SUBSCRIPTION LISTENER ---
  useEffect(() => {
    if (!user || !db) return;
    try {
      const userSubRef = doc(
        db,
        `artifacts/${currentAppId}/users/${user.uid}/client_data/subscriptions`
      );

      const unsubscribe = onSnapshot(
        userSubRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setSubscribedTickers(docSnap.data().tickers || []);
          } else {
            // Initialize profile safely
            setDoc(userSubRef, { tickers: [] }, { merge: true }).catch((e) =>
              console.error("Profile Init Error:", e)
            );
          }
        },
        (error) => {
          console.error("Subscription Sync Error:", error);
          setGlobalError("Failed to sync your portfolio.");
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Profile Listener Setup Error:", err);
    }
  }, [user, db, currentAppId]);

  // --- MARKET SIMULATOR ---
  useEffect(() => {
    let interval;
    if (isSimulatorActive && db) {
      interval = setInterval(async () => {
        try {
          // Update all supported stocks
          for (const ticker of SUPPORTED_TICKERS) {
            const currentPrice =
              stockPrices[ticker]?.price || 100 + Math.random() * 50;
            const volatility = Math.random() * 0.03 - 0.015;
            const newPrice = Math.max(1, currentPrice * (1 + volatility));
            const change = newPrice - currentPrice;

            const stockRef = doc(
              db,
              `artifacts/${currentAppId}/public/data/stock_prices`,
              ticker
            );
            await setDoc(
              stockRef,
              {
                price: parseFloat(newPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                updatedAt: Date.now(),
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.error("Simulation Tick Error:", error);
          setIsSimulatorActive(false); // Stop simulator on error to prevent cascading fails
          setGlobalError("Simulator stopped due to network error.");
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulatorActive, db, stockPrices, currentAppId]);

  // --- HANDLERS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!auth) {
      setAuthError("Authentication service not ready.");
      return;
    }
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      // Cleaner error messages for users
      let msg = err.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid email address.";
      if (msg.includes("auth/user-not-found"))
        msg = "No account found with this email.";
      if (msg.includes("auth/wrong-password")) msg = "Incorrect password.";
      if (msg.includes("auth/email-already-in-use"))
        msg = "Email already in use.";
      if (msg.includes("auth/weak-password"))
        msg = "Password should be at least 6 characters.";
      if (msg.includes("auth/configuration-not-found"))
        msg = "Please enable Email/Password Sign-in in Firebase Console.";
      if (msg.includes("auth/network-request-failed"))
        msg = "Network error. Check your connection.";
      setAuthError(msg);
    }
  };

  const toggleSubscription = useCallback(
    async (ticker) => {
      if (!db || !user) {
        setGlobalError("Not connected. Please refresh.");
        return;
      }

      setGlobalError(null);
      const userSubRef = doc(
        db,
        `artifacts/${currentAppId}/users/${user.uid}/client_data/subscriptions`
      );

      try {
        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(userSubRef);
          if (!docSnap.exists()) {
            throw new Error("Profile document missing"); // Trigger recovery in catch
          }

          const currentList = docSnap.data().tickers || [];
          let newList;
          if (currentList.includes(ticker)) {
            newList = currentList.filter((t) => t !== ticker);
          } else {
            newList = [...currentList, ticker];
          }

          transaction.set(userSubRef, { tickers: newList }, { merge: true });
        });
      } catch (error) {
        console.error("Transaction Error:", error);

        // Attempt recovery for missing profile
        if (error.message.includes("Profile document missing")) {
          try {
            await setDoc(userSubRef, { tickers: [ticker] }, { merge: true });
          } catch (recErr) {
            setGlobalError("Failed to update subscription.");
          }
        } else {
          setGlobalError("Update failed. Please check your connection.");
        }
      }
    },
    [db, user, currentAppId]
  );

  // --- SUB-COMPONENTS ---
  const StockCard = ({ ticker }) => {
    const data = stockPrices[ticker] || { price: 0, change: 0 };
    const isSubscribed = subscribedTickers.includes(ticker);
    const isPositive = data.change >= 0;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg hover:border-slate-500 transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300">
              {ticker[0]}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{ticker}</h3>
              <p className="text-xs text-slate-400">Stock Market</p>
            </div>
          </div>
          <button
            onClick={() => toggleSubscription(ticker)}
            className={`p-2 rounded-full transition-colors ${
              isSubscribed
                ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600 text-white"
            }`}
          >
            {isSubscribed ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-slate-100">
              ${data.price?.toFixed(2) || "---"}
            </span>
          </div>
          <div
            className={`flex items-center text-sm font-medium ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp size={16} className="mr-1" />
            ) : (
              <TrendingDown size={16} className="mr-1" />
            )}
            {data.change > 0 ? "+" : ""}
            {data.change?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER HELPERS ---
  if (authLoading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  if (!user) {
    // LOGIN SCREEN
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <Activity className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Broker Dashboard</h1>
            <p className="text-slate-400">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="trader@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">
                <AlertCircle size={16} />
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all"
            >
              {isLoginView ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-400">
            {isLoginView ? "New here?" : "Already have an account?"}
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-blue-400 hover:text-blue-300 ml-2 font-medium"
            >
              {isLoginView ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500" />
              <span className="font-bold text-xl text-white">TradePro</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Simulator Toggle */}
              <button
                onClick={() => setIsSimulatorActive(!isSimulatorActive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isSimulatorActive
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 animate-pulse"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {isSimulatorActive ? (
                  <StopCircle size={14} />
                ) : (
                  <PlayCircle size={14} />
                )}
                {isSimulatorActive ? "SIMULATOR ACTIVE" : "START SIMULATOR"}
              </button>

              <div className="h-6 w-px bg-slate-800 mx-2 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-white">
                    {user.email.split("@")[0]}
                  </span>
                  <span className="text-xs text-slate-500">Pro Account</span>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center justify-between text-red-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-xs hover:bg-red-900/30 px-2 py-1 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Market Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <LayoutDashboard className="text-blue-500" />
              <h2 className="text-xl font-bold text-white">Market Overview</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUPPORTED_TICKERS.map((ticker) => (
                <StockCard key={ticker} ticker={ticker} />
              ))}
            </div>
          </div>

          {/* RIGHT: My Portfolio */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 sticky top-24 overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Wallet className="text-purple-500" />
                  Your Watchlist
                </h2>
              </div>

              <div className="divide-y divide-slate-800">
                {subscribedTickers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p>No active subscriptions.</p>
                    <p className="text-xs mt-1">
                      Click the + button on stocks to add them here.
                    </p>
                  </div>
                ) : (
                  subscribedTickers.map((ticker) => {
                    const data = stockPrices[ticker] || { price: 0, change: 0 };
                    const isPos = data.change >= 0;
                    return (
                      <div
                        key={ticker}
                        className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white">{ticker}</div>
                          <div className="text-xs text-slate-500">Equity</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-slate-200">
                            ${data.price?.toFixed(2)}
                          </div>
                          <div
                            className={`text-xs ${
                              isPos ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isPos ? "+" : ""}
                            {data.change?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
