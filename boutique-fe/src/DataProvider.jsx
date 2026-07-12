import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import { DataContext } from './dataContext.js'

const rowToProfile = (r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  date: r.date,
  garments: r.garments ?? [],
})

const profileToRow = (p) => ({
  id: p.id,
  name: p.name,
  phone: p.phone,
  date: p.date,
  garments: p.garments,
})

const rowToTx = (r) => ({
  id: r.id,
  client: r.client,
  phone: r.phone,
  item: r.item,
  date: r.date,
  amount: Number(r.amount),
  received: Number(r.received),
  method: r.method,
  notes: r.notes,
  billNames: r.bill_names ?? [],
})

const txToRow = (t) => ({
  id: t.id,
  client: t.client,
  phone: t.phone,
  item: t.item,
  date: t.date,
  amount: t.amount,
  received: t.received,
  method: t.method,
  notes: t.notes,
  bill_names: t.billNames,
})

function DataProvider({ children }) {
  const [profiles, setProfiles] = useState([])
  const [txs, setTxs] = useState([])
  const [ready, setReady] = useState(false)
  const [dbError, setDbError] = useState('')

  const fetchAll = useCallback(async () => {
    const [p, t] = await Promise.all([
      supabase.from('measurements').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
    ])
    if (p.error || t.error) {
      setDbError('Could not reach the database — check your connection and refresh.')
    } else {
      setProfiles(p.data.map(rowToProfile))
      setTxs(t.data.map(rowToTx))
      setDbError('')
    }
    setReady(true)
  }, [])

  useEffect(() => {
    // fetchAll is async — state updates happen after awaited network I/O, not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll()
    const channel = supabase
      .channel('boutique-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'measurements' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchAll)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const addProfile = async (p) => {
    const { data, error } = await supabase
      .from('measurements')
      .insert(profileToRow(p))
      .select()
      .single()
    if (error) return error.message
    setProfiles((cur) => [rowToProfile(data), ...cur.filter((x) => x.id !== data.id)])
    return null
  }

  const updateProfile = async (p) => {
    const { data, error } = await supabase
      .from('measurements')
      .update(profileToRow(p))
      .eq('id', p.id)
      .select()
      .single()
    if (error) return error.message
    setProfiles((cur) => cur.map((x) => (x.id === data.id ? rowToProfile(data) : x)))
    return null
  }

  const deleteProfile = async (id) => {
    const { error } = await supabase.from('measurements').delete().eq('id', id)
    if (error) return error.message
    setProfiles((cur) => cur.filter((x) => x.id !== id))
    return null
  }

  const addTx = async (t) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(txToRow(t))
      .select()
      .single()
    if (error) return error.message
    setTxs((cur) => [rowToTx(data), ...cur.filter((x) => x.id !== data.id)])
    return null
  }

  const updateTx = async (t) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(txToRow(t))
      .eq('id', t.id)
      .select()
      .single()
    if (error) return error.message
    setTxs((cur) => cur.map((x) => (x.id === data.id ? rowToTx(data) : x)))
    return null
  }

  const deleteTx = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return error.message
    setTxs((cur) => cur.filter((x) => x.id !== id))
    return null
  }

  return (
    <DataContext.Provider
      value={{
        profiles,
        txs,
        ready,
        dbError,
        addProfile,
        updateProfile,
        deleteProfile,
        addTx,
        updateTx,
        deleteTx,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export default DataProvider
