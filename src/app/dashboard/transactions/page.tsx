"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState({
    investment: "Standalone transaction",
    type: "BUY",
    status: "Completed",
    amount: "",
    nav: "",
    units: "",
    date: "",
  });

  const [filter, setFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("latest");

  // ✅ ADD TRANSACTION
  const handleAdd = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!form.amount || !form.nav) {
      alert("Enter amount & NAV");
      return;
    }

    const units =
      form.units || (Number(form.amount) / Number(form.nav)).toFixed(2);

    const newTx = {
      user_id: user?.id || null,
      transaction_type: form.type,
      amount: Number(form.amount),
      nav: Number(form.nav),
      units: Number(units),
      transaction_date: form.date || new Date().toISOString().split("T")[0],
      status: form.status,
    };
    const { data, error } = await 
    supabase.from("investment_transactions").insert([newTx]);
    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }
    setTransactions([...transactions, {...newTx, id: Date.now() }]);

    // reset form
    setForm({
      investment: "Standalone transaction",
      type: "BUY",
      status: "Completed",
      amount: "",
      nav: "",
      units: "",
      date: "",
    });
  };

  // ✅ FILTER
  const filteredTransactions =
    filter === "ALL"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  // ✅ SORT
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => {
      if (sortOrder === "latest") {
        return (
          new Date(b.transaction_date) -
          new Date(a.transaction_date)
        );
      } else {
        return (
          new Date(a.transaction_date) -
          new Date(b.transaction_date)
        );
      }
    }
  );

  return (
    <div className="p-6 text-white">
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <p className="text-green-400 text-xs tracking-widest font-semibold">TRANSACTIONS</p>
        <h1 className="text-3xl font-bold text-white mt-2">
          Record and review portfolio actions
        </h1>
        <p className="text-gray-400 mt-2">
          Buys, sells, and switches now sit inside dedicated form and ledger sections.
        </p>
      </div>

      {/* 🔥 STATS */}
      <div className="flex gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-xl w-full">
          <p>Transactions</p>
          <h2 className="text-xl">{transactions.length}</h2>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl w-full">
          <p>STCG</p>
          <h2>₹0</h2>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl w-full">
          <p>LTCG</p>
          <h2>₹0</h2>
        </div>
      </div>

      {/* 🔥 FILTER */}
      <div className="flex gap-4 mb-6">
        <select
          className="bg-gray-800 p-2 rounded"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>

        <select
          className="bg-gray-800 p-2 rounded"
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* 🔥 ADD TRANSACTION */}
      <div className="bg-gray-900 p-6 rounded-xl mb-8">
        <h2 className="text-lg mb-4">Add transaction</h2>

        {/* ROW 1 */}
        <div className="flex gap-4 mb-4">
          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={form.investment}
            onChange={(e) =>
              setForm({ ...form, investment: e.target.value })
            }
          >
            <option>Standalone transaction</option>
          </select>

          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option>BUY</option>
            <option>SELL</option>
          </select>

          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option>Completed</option>
            <option>Pending</option>
          </select>
        </div>

        {/* ROW 2 */}
        <div className="flex gap-4 mb-4">
          <input
            placeholder="Amount"
            className="bg-gray-800 p-2 rounded w-full"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <input
            placeholder="NAV"
            className="bg-gray-800 p-2 rounded w-full"
            value={form.nav}
            onChange={(e) =>
              setForm({ ...form, nav: e.target.value })
            }
          />

          <input
            placeholder="Units"
            className="bg-gray-800 p-2 rounded w-full"
            value={form.units}
            onChange={(e) =>
              setForm({ ...form, units: e.target.value })
            }
          />
        </div>

        {/* DATE */}
        <div className="mb-4">
          <input
            type="date"
            className="bg-gray-800 p-2 rounded"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleAdd}
          className="bg-lime-400 text-black px-6 py-2 rounded-full"
        >
          Save transaction
        </button>
      </div>

      {/* 🔥 TRANSACTION LOG */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="mb-4">Transaction log</h2>

        {/* HEADER */}
        <div className="flex font-semibold border-b pb-2">
          <div className="w-1/6">TRANSACTION_Type</div>
          <div className="w-1/6">Amount</div>
          <div className="w-1/6">NAV</div>
          <div className="w-1/6">Units</div>
          <div className="w-1/6">Date</div>
          <div className="w-1/6">Status</div>
        </div>

        {/* DATA */}
        {sortedTransactions.map((item) => (
          <div
            key={item.id}
            className="flex border-b py-2 text-sm"
          >
            <div className="w-1/6">{item.transaction_type}</div>
            <div className="w-1/6">₹{item.amount}</div>
            <div className="w-1/6">{item.nav}</div>
            <div className="w-1/6">{item.units}</div>
            <div className="w-1/6">{item.transaction_date}</div>
            <div className="w-1/6">{item.status}</div>
               </div>
          
        ))}
      </div>
    </div>
  );
}
