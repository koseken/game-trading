'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import type { LoginInput, RegisterInput } from '@/lib/validations/auth'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          // Fetch user data from users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          setAuthState({ user: userData, loading: false })
        } else {
          setAuthState({ user: null, loading: false })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setAuthState({ user: null, loading: false })
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setAuthState({ user: userData, loading: false })
      } else {
        setAuthState({ user: null, loading: false })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (input: LoginInput) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error) throw error

      // Fetch user data
      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        setAuthState({ user: userData, loading: false })
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { data: null, error: error.message || 'ログインに失敗しました' }
    }
  }

  const signUp = async (input: RegisterInput) => {
    try {
      // First, check if username is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', input.username)
        .single()

      if (existingUser) {
        return {
          data: null,
          error: 'このユーザー名は既に使用されています',
        }
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('ユーザーの作成に失敗しました')
      }

      // Create user record in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: input.email,
          username: input.username,
        })
        .select()
        .single()

      if (userError) {
        // If user creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw userError
      }

      setAuthState({ user: userData, loading: false })

      return { data: authData, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return {
        data: null,
        error: error.message || 'アカウント作成に失敗しました',
      }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setAuthState({ user: null, loading: false })
      router.push('/')
      router.refresh()

      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { error: error.message || 'ログアウトに失敗しました' }
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
  }
}
