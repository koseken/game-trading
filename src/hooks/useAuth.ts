'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Database } from '@/types/database'
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
    } catch (err: unknown) {
      console.error('Sign in error:', err)
      const message = err instanceof Error ? err.message : 'ログインに失敗しました'
      return { data: null, error: message }
    }
  }

  const signUp = async (input: RegisterInput) => {
    try {
      // First, check if username is already taken
      const { data: existingUsers } = await supabase
        .from('users')
        .select('username')
        .eq('username', input.username)

      if (existingUsers && existingUsers.length > 0) {
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

      if (authError) {
        return {
          data: null,
          error: authError.message || 'アカウント作成に失敗しました',
        }
      }

      if (!authData.user) {
        return {
          data: null,
          error: 'ユーザーの作成に失敗しました',
        }
      }

      // Create user record in users table
      const newUser: Database['public']['Tables']['users']['Insert'] = {
        id: authData.user.id,
        email: input.email,
        username: input.username,
      }
      const { data: userData, error: userError } = await (supabase
        .from('users')
        // @ts-expect-error - Supabase type inference issue
        .insert(newUser)
        .select()
        .single())

      if (userError) {
        // If user creation fails, we can't use admin API from client
        // The auth user will remain but without a profile
        console.error('Failed to create user profile:', userError)
        return {
          data: null,
          error: userError.message || 'ユーザープロフィールの作成に失敗しました',
        }
      }

      setAuthState({ user: userData, loading: false })

      return { data: authData, error: null }
    } catch (err: unknown) {
      console.error('Sign up error:', err)
      const message =
        err instanceof Error ? err.message :
        (err && typeof err === 'object' && 'message' in err) ? String(err.message) :
        'アカウント作成に失敗しました'
      return {
        data: null,
        error: message,
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
    } catch (err: unknown) {
      console.error('Sign out error:', err)
      const message = err instanceof Error ? err.message : 'ログアウトに失敗しました'
      return { error: message }
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
