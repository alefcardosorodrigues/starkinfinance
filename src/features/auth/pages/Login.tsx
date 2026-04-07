import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, UserPlus, Sparkles } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // Garante que qualquer sessão anterior seja encerrada antes de logar com novo usuário
        await supabase.auth.signOut()

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        alert('Confirme seu e-mail para continuar!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 lg:p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[300px] lg:w-[40%] h-[300px] lg:h-[40%] rounded-full bg-primary/5 blur-[80px] lg:blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[300px] lg:w-[40%] h-[300px] lg:h-[40%] rounded-full bg-secondary/5 blur-[80px] lg:blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-6 lg:p-10 z-10 border-white/5 mx-auto"
      >
        <div className="flex flex-col items-center mb-8 lg:mb-10">
          <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-md bg-primary-gradient flex items-center justify-center mb-4 shadow-neon-primary">
            <Sparkles className="text-background w-5 h-5 lg:w-7 lg:h-7" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">
            Starkin <span className="text-primary">Finance</span>
          </h1>
          <p className="text-white/40 text-[10px] lg:text-sm font-medium tracking-widest uppercase">
            PRECISION LUMINESCENCE
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 lg:space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            label="Email"
            type="email"
            placeholder="exemplo@starkin.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || undefined}
          />

          <Button type="submit" className="w-full h-12 lg:h-14 font-extrabold shadow-neon-primary mt-2" isLoading={loading}>
            {isLogin ? (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Criar Conta
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 lg:mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs lg:text-sm text-white/50 hover:text-white transition-colors touch-manipulation font-medium"
          >
            {isLogin ? (
              <>Não tem uma conta? <span className="text-primary font-bold">Cadastre-se</span></>
            ) : (
              <>Já possui uma conta? <span className="text-primary font-bold">Faça login</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
