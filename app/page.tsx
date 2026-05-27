'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

import { supabase } from '@/lib/supabase'

export default function Home() {
  // =========================
  // STATES
  // =========================

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('1')

  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] =
  useState(
    new Date().getMonth() + 1
  )
  const [categories, setCategories] = useState<any[]>([])

  // =========================
  // CALCULATIONS
  // =========================
const filteredTransactions =
  transactions.filter((transaction) => {
    const transactionMonth =
      new Date(
        transaction.created_at
      ).getMonth() + 1

    return (
      transactionMonth === selectedMonth
    )
  })
  const totalIncome = filteredTransactions
  .filter(
    (transaction) =>
      transaction.type === 'income'
  )
  .reduce(
    (sum, transaction) =>
      sum + transaction.amount,
    0
  )
  const totalExpense = filteredTransactions
  .filter(
    (transaction) =>
      transaction.type === 'expense'
  )
  .reduce(
    (sum, transaction) =>
      sum + transaction.amount,
    0
  )
const remainingBalance =
  totalIncome - totalExpense
  const fixedExpense = filteredTransactions
    .filter(
      (transaction) =>
        transaction.categories?.type === 'fixed'
    )
    .reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

  const variableExpense = filteredTransactions
    .filter(
      (transaction) =>
        transaction.categories?.type === 'variable'
    )
    .reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

  const chartData = [
    {
      name: 'Fixed',
      value: fixedExpense,
    },
    {
      name: 'Variable',
      value: variableExpense,
    },
  ]
const categorySummary = categories.map(
  (category) => {
    const total = filteredTransactions
      .filter(
        (transaction) =>
          transaction.category_id ===
          category.id
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      )

    return {
      name: category.name,
      total,
    }
  }
)
  // =========================
  // FETCH
  // =========================

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')

    if (error) {
      console.log(error)
    } else {
      setCategories(data)
    }
  }

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          type
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.log(error)
    } else {
      setTransactions(data)
    }
  }

  // =========================
  // USE EFFECT
  // =========================

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [])

  // =========================
  // ACTIONS
  // =========================

  const addTransaction = async () => {
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          amount: Number(amount),
          type: type,
          category_id: Number(category),
          note: note,
          is_recurring: false,
        },
      ])

    if (error) {
      console.log(error)
      alert('Lỗi!')
    } else {
      alert('Đã lưu giao dịch!')

      setAmount('')
      setNote('')
      setCategory('1')

      fetchTransactions()
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* HEADER */}

<div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1">
<p className="text-sm text-gray-500 mb-1">
    Hôm nay
  </p>

  <p className="font-bold text-black">
  📅 {new Date().toLocaleDateString(
    'vi-VN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )}
</p>
        <div className="flex items-center justify-between gap-3 mb-6">
          <select
  value={selectedMonth}
  onChange={(e) =>
    setSelectedMonth(
      Number(e.target.value)
    )
  }
  className="mt-4 bg-white border border-gray-300 px-4 py-2 rounded-xl text-black font-semibold"
>
  {Array.from({ length: 12 }).map(
    (_, index) => (
      <option
        key={index + 1}
        value={index + 1}
      >
        Tháng {index + 1}
      </option>
    )
  )}
  
</select>
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              💸
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-black">
              Sổ chi tiêu
            </h1>
          </div>
        </div>

        {/* ADD TRANSACTION */}

        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold">
              Thêm giao dịch
            </h2>

            <p className="text-sm text-gray-500">
              Ghi lại khoản chi tiêu của bạn
            </p>
          </div>

          {/* TYPE */}

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-500 font-medium"
          >
            <option value="expense">
              Chi tiêu
            </option>

            <option value="income">
              Thu nhập
            </option>
          </select>

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-500 font-medium"
          >
            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          {/* AMOUNT */}

          <input
            type="number"
            placeholder="Số tiền"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-500 font-medium"
          />

          {/* NOTE */}

          <input
            type="text"
            placeholder="Ghi chú (không bắt buộc)"
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-500 font-medium"
          />

          {/* BUTTON */}

          <button
            onClick={addTransaction}
            className="bg-black text-white p-4 rounded-xl font-medium hover:opacity-90 transition"
          >
            Lưu giao dịch
          </button>
        </div>

        {/* DASHBOARD */}

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-sm text-gray-500 mb-1">
                Fixed Cost
              </h2>

              <p className="text-2xl font-extrabold text-blue-600">
                {fixedExpense.toLocaleString()}đ
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-sm text-gray-500 mb-1">
                Variable Cost
              </h2>

              <p className="text-2xl font-extrabold text-green-600">
               {variableExpense.toLocaleString()}đ
              </p>
            </div>
          </div>

          <h2 className="text-sm text-gray-700 font-semibold mb-1">
  Còn lại
</h2>

          <p className="text-4xl font-extrabold tracking-tight text-orange-500">
           {remainingBalance.toLocaleString()}đ
          </p>
        </div>

{/* CATEGORY BREAKDOWN */}

<div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
  <h2 className="text-2xl font-extrabold tracking-tight text-black mb-4">
    Chi tiêu theo danh mục
  </h2>

  <div className="flex flex-col gap-3">
    {categorySummary
      .filter((item) => item.total > 0)
      .map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between bg-gray-50 p-4 rounded-xl"
        >
          <p className="font-medium text-gray-800">
            {item.name}
          </p>

          <p className="font-bold text-black">
            {item.total.toLocaleString()}đ
          </p>
        </div>
      ))}
  </div>
</div>
{/* CATEGORY PIE CHART */}

<div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
  <h2 className="text-2xl font-extrabold tracking-tight text-black mb-4">
    Biểu đồ chi tiêu
  </h2>

  <div className="h-72">
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <PieChart>
        <Pie
          data={categorySummary.filter(
            (item) => item.total > 0
          )}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) =>
  `${name} ${(
    (percent || 0) * 100
  ).toFixed(0)}%`
}
          paddingAngle={3}
        >
          <Cell fill="#3B82F6" />
          <Cell fill="#22C55E" />
          <Cell fill="#F97316" />
          <Cell fill="#EC4899" />
          <Cell fill="#8B5CF6" />
          <Cell fill="#EAB308" />
          <Cell fill="#14B8A6" />
          <Cell fill="#EF4444" />
          <Cell fill="#6366F1" />
          <Cell fill="#F43F5E" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

        {/* TRANSACTIONS */}

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold tracking-tight text-black mb-2">
            Recent Transactions
          </h2>

          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
              No transactions yet
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {transaction.note ||
                        'Không có ghi chú'}
                    </p>

                    <p className="text-sm text-gray-700 font-semibold mb-1">
                      {
                        transaction.categories
                          ?.name
                      }
                    </p>
                  </div>

                  <p className="font-bold">
                    {transaction.amount.toLocaleString()}
                    đ
                  </p>
                </div>
              </div>
            ))
          )}
            </div>
        </div>
      </div>
    </main>
  )
}