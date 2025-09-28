import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface Column {
  id: string;
  tasks: { id: string; text: string }[];
}

export const useUserData = (user: User | null) => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'initial-column',
      tasks: []
    }
  ])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      // Reset to default when user logs out
      setColumns([{
        id: 'initial-column',
        tasks: []
      }])
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_boards')
        .select('board_data')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user data:', error)
        return
      }

      if (data?.board_data) {
        setColumns(data.board_data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveUserData = async (columnsData: Column[]) => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_boards')
        .upsert(
          {
            user_id: user.id,
            board_data: columnsData,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) {
        console.error('Error saving user data:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error saving user data:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    columns,
    setColumns,
    loading,
    saving,
    saveUserData,
    loadUserData,
  }
}
