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

  const [type, setType] =
    useState('expense')

  const [amount, setAmount] =
    useState('')

  const [note, setNote] =
    useState('')

  const [category, setCategory] =
    useState('1')

  const [transactions, setTransactions] =
    useState<any[]>([])

  const [categories, setCategories] =
    useState<any[]>([])

  const [selectedMonth, setSelectedMonth] =
    useState(
      new Date().getMonth() + 1
    )
  const [selectedCategory, setSelectedCategory] =
  useState<string | null>(null)

const [editingId, setEditingId] =
  useState<number | null>(null)

const [editAmount, setEditAmount] =
  useState('')

const [editNote, setEditNote] =
  useState('')
  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions =
  transactions.filter((transaction) => {

    const transactionMonth =
      new Date(
        transaction.created_at
      ).getMonth() + 1

    const matchMonth =
      transactionMonth === selectedMonth

    const matchCategory =
      selectedCategory === null
        ? true
        : transaction.categories?.name ===
          selectedCategory

    return (
      matchMonth &&
      matchCategory
    )
  })

  // =========================
  // TOTALS
  // =========================

  const totalIncome =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === 'income'
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      )

  const totalExpense =
    filteredTransactions
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

  const fixedExpense =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.categories?.type ===
          'fixed'
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      )

  const variableExpense =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.categories?.type ===
          'variable'
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      )

  // =========================
  // CATEGORY SUMMARY
  // =========================

  const categorySummary = categories.map(
    (category) => {
      const total =
        filteredTransactions
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
  // FETCH DATA
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
    fetchCategories()
    fetchTransactions()
  }, [])
  
{/* CATEGORY MANAGEMENT */}

<div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

  <h2 className="text-2xl font-extrabold text-black mb-4">
    Quản lý danh mục
  </h2>

  <div className="flex flex-col gap-3">

    {categories.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between bg-gray-50 p-4 rounded-xl"
      >
        <p className="font-semibold text-black">
          {item.name}
        </p>

        <div className="flex items-center gap-2">

          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-lg"
          >
            Sửa
          </button>

          <button
            className="bg-red-500 text-white px-3 py-1 rounded-lg"
          >
            Xoá
          </button>

        </div>
      </div>
    ))}

  </div>
</div>

  // =========================
  // ADD TRANSACTION
  // =========================

  const addTransaction = async () => {
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          amount: Number(amount),

          type: type,

          category_id:
            type === 'expense'
              ? Number(category)
              : null,

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
const deleteTransaction = async (
  id: number
) => {
  const confirmDelete = window.confirm(
    'Bạn chắc chắn muốn xoá?'
  )
const deleteCategory = async (
  id: number
) => {

  const relatedTransactions =
    transactions.filter(
      (transaction) =>
        transaction.category_id === id
    )

  if (
    relatedTransactions.length > 0
  ) {
    alert(
      'Danh mục đang có giao dịch, không thể xoá!'
    )

    return
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error)

    alert('Xoá thất bại!')
  } else {
    alert('Đã xoá category')

    fetchCategories()
  }
}
  if (!confirmDelete) return

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error)
    alert('Xoá thất bại!')
  } else {
    alert('Đã xoá giao dịch')

    fetchTransactions()
  }
}
const updateTransaction = async (
  id: number
) => {
  const { error } = await supabase
    .from('transactions')
    .update({
      amount: Number(editAmount),
      note: editNote,
    })
    .eq('id', id)

  if (error) {
    console.log(error)
    alert('Cập nhật thất bại!')
  } else {
    alert('Đã cập nhật')

    setEditingId(null)

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

        <div className="flex items-center justify-between gap-3 mb-6">

          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1">
            <p className="text-sm text-gray-500 mb-1">
              Hôm nay
            </p>

            <p className="font-bold text-black">
              📅{' '}
              {new Date().toLocaleDateString(
                'vi-VN',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                Number(e.target.value)
              )
            }
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-1 text-black font-semibold"
          >
            {Array.from({
              length: 12,
            }).map((_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                Tháng {index + 1}
              </option>
            ))}
          </select>
        </div>

        {/* TITLE */}

        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">
            💸
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-black">
            Sổ chi tiêu
          </h1>
        </div>

        {/* ADD TRANSACTION */}

        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4 mb-6">

          {/* TYPE */}

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl text-black font-medium"
          >
            <option value="expense">
              Chi tiêu
            </option>

            <option value="income">
              Thu nhập
            </option>
          </select>

          {/* CATEGORY */}

          {type === 'expense' && (
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="bg-white border border-gray-300 p-4 rounded-xl text-black font-medium"
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
          )}

          {/* AMOUNT */}

          <input
            type="number"
            placeholder="Số tiền"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl text-black"
          />

          {/* NOTE */}

          <input
            type="text"
            placeholder="Ghi chú"
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            className="bg-white border border-gray-300 p-4 rounded-xl text-black"
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

          <p
            className={`text-4xl font-extrabold tracking-tight ${
              remainingBalance >= 0
                ? 'text-green-600'
                : 'text-red-500'
            }`}
          >
            {remainingBalance.toLocaleString()}đ
          </p>
        </div>

        {/* CATEGORY SUMMARY */}

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">

          <h2 className="text-2xl font-extrabold tracking-tight text-black mb-4">
            Chi tiêu theo danh mục
          </h2>
<div className="mb-4">

  <button
    onClick={() =>
      setSelectedCategory(null)
    }
    className={`px-4 py-2 rounded-xl font-medium transition ${
      selectedCategory === null
        ? 'bg-black text-white'
        : 'bg-gray-100 text-black'
    }`}
  >
    Tất cả
  </button>

</div>
          <div className="flex flex-col gap-3">

            {categorySummary
              .filter(
                (item) => item.total > 0
              )
              .map((item) => (
                <button
  key={item.name}
  onClick={() =>
    setSelectedCategory(item.name)
  }
  className={`flex items-center justify-between p-4 rounded-xl transition w-full ${
    selectedCategory === item.name
      ? 'bg-black text-white'
      : 'bg-gray-50'
  }`}
>
                  <p className="font-medium text-gray-800">
                    {item.name}
                  </p>

                  <p className="font-bold text-black">
                    {item.total.toLocaleString()}đ
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* PIE CHART */}

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
    (item) =>
      item.total > 0
  )}
  dataKey="total"
  nameKey="name"
  outerRadius={75}

  onClick={(data) => {
  setSelectedCategory(
    data?.name || null
  )
}}
                  label={({
                    name,
                    percent,
                  }) =>
                    `${name} ${(
                      ((percent ??
                        0) as number) *
                      100
                    ).toFixed(0)}%`
                  }
                >
                  <Cell
  fill="#3B82F6"
  cursor="pointer"
/>

<Cell
  fill="#22C55E"
  cursor="pointer"
/>

<Cell
  fill="#F97316"
  cursor="pointer"
/>

<Cell
  fill="#EC4899"
  cursor="pointer"
/>

<Cell
  fill="#8B5CF6"
  cursor="pointer"
/>

<Cell
  fill="#EAB308"
  cursor="pointer"
/>

<Cell
  fill="#14B8A6"
  cursor="pointer"
/>

<Cell
  fill="#EF4444"
  cursor="pointer"
/>

<Cell
  fill="#6366F1"
  cursor="pointer"
/>

<Cell
  fill="#F43F5E"
  cursor="pointer"
/>
                </Pie>

              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TRANSACTIONS */}

        <div className="flex flex-col gap-4">

          <h2 className="text-2xl font-extrabold tracking-tight text-black mb-2">
            Recent Transactions
          </h2>
          {selectedCategory && (
  <p className="text-sm text-gray-500 mb-3">
    Đang xem danh mục:
    <span className="font-bold text-black ml-1">
      {selectedCategory}
    </span>
  </p>
)}
          {filteredTransactions.length ===
          0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
              No transactions yet
            </div>
          ) : (
            filteredTransactions.map(
              (transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">

                    <div>
  {editingId ===
  transaction.id ? (
    <div className="flex flex-col gap-2">

      <input
        type="number"
        value={editAmount}
        onChange={(e) =>
          setEditAmount(
            e.target.value
          )
        }
        className="border p-2 rounded-lg"
      />

      <input
        type="text"
        value={editNote}
        onChange={(e) =>
          setEditNote(
            e.target.value
          )
        }
        className="border p-2 rounded-lg"
      />

      <button
        onClick={() =>
          updateTransaction(
            transaction.id
          )
        }
        className="bg-black text-white px-3 py-2 rounded-lg"
      >
        Cập nhật
      </button>
    </div>
  ) : (
    <>
      <p className="font-semibold text-black">
        {transaction.note ||
          'Không có ghi chú'}
      </p>

<p className="text-xs text-gray-400 mt-1">
  📅{' '}
  {new Date(
    transaction.created_at
  ).toLocaleDateString(
    'vi-VN',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
  )}
</p>

      <p className="text-sm text-gray-500">
        {
          transaction.categories
            ?.name
        }
      </p>
    </>
  )}
</div>

                    <p
                      className={`font-bold ${
                        transaction.type ===
                        'income'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.type ===
                      'income'
                        ? '+'
                        : '-'}
                      {transaction.amount.toLocaleString()}
                      đ
                    </p>
<button
  onClick={() => {
    setEditingId(
      transaction.id
    )

    setEditAmount(
      transaction.amount
    )

    setEditNote(
      transaction.note || ''
    )
  }}
  className="ml-3 text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
>
  Sửa
</button>

<button
  onClick={() =>
    deleteTransaction(
      transaction.id
    )
  }
  className="ml-3 text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
>
  Xoá
</button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </main>
  )
}