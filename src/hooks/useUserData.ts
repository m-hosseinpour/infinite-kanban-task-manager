import { createSignal, createEffect, Accessor } from 'solid-js'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface Column {
  id: string;
  tasks: { id: string; text: string }[];
}

export const createUserData = (user: Accessor<User | null>) => {
  const [columns, setColumns] = createSignal<Column[]>([
    {
      id: 'initial-column',
      tasks: []
    }
  ])
  const [loading, setLoading] = createSignal(false)
  const [saving, setSaving] = createSignal(false)

  const loadUserData = async () => {
    const currentUser = user()
    if (!currentUser) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_boards')
        .select('board_data')
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
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

  createEffect(() => {
    if (user()) {
      loadUserData()
    } else {
      setColumns([{
        id: 'initial-column',
        tasks: []
      }])
    }
  })

  const saveUserData = async (columnsData: Column[]) => {
    const currentUser = user()
    if (!currentUser) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_boards')
        .upsert(
          {
            user_id: currentUser.id,
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
