import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  Search, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  UserX,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Globe,
  ExternalLink
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useFeatures, CORE_FEATURE_PATHS } from '../hooks/useFeatures'
import type { AdminUser, UserRole, SystemFeature } from '../types'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export default function AccessManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'features'>('users')

  // --- Gerenciamento de Usuários ---
  const { users, isLoading: isLoadingUsers, isError: isErrorUsers, error: errorUsers, refetch: refetchUsers, updateRole } = useAdminUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    user: AdminUser
    targetRole: UserRole
  } | null>(null)

  // --- Gerenciamento de Telas & Funcionalidades ---
  const { 
    features, 
    isLoading: isLoadingFeatures, 
    refetch: refetchFeatures, 
    toggleFeature, 
    addFeature, 
    deleteFeature 
  } = useFeatures()
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false)
  const [newFeatureName, setNewFeatureName] = useState('')
  const [newFeaturePath, setNewFeaturePath] = useState('')
  const [newFeatureDescription, setNewFeatureDescription] = useState('')
  const [newFeatureIcon, setNewFeatureIcon] = useState('Sparkles')
  const [featureSearchTerm, setFeatureSearchTerm] = useState('')

  // Identifica o usuário logado atualmente
  const { data: currentProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return data
    }
  })

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type })
    setTimeout(() => {
      setFeedbackMessage(null)
    }, 4000)
  }

  // Ações de Usuário
  const handleRoleChangeRequest = (user: AdminUser, targetRole: UserRole) => {
    if (user.role === targetRole) return
    if (user.id === currentProfile?.id && targetRole !== 'admin') {
      showNotification('Você não pode revogar seu próprio acesso de administrador!', 'error')
      return
    }
    setConfirmModal({ user, targetRole })
  }

  const executeRoleChange = async () => {
    if (!confirmModal) return
    try {
      await updateRole.mutateAsync({
        userId: confirmModal.user.id,
        newRole: confirmModal.targetRole,
      })
      showNotification(
        `Função de ${confirmModal.user.display_name || confirmModal.user.email} atualizada para ${confirmModal.targetRole === 'admin' ? 'Administrador' : 'Usuário'}.`,
        'success'
      )
    } catch (err: any) {
      showNotification(err.message || 'Erro ao alterar permissão.', 'error')
    } finally {
      setConfirmModal(null)
    }
  }

  // Ações de Telas / Features
  const handleToggleFeature = async (feature: SystemFeature) => {
    const nextState = !feature.is_active_for_users
    try {
      await toggleFeature.mutateAsync({
        id: feature.id,
        isActiveForUsers: nextState,
      })
      showNotification(
        nextState
          ? `Tela "${feature.name}" liberada para todos os usuários!`
          : `Tela "${feature.name}" restrita apenas para Administradores.`,
        'success'
      )
    } catch (err: any) {
      showNotification(err.message || 'Erro ao atualizar tela.', 'error')
    }
  }

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFeatureName.trim() || !newFeaturePath.trim()) return

    // Normaliza rota
    let formattedPath = newFeaturePath.trim()
    if (!formattedPath.startsWith('/')) {
      formattedPath = `/${formattedPath}`
    }

    const generatedId = formattedPath.replace('/', '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || `feat-${Date.now()}`

    try {
      await addFeature.mutateAsync({
        id: generatedId,
        name: newFeatureName.trim(),
        path: formattedPath,
        icon: newFeatureIcon,
        description: newFeatureDescription.trim(),
      })
      showNotification(`Tela "${newFeatureName}" criada com sucesso! Visível apenas para Admin.`, 'success')
      setNewFeatureName('')
      setNewFeaturePath('')
      setNewFeatureDescription('')
      setNewFeatureIcon('Sparkles')
      setIsAddFeatureModalOpen(false)
    } catch (err: any) {
      showNotification(err.message || 'Erro ao cadastrar nova tela.', 'error')
    }
  }

  const handleDeleteFeature = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a tela "${name}" das funcionalidades do sistema?`)) {
      return
    }
    try {
      await deleteFeature.mutateAsync(id)
      showNotification(`Tela "${name}" removida com sucesso.`, 'success')
    } catch (err: any) {
      showNotification(err.message || 'Erro ao remover tela.', 'error')
    }
  }

  // Métricas de Usuários
  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === 'admin').length
    const standardUsers = total - admins
    const activeRecently = users.filter((u) => {
      if (!u.last_sign_in_at) return false
      const lastLogin = new Date(u.last_sign_in_at).getTime()
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      return lastLogin > thirtyDaysAgo
    }).length

    return { total, admins, standardUsers, activeRecently }
  }, [users])

  // Filtros de Usuários
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  // Filtros de Telas
  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      return (
        f.name.toLowerCase().includes(featureSearchTerm.toLowerCase()) ||
        f.path.toLowerCase().includes(featureSearchTerm.toLowerCase()) ||
        (f.description?.toLowerCase().includes(featureSearchTerm.toLowerCase()) || false)
      )
    })
  }, [features, featureSearchTerm])

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return name.slice(0, 2).toUpperCase()
    }
    if (email) return email.slice(0, 2).toUpperCase()
    return 'US'
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 lg:p-12 font-sans overflow-x-hidden">
      {/* Luz ambiente de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] right-[5%] w-[320px] lg:w-[450px] h-[320px] lg:h-[450px] bg-primary/5 rounded-full blur-[90px] lg:blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[320px] lg:w-[450px] h-[320px] lg:h-[450px] bg-secondary/5 rounded-full blur-[90px] lg:blur-[120px]" />
      </div>

      {/* Notificação flutuante */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
              feedbackMessage.type === 'success'
                ? 'bg-secondary-container/90 border-secondary/30 text-white shadow-neon-secondary'
                : 'bg-red-950/90 border-red-500/40 text-red-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-tertiary shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-primary w-4 h-4 shadow-neon-primary" />
            <span className="label-architectural mb-0 text-[10px]">PAINEL ADMINISTRATIVO</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">
            Gestão de <span className="text-primary">Acessos</span>
          </h1>
          <p className="text-white/40 text-xs lg:text-sm mt-1">
            Controle de usuários e liberação granular de telas e funcionalidades do Starkin Finance.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {activeTab === 'features' && (
            <Button
              onClick={() => setIsAddFeatureModalOpen(true)}
              className="h-11 px-4 text-xs font-bold flex items-center gap-2 shadow-neon-primary"
            >
              <Plus className="w-4 h-4" />
              Nova Tela / Módulo
            </Button>
          )}

          <Button
            onClick={() => {
              if (activeTab === 'users') refetchUsers()
              else refetchFeatures()
            }}
            variant="secondary"
            className="h-11 px-4 text-xs font-bold flex items-center gap-2 border-white/10 hover:border-primary/40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingUsers || isLoadingFeatures ? 'animate-spin text-primary' : ''}`} />
            Atualizar
          </Button>
        </div>
      </header>

      {/* Abas Superiores */}
      <div className="flex items-center gap-2 mb-8 relative z-10 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            activeTab === 'users'
              ? 'bg-primary text-background shadow-neon-primary'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários & Permissões</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
            activeTab === 'users' ? 'bg-background/20 text-background' : 'bg-white/10 text-white/60'
          }`}>
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            activeTab === 'features'
              ? 'bg-secondary text-background shadow-neon-secondary'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Controle de Telas (Feature Flags)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
            activeTab === 'features' ? 'bg-background/20 text-background' : 'bg-white/10 text-white/60'
          }`}>
            {features.length}
          </span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: USUÁRIOS */}
      {activeTab === 'users' && (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 lg:p-5 border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="label-architectural text-[9px] lg:text-[10px]">TOTAL DE USUÁRIOS</span>
                <Users className="w-4 h-4 text-primary/70" />
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {stats.total}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Cadastrados na plataforma</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-4 lg:p-5 border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="label-architectural text-[9px] lg:text-[10px]">ADMINISTRADORES</span>
                <ShieldCheck className="w-4 h-4 text-secondary/80" />
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold text-secondary tracking-tight">
                {stats.admins}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Acesso irrestrito ao sistema</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 lg:p-5 border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="label-architectural text-[9px] lg:text-[10px]">USUÁRIOS COMUNS</span>
                <UserCheck className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {stats.standardUsers}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Acesso padrão às finanças</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-4 lg:p-5 border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="label-architectural text-[9px] lg:text-[10px]">ATIVOS (30 DIAS)</span>
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold text-primary tracking-tight">
                {stats.activeRecently}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Com sessão recente</span>
            </motion.div>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="glass-card p-4 lg:p-5 mb-6 relative z-10 border-white/5">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-lowest border border-white/10 rounded-md pl-10 pr-4 py-2.5 text-xs lg:text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-surface-lowest border border-white/10 rounded-md self-start lg:self-auto">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    roleFilter === 'all'
                      ? 'bg-primary text-background shadow-neon-primary'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  Todos ({stats.total})
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    roleFilter === 'admin'
                      ? 'bg-secondary text-background shadow-neon-secondary'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  Admins ({stats.admins})
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    roleFilter === 'user'
                      ? 'bg-white/20 text-white'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  Padrão ({stats.standardUsers})
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="relative z-10">
            {isLoadingUsers ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-surface-container-low rounded-md animate-pulse" />
                ))}
              </div>
            ) : isErrorUsers ? (
              <div className="p-10 text-center glass-card border-red-500/20">
                <ShieldAlert className="w-12 h-12 text-tertiary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Acesso Restrito</h3>
                <p className="text-white/40 text-sm max-w-md mx-auto mb-4">
                  {errorUsers instanceof Error ? errorUsers.message : 'Não foi possível carregar a lista de usuários.'}
                </p>
                <Button onClick={() => refetchUsers()} variant="secondary">
                  Tentar Novamente
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center glass-card border-white/5">
                <UserX className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 font-medium text-sm">
                  Nenhum usuário encontrado para os critérios selecionados.
                </p>
              </div>
            ) : (
              <div className="glass-card border-white/5 overflow-hidden">
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-surface-container-low/70 border-b border-white/5 text-[10px] font-extrabold tracking-wider text-white/40 uppercase">
                  <div className="col-span-4">Usuário</div>
                  <div className="col-span-2">Papel / Função</div>
                  <div className="col-span-2">Criado em</div>
                  <div className="col-span-2">Último Acesso</div>
                  <div className="col-span-2 text-right">Ação de Acesso</div>
                </div>

                <div className="divide-y divide-white/5">
                  {filteredUsers.map((user, index) => {
                    const isAdmin = user.role === 'admin'
                    const isCurrentUser = user.id === currentProfile?.id

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-4 lg:px-6 lg:py-4 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center hover:bg-surface-container-highest/40 transition-colors"
                      >
                        <div className="lg:col-span-4 flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                              isAdmin
                                ? 'bg-primary/20 text-primary border-primary/30 shadow-neon-primary'
                                : 'bg-white/5 text-white/60 border-white/10'
                            }`}
                          >
                            {getInitials(user.display_name, user.email)}
                          </div>

                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white truncate">
                                {user.display_name || 'Sem nome definido'}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-extrabold bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/40 truncate flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-white/30" />
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="lg:col-span-2 flex items-center">
                          {isAdmin ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-secondary/15 text-secondary border border-secondary/30 shadow-neon-secondary">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ADMINISTRADOR</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-white/60 border border-white/10">
                              <Users className="w-3.5 h-3.5 text-white/40" />
                              <span>USUÁRIO</span>
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-2 text-xs text-white/60 flex items-center gap-1.5">
                          <span className="lg:hidden text-white/30 text-[10px] uppercase font-bold">Criado:</span>
                          <Calendar className="w-3.5 h-3.5 text-white/30 hidden lg:inline" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>

                        <div className="lg:col-span-2 text-xs flex items-center gap-1.5">
                          <span className="lg:hidden text-white/30 text-[10px] uppercase font-bold">Acesso:</span>
                          <Clock className="w-3.5 h-3.5 text-white/30 hidden lg:inline" />
                          {user.last_sign_in_at ? (
                            <span className="text-white/80">{formatDate(user.last_sign_in_at)}</span>
                          ) : (
                            <span className="text-white/30 italic">Nunca acessou</span>
                          )}
                        </div>

                        <div className="lg:col-span-2 flex lg:justify-end items-center gap-2 pt-2 lg:pt-0 border-t border-white/5 lg:border-none">
                          {isAdmin ? (
                            <button
                              onClick={() => handleRoleChangeRequest(user, 'user')}
                              disabled={isCurrentUser || updateRole.isPending}
                              title={isCurrentUser ? 'Você não pode rebaixar seu próprio perfil' : 'Alterar para Usuário comum'}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                isCurrentUser
                                  ? 'opacity-30 cursor-not-allowed bg-transparent border-white/5 text-white/30'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-tertiary/10 hover:border-tertiary/40 hover:text-tertiary'
                              }`}
                            >
                              Tornar Usuário
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChangeRequest(user, 'admin')}
                              disabled={updateRole.isPending}
                              className="px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:shadow-neon-primary"
                            >
                              Promover a Admin
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* CONTEÚDO DA ABA 2: CONTROLE DE TELAS & FUNCIONALIDADES */}
      {activeTab === 'features' && (
        <div className="space-y-6 relative z-10">
          {/* Caixa de Explicação da Regra */}
          <div className="glass-card p-5 border border-primary/20 bg-primary/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-neon-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-xs lg:text-sm">
              <h4 className="font-extrabold text-white text-sm lg:text-base mb-1 flex items-center gap-2">
                Política de Liberação de Funcionalidades
              </h4>
              <p className="text-white/60 leading-relaxed">
                As telas base (<strong className="text-white">Dashboard, Entradas, Variáveis, Fixos, Parcelas e Categorias</strong>) são recursos padrão liberados para todos os usuários. Novas telas cadastradas são <span className="text-secondary font-bold">automaticamente restritas ao Administrador</span>. Somente quando o desenvolvimento estiver concluído, ative o switch para disponibilizá-la aos usuários do sistema!
              </p>
            </div>
          </div>

          {/* Barra de Busca de Telas */}
          <div className="glass-card p-4 lg:p-5 border-white/5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar funcionalidade por nome, rota ou descrição..."
                value={featureSearchTerm}
                onChange={(e) => setFeatureSearchTerm(e.target.value)}
                className="w-full bg-surface-lowest border border-white/10 rounded-md pl-10 pr-4 py-2.5 text-xs lg:text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Grid de Telas */}
          {isLoadingFeatures ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-surface-container-low rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="py-16 text-center glass-card border-white/5">
              <Layers className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 font-medium text-sm">
                Nenhuma tela encontrada.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeatures.map((feature) => {
                const isCore = feature.is_core || CORE_FEATURE_PATHS.includes(feature.path)
                const IconComponent = (LucideIcons as any)[feature.icon || 'Sparkles'] || Sparkles
                const isReleased = feature.is_active_for_users

                return (
                  <motion.div
                    key={feature.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`glass-card p-5 flex flex-col justify-between border transition-all ${
                      isReleased
                        ? 'border-secondary/20 bg-surface-container-high/60 shadow-neon-secondary'
                        : 'border-white/5 bg-surface-container-high/30'
                    }`}
                  >
                    <div>
                      {/* Top Header do Card */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
                              isReleased
                                ? 'bg-secondary/15 text-secondary border-secondary/30 shadow-neon-secondary'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                              {feature.name}
                            </h3>
                            <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                              {feature.path}
                            </span>
                          </div>
                        </div>

                        {!isCore && (
                          <button
                            onClick={() => handleDeleteFeature(feature.id, feature.name)}
                            disabled={deleteFeature.isPending}
                            className="p-1.5 rounded-md hover:bg-tertiary/10 text-white/20 hover:text-tertiary transition-colors"
                            title="Remover tela customizada"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Descrição */}
                      <p className="text-xs text-white/50 mb-5 min-h-[32px] line-clamp-2">
                        {feature.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>

                    {/* Rodapé e Controle de Acesso */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      {isCore ? (
                        <div className="flex items-center gap-1.5 text-xs text-secondary font-bold">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                          <span className="text-[11px] uppercase tracking-wider">Padrão (Liberada)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {isReleased ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-secondary/15 text-secondary border border-secondary/30">
                              <Globe className="w-3 h-3" />
                              LIBERADA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary border border-primary/30">
                              <Lock className="w-3 h-3" />
                              APENAS ADMIN
                            </span>
                          )}
                        </div>
                      )}

                      {/* Switch de Ativação */}
                      {isCore ? (
                        <button
                          onClick={() => handleToggleFeature(feature)}
                          disabled={toggleFeature.isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isReleased
                              ? 'bg-secondary/20 border-secondary/40 text-secondary'
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                          }`}
                          title="Alternar visibilidade para usuários comuns"
                        >
                          {isReleased ? 'Liberada' : 'Oculta'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleFeature(feature)}
                          disabled={toggleFeature.isPending}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            isReleased
                              ? 'bg-secondary text-background border-secondary font-extrabold shadow-neon-secondary'
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }`}
                        >
                          {isReleased ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Liberada
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Liberar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Nova Tela / Feature */}
      <AnimatePresence>
        {isAddFeatureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddFeatureModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-surface-container-high rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shadow-neon-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Cadastrar Nova Tela / Módulo
                  </h3>
                  <p className="text-xs text-white/40">
                    Nascerá liberada apenas para você (Admin) até ser finalizada.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateFeature} className="space-y-4">
                <Input
                  label="Nome da Tela / Funcionalidade"
                  placeholder="Ex: Investimentos, Relatórios, Metas..."
                  required
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                />

                <Input
                  label="Caminho / Rota URL"
                  placeholder="Ex: /investments ou /reports"
                  required
                  value={newFeaturePath}
                  onChange={(e) => setNewFeaturePath(e.target.value)}
                />

                <Input
                  label="Descrição (Opcional)"
                  placeholder="Ex: Painel de acompanhamento de ações e fundos imobiliários"
                  value={newFeatureDescription}
                  onChange={(e) => setNewFeatureDescription(e.target.value)}
                />

                <div>
                  <label className="label-architectural text-[10px]">NOME DO ÍCONE LUCIDE (OPCIONAL)</label>
                  <input
                    type="text"
                    placeholder="Ex: TrendingUp, PieChart, FileText, Sparkles..."
                    value={newFeatureIcon}
                    onChange={(e) => setNewFeatureIcon(e.target.value)}
                    className="w-full bg-surface-lowest border border-white/15 rounded-md px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-lowest border border-white/5 text-[11px] text-white/60 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Status inicial: <strong>Restrita a Admin</strong> (Usuários comuns não verão a tela até sua liberação).
                  </span>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 h-11"
                    onClick={() => setIsAddFeatureModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 shadow-neon-primary"
                    isLoading={addFeature.isPending}
                  >
                    Salvar e Criar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Mudança de Papel */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-surface-container-high rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mb-5 shadow-neon-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-extrabold mb-2 text-white">
                Confirmar Alteração de Acesso
              </h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Você tem certeza que deseja definir o usuário{' '}
                <strong className="text-white font-bold">
                  {confirmModal.user.display_name || confirmModal.user.email}
                </strong>{' '}
                como{' '}
                <span className={confirmModal.targetRole === 'admin' ? 'text-secondary font-bold' : 'text-primary font-bold'}>
                  {confirmModal.targetRole === 'admin' ? 'Administrador' : 'Usuário Comum'}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 h-11"
                  onClick={() => setConfirmModal(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-11 shadow-neon-primary"
                  isLoading={updateRole.isPending}
                  onClick={executeRoleChange}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
