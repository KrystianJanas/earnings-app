import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiSave, FiCreditCard, FiGift, FiUsers, FiClock, FiCheckCircle, FiPlus, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { format, addDays, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { earningsAPI } from '../services/api'
import { Card, GlassCard, Button, Input, Label, media, GradientText } from '../styles/theme'
import Navigation from '../components/Navigation'
import ClientEntry from '../components/ClientEntry'

const AddEarningsContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 0;
  padding-bottom: 100px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.backgroundSecondary} 100%);
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;

  ${media.md`
    padding: ${({ theme }) => theme.spacing.md} 0;
    padding-bottom: 100px;
  `}

  ${media.lg`
    padding: ${({ theme }) => theme.spacing.lg} 0;
    padding-bottom: ${({ theme }) => theme.spacing.lg};
  `}
`

const Container = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  ${media.md`
    max-width: 768px;
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing.lg};
  `}

  ${media.lg`
    max-width: 1200px;
    padding: 0 ${({ theme }) => theme.spacing.lg};
  `}

  ${media.xl`
    max-width: 1400px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
  `}
`

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  `}
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.5px;

  ${media.md`
    font-size: 2rem;
  `}

  ${media.lg`
    font-size: 2rem;
  `}
`

const SubText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  font-weight: 500;

  ${media.md`
    font-size: 1rem;
  `}

  ${media.lg`
    font-size: 1rem;
  `}
`

const FormCard = styled(motion(GlassCard))`
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing.sm};
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  border-radius: 0;
  box-shadow: none;

  ${media.md`
    max-width: 750px;
    margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
    padding: ${({ theme }) => theme.spacing.xl};
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%);
    backdrop-filter: ${({ theme }) => theme.blur.md};
    -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
    
    &:hover {
      box-shadow: 0 20px 60px rgba(139, 92, 246, 0.25);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.12) 100%);
    }
  `}

  ${media.lg`
    max-width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    padding: 40px;
  `}
`

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }
`

const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%);
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const DateNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const DateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  font-weight: 600;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: white;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
    transform: translateY(-3px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.3rem;
  }

  ${media.lg`
    width: 52px;
    height: 52px;
    svg {
      font-size: 1.4rem;
    }
  `}
`

const DateDisplay = styled.div`
  flex: 1;
  text-align: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%);
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 700;
  font-size: 1rem;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;

  &:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
  }

  ${media.lg`
    min-height: 52px;
    padding: 16px 24px;
    font-size: 1.05rem;
  `}
`

const DateInputWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  input {
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    background: transparent;
  }
`

const CalendarIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 1.1rem;
  pointer-events: none;
  transition: all 0.2s ease;

  ${DateDisplay}:hover & {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const AmountInputWrapper = styled.div`
  position: relative;
`

const AmountInput = styled(Input)`
  font-size: 1.05rem;
  font-weight: 600;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%);
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 500;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all ${({ theme }) => theme.transitions.normal};
  backdrop-filter: ${({ theme }) => theme.blur.xs};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.xs};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  ${media.md`
    min-height: 120px;
    padding: ${({ theme }) => theme.spacing.md};
    font-size: 1rem;
  `}
`

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    max-width: 700px;
    margin: 0 auto ${({ theme }) => theme.spacing.md} auto;
  }

  @media (min-width: 1024px) {
    max-width: 85vw;
  }

  @media (min-width: 1280px) {
    max-width: 85vw;
  }
`;

const ButtonSuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 16px;
  animation: fadeInOut 3s ease-in-out;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(15px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-15px); }
  }
  
  svg {
    color: ${({ theme }) => theme.colors.success};
    font-size: 1.2rem;
  }
`

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
`

const ModeToggle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  ${media.sm`
    gap: 12px;
    padding: ${({ theme }) => theme.spacing.lg};
  `}

  ${media.lg`
    flex-direction: row;
    gap: 12px;
    max-width: none;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    padding: ${({ theme }) => theme.spacing.lg};
  `}
`

const ModeButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 14px 20px;
  border: 2px solid ${({ active, disabled, theme }) =>
    disabled ? theme.colors.borderLight + '40' :
    active ? theme.colors.primary : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ active, disabled, theme }) =>
    disabled ? 'transparent' :
    active ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` : 'rgba(255, 255, 255, 0.02)'};
  color: ${({ active, disabled, theme }) =>
    disabled ? theme.colors.text.muted :
    active ? 'white' : theme.colors.text.primary};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all ${({ theme }) => theme.transitions.normal};
  flex: 1;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  min-height: 48px;
  width: 100%;

  ${media.sm`
    font-size: 0.95rem;
    padding: 14px 20px;
    min-height: 48px;
  `}

  ${media.lg`
    flex: 1;
    min-width: 180px;
    font-size: 0.95rem;
    padding: 14px 28px;
  `}

  &:hover:not(:disabled) {
    background: ${({ active, theme }) => active ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)'};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ active, theme }) => active ? `0 8px 24px ${theme.colors.primary}50` : '0 8px 24px rgba(139, 92, 246, 0.2)'};
    transform: translateY(-3px);
  }
`

const ClientsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ClientsSummary = styled(motion(GlassCard))`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%);
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-weight: 600;
  backdrop-filter: ${({ theme }) => theme.blur.md};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
  transition: all ${({ theme }) => theme.transitions.normal};
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};

  &:hover {
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.15);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.1) 100%);
  }

  div:first-child {
    font-size: 1.05rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  div:nth-child(2) {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  strong {
    background: ${({ theme }) => theme.colors.gradient.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.1rem;
  }

  div[style*="fontSize: 0.75rem"] {
    color: ${({ theme }) => theme.colors.error};
    font-weight: 500;
  }

  div[style*="fontSize: 0.8rem"] {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.85rem;
    font-weight: 500;
  }
`

const AddClientButton = styled(Button)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.success} 0%, ${({ theme }) => theme.colors.secondary}99 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 700;
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};
  min-height: 48px;

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.success}e6 0%, ${({ theme }) => theme.colors.secondary}99 100%);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.colors.success};
  }

  svg {
    font-size: 1.2rem;
  }
`

const GlobalFieldsSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const ResetHint = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const AddEarnings = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [successMessage, setSuccessMessage] = useState('')
  const [buttonSuccessMessage, setButtonSuccessMessage] = useState('')
  const [entryMode, setEntryMode] = useState('detailed') // 'summary' or 'detailed'
  
  const [clients, setClients] = useState([{ 
    amount: 0, 
    paymentMethod: 'cash', 
    notes: '', 
    clientName: '',
    payments: [{ amount: 0, method: 'cash' }] 
  }])
  const queryClient = useQueryClient()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      cashAmount: '',
      cardAmount: '',
      tipsAmount: '',
      clientsCount: '',
      hoursWorked: '',
      notes: ''
    }
  })

  // Fetch existing data for the selected date
  const { data: existingData, isLoading } = useQuery(
    ['dayEarnings', selectedDate],
    () => earningsAPI.getDayEarnings(selectedDate).then(res => res.data),
    {
      enabled: !!selectedDate,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        
        setEntryMode(data.entryMode || 'detailed')
        
        if (data.entryMode === 'detailed' && data.clients && data.clients.length > 0) {
          setClients(data.clients)
        } else if (data.entryMode !== 'detailed') {
          setClients([{ amount: 0, paymentMethod: 'cash', notes: '' }])
          setValue('cashAmount', data.cashAmount > 0 ? data.cashAmount.toString() : '')
          setValue('cardAmount', data.cardAmount > 0 ? data.cardAmount.toString() : '')
          setValue('clientsCount', data.clientsCount > 0 ? data.clientsCount.toString() : '')
        }
        
        setValue('tipsAmount', data.tipsAmount > 0 ? data.tipsAmount.toString() : '')
        setValue('hoursWorked', data.hoursWorked > 0 ? data.hoursWorked.toString() : '')
        setValue('notes', data.notes || '')
      }
    }
  )

  const mutation = useMutation(earningsAPI.saveDayEarnings, {
    onSuccess: () => {
      setSuccessMessage('Obrót został pomyślnie zapisany!')
      setButtonSuccessMessage('Zapisano pomyślnie!')
      queryClient.invalidateQueries('dashboard')
      queryClient.invalidateQueries(['dayEarnings', selectedDate])
      setTimeout(() => setSuccessMessage(''), 3000)
      setTimeout(() => setButtonSuccessMessage(''), 3000)
    },
    onError: () => {
      setSuccessMessage('')
      setButtonSuccessMessage('')
    }
  })

  // Client management functions
  const addClient = () => {
    setClients([...clients, { 
      amount: 0, 
      paymentMethod: 'cash', 
      notes: '', 
      clientName: '',
      payments: [{ amount: 0, method: 'cash' }] 
    }])
  }

  const removeClient = (index) => {
    if (clients.length > 1) {
      const newClients = clients.filter((_, i) => i !== index)
      setClients(newClients)
    }
  }

  const updateClient = (index, clientData) => {
    const newClients = [...clients]
    newClients[index] = clientData
    setClients(newClients)
  }

  // Check if there's existing data that would prevent mode switching
  // Special case: allow switching from detailed mode if there's only one client with 0 amount
  const hasExistingData = existingData && (
    (existingData.entryMode === 'summary' && (
      existingData.cashAmount > 0 || 
      existingData.cardAmount > 0 || 
      existingData.clientsCount > 0
    )) ||
    (existingData.entryMode === 'detailed' && 
      existingData.clients && existingData.clients.length > 0 &&
      existingData.clients.some(client => {
        if (client.payments && client.payments.length > 0) {
          return client.payments.some(payment => parseFloat(payment.amount) > 0)
        }
        return parseFloat(client.amount) > 0
      }) &&
      !(existingData.clients.length === 1 && (
        (existingData.clients[0].payments && existingData.clients[0].payments.length === 1 && parseFloat(existingData.clients[0].payments[0].amount) === 0) ||
        (!existingData.clients[0].payments && parseFloat(existingData.clients[0].amount) === 0)
      ))
    )
  )

  // Also check current form state for real-time mode locking
  const hasCurrentData = (
    (entryMode === 'summary' && (
      parseFloat(watch('cashAmount') || 0) > 0 || 
      parseFloat(watch('cardAmount') || 0) > 0 || 
      parseInt(watch('clientsCount') || 0) > 0
    )) ||
    (entryMode === 'detailed' && 
      clients.some(client => {
        if (client.payments && client.payments.length > 0) {
          return client.payments.some(payment => parseFloat(payment.amount) > 0)
        }
        return parseFloat(client.amount) > 0
      }) &&
      !(clients.length === 1 && 
        ((clients[0].payments && clients[0].payments.length === 1 && parseFloat(clients[0].payments[0].amount) === 0) ||
         (!clients[0].payments && parseFloat(clients[0].amount) === 0)))
    )
  )

  const canSwitchMode = !hasExistingData && !hasCurrentData

  const switchMode = (mode) => {
    // Prevent switching if there's existing data (with special case for single client with 0 amount)
    if (!canSwitchMode) {
      return
    }
    
    setEntryMode(mode)
    
    if (mode === 'detailed') {
      // When switching to detailed, reset to one empty client with new payment structure
      setClients([{ 
        amount: 0, 
        payments: [{ amount: 0, method: 'cash' }], 
        notes: '', 
        clientName: '' 
      }])
    } else if (mode === 'summary') {
      // When switching to summary, clear form values
      setValue('cashAmount', '')
      setValue('cardAmount', '')
      setValue('clientsCount', '')
    }
  }

  // Calculate totals from clients in detailed mode
  const clientTotals = clients.reduce((totals, client) => {
    if (client.payments && client.payments.length > 0) {
      // New multiple payments structure
      client.payments.forEach(payment => {
        const amount = parseFloat(payment.amount) || 0
        totals.total += amount
        
        switch (payment.method) {
          case 'cash':
            totals.cash += amount
            break
          case 'card':
            totals.card += amount
            break
          case 'blik':
            totals.blik += amount
            break
          case 'prepaid':
            totals.prepaid += amount
            break
          case 'transfer':
            totals.transfer += amount
            break
          case 'free':
            totals.free += amount
            break
          default:
            break
        }
      })
    } else {
      // Legacy single payment structure
      const amount = parseFloat(client.amount) || 0
      totals.total += amount
      
      if (client.paymentMethod === 'cash') {
        totals.cash += amount
      } else if (client.paymentMethod === 'card') {
        totals.card += amount
      }
    }
    return totals
  }, { cash: 0, card: 0, blik: 0, prepaid: 0, transfer: 0, free: 0, total: 0 })

  const onSubmit = (data) => {
    setSuccessMessage('')
    setButtonSuccessMessage('')
    
    const submitData = {
      date: selectedDate,
      entryMode,
      tipsAmount: parseFloat(data.tipsAmount) || 0,
      hoursWorked: parseFloat(data.hoursWorked) || 0,
      notes: data.notes || ''
    }
    

    if (entryMode === 'detailed') {
      // Clean up clients data before sending
      const cleanedClients = clients.map(client => ({
        ...client,
        amount: parseFloat(client.amount) || 0,
        paymentMethod: client.paymentMethod || null,
        payments: (client.payments || []).map(p => ({
          amount: parseFloat(p.amount) || 0,
          method: p.method || 'cash'
        })).filter(p => p.amount > 0 || client.payments?.length === 1)
      }))
      submitData.clients = cleanedClients
      console.log('📤 Sending clients:', JSON.stringify(cleanedClients, null, 2))
    } else {
      submitData.cashAmount = parseFloat(data.cashAmount) || 0
      submitData.cardAmount = parseFloat(data.cardAmount) || 0
      submitData.clientsCount = parseInt(data.clientsCount) || 0
    }

    console.log('📤 Submitting data:', JSON.stringify(submitData, null, 2))
    mutation.mutate(submitData)
  }

  const resetFormForNewDate = () => {
    // Reset form and state when date changes
    setClients([{ 
      amount: 0, 
      payments: [{ amount: 0, method: 'cash' }], 
      notes: '', 
      clientName: '' 
    }])
    setEntryMode('detailed')
    setValue('cashAmount', '')
    setValue('cardAmount', '')
    setValue('tipsAmount', '')
    setValue('clientsCount', '')
    setValue('hoursWorked', '')
    setValue('notes', '')
    setSuccessMessage('')
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    resetFormForNewDate()
    
    // Auto-close calendar on mobile devices
    setTimeout(() => {
      if (e.target) {
        e.target.blur()
      }
    }, 100)
  }

  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = subDays(currentDate, 1)
    const newDate = format(previousDay, 'yyyy-MM-dd')
    setSelectedDate(newDate)
    resetFormForNewDate()
  }

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = addDays(currentDate, 1)
    const newDate = format(nextDay, 'yyyy-MM-dd')
    setSelectedDate(newDate)
    resetFormForNewDate()
  }

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'd MMM yyyy (EEEE)', { locale: pl })
  }

  // Check if we can go to next day (not future)
  const canGoToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = addDays(currentDate, 1)
    const today = new Date()
    return nextDay <= today
  }

  return (
    <AddEarningsContainer>
      <Container>
        <Header>
          <Title>Dodaj obrót</Title>
          <SubText>Śledź swoje dzienne dochody</SubText>
        </Header>

        {successMessage && (
          <SuccessMessage>{successMessage}</SuccessMessage>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FormCard>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Data</Label>
                <DateSection>
                  <DateNavigation>
                    <DateButton 
                      type="button"
                      onClick={goToPreviousDay}
                      title="Poprzedni dzień"
                    >
                      <FiChevronLeft />
                    </DateButton>
                    
                    <DateDisplay>
                      {formatDisplayDate(selectedDate)}
                      <CalendarIcon>
                        {/* <FiCalendar /> */}
                      </CalendarIcon>
                      <DateInputWrapper>
                        <Input
                          id="date"
                          type="date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          max={format(new Date(), 'yyyy-MM-dd')}
                        />
                      </DateInputWrapper>
                    </DateDisplay>
                    
                    <DateButton 
                      type="button"
                      onClick={goToNextDay}
                      disabled={!canGoToNextDay()}
                      title="Następny dzień"
                    >
                      <FiChevronRight />
                    </DateButton>
                  </DateNavigation>
                </DateSection>
              </FormGroup>

              {/* Mode Toggle */}
              <ModeToggle>
                <ModeButton 
                  type="button"
                  active={entryMode === 'detailed'}
                  disabled={!canSwitchMode && entryMode !== 'detailed'}
                  onClick={() => switchMode('detailed')}
                >
                  <FiToggleRight />
                  Szczegółowo po kliencie
                </ModeButton>
                <ModeButton 
                  type="button"
                  active={entryMode === 'summary'}
                  disabled={!canSwitchMode && entryMode !== 'summary'}
                  onClick={() => switchMode('summary')}
                >
                  <FiToggleLeft />
                  Podsumowanie dnia
                </ModeButton>
              </ModeToggle>

              {isLoading ? (
                <LoadingText>Ładowanie istniejących danych...</LoadingText>
              ) : (
                <>
                  {/* Entry Mode Content */}
                  {entryMode === 'summary' ? (
                    // Summary Mode - Original form
                    <>
                      <FormGroup>
                        <Label htmlFor="cashAmount">Kwota gotówką (zł)</Label>
                        <AmountInputWrapper>
                          <AmountInput
                            id="cashAmount"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register('cashAmount', {
                              pattern: {
                                value: /^\d*\.?\d{0,2}$/,
                                message: 'Wprowadź poprawną kwotę'
                              }
                            })}
                          />
                        </AmountInputWrapper>
                        {errors.cashAmount && (
                          <ErrorMessage>{errors.cashAmount.message}</ErrorMessage>
                        )}
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="cardAmount">Kwota kartą (zł)</Label>
                        <AmountInputWrapper>
                          <AmountInput
                            id="cardAmount"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register('cardAmount', {
                              pattern: {
                                value: /^\d*\.?\d{0,2}$/,
                                message: 'Wprowadź poprawną kwotę'
                              }
                            })}
                          />
                        </AmountInputWrapper>
                        {errors.cardAmount && (
                          <ErrorMessage>{errors.cardAmount.message}</ErrorMessage>
                        )}
                      </FormGroup>

                      {(parseFloat(watch('cashAmount') || 0) + parseFloat(watch('cardAmount') || 0)) > 0 && (
                        <FormGroup>
                          <div style={{ 
                            padding: '12px',
                            background: '#6366f120',
                            border: '1px solid #6366f140',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <strong>Łączny obrót: {(parseFloat(watch('cashAmount') || 0) + parseFloat(watch('cardAmount') || 0)).toFixed(2)} zł</strong>
                          </div>
                        </FormGroup>
                      )}

                      <FormGroup>
                        <Label htmlFor="clientsCount">Liczba klientek</Label>
                        <AmountInputWrapper>
                          <AmountInput
                            id="clientsCount"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            placeholder="0"
                            {...register('clientsCount', {
                              pattern: {
                                value: /^\d+$/,
                                message: 'Wprowadź liczbę całkowitą'
                              }
                            })}
                          />
                        </AmountInputWrapper>
                        {errors.clientsCount && (
                          <ErrorMessage>{errors.clientsCount.message}</ErrorMessage>
                        )}
                      </FormGroup>
                    </>
                  ) : (
                    // Detailed Mode - Client-by-client entry
                    <ClientsSection>
                      {/* Show reset hint if there's only one client with some amount */}
                      {clients.length === 1 && parseFloat(clients[0].amount) > 0 && (
                        <ResetHint>
                          💡 Wskazówka: Wpisz kwotę "0" aby przejść z powrotem do trybu "Podsumowanie dnia"
                        </ResetHint>
                      )}
                      
                      {clientTotals.total > 0 && (
                        <ClientsSummary>
                          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            <strong>Klientek: {clients.filter(c => {
                              if (c.payments && c.payments.length > 0) {
                                return c.payments.some(payment => parseFloat(payment.amount) > 0)
                              }
                              return parseFloat(c.amount) > 0
                            }).length}</strong>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <strong>Łączny obrót: {clientTotals.total.toFixed(2)} zł</strong>
                            {clientTotals.free > 0 && (
                              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem', color: '#dc2626' }}>
                                w tym usługa 'gratis': {clientTotals.free.toFixed(2)} zł
                              </div>
                            )}
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>
                              {[
                                clientTotals.cash > 0 && `Gotówka: ${clientTotals.cash.toFixed(2)} zł`,
                                clientTotals.card > 0 && `Karta: ${clientTotals.card.toFixed(2)} zł`,
                                clientTotals.blik > 0 && `BLIK: ${clientTotals.blik.toFixed(2)} zł`,
                                clientTotals.prepaid > 0 && `Przedpłata: ${clientTotals.prepaid.toFixed(2)} zł`,
                                clientTotals.transfer > 0 && `Przelew: ${clientTotals.transfer.toFixed(2)} zł`,
                                clientTotals.free > 0 && `Gratis: ${clientTotals.free.toFixed(2)} zł`
                              ].filter(Boolean).join(' | ')}
                            </div>
                          </div>
                        </ClientsSummary>
                      )}
                      
                      {clients.map((client, index) => (
                        <ClientEntry
                          key={index}
                          client={client}
                          index={index}
                          onChange={updateClient}
                          onRemove={removeClient}
                          canRemove={clients.length > 1}
                        />
                      ))}
                      
                      <AddClientButton type="button" onClick={addClient}>
                        <FiPlus />
                        Dodaj kolejną klientkę
                      </AddClientButton>
                    </ClientsSection>
                  )}

                  {/* Global fields - same for both modes */}
                  <GlobalFieldsSection>
                    <SectionTitle>Dodatkowe informacje</SectionTitle>
                    
                    <FormGroup>
                      <Label htmlFor="tipsAmount">Napiwki (zł, opcjonalne)</Label>
                      <AmountInputWrapper>
                        <AmountInput
                          id="tipsAmount"
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register('tipsAmount', {
                            pattern: {
                              value: /^\d*\.?\d{0,2}$/,
                              message: 'Wprowadź poprawną kwotę'
                            }
                          })}
                        />
                      </AmountInputWrapper>
                      {errors.tipsAmount && (
                        <ErrorMessage>{errors.tipsAmount.message}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="hoursWorked">Liczba przepracowanych godzin</Label>
                      <AmountInputWrapper>
                        <AmountInput
                          id="hoursWorked"
                          type="number"
                          inputMode="decimal"
                          step="0.25"
                          min="0"
                          placeholder="8.00"
                          {...register('hoursWorked', {
                            pattern: {
                              value: /^\d*\.?\d{0,2}$/,
                              message: 'Wprowadź poprawną liczbę godzin'
                            }
                          })}
                        />
                      </AmountInputWrapper>
                      {errors.hoursWorked && (
                        <ErrorMessage>{errors.hoursWorked.message}</ErrorMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="notes">Notatki (opcjonalne)</Label>
                      <TextArea
                        id="notes"
                        placeholder="Dodatkowe notatki o dzisiejszej pracy..."
                        {...register('notes')}
                      />
                    </FormGroup>
                  </GlobalFieldsSection>

                  <Button
                    type="submit"
                    $fullWidth
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? (
                      'Zapisywanie...'
                    ) : (
                      <>
                        <FiSave style={{ marginRight: '0.5rem' }} />
                        Zapisz obrót
                      </>
                    )}
                  </Button>

                  {buttonSuccessMessage && (
                    <ButtonSuccessMessage>
                      <FiCheckCircle size={18} />
                      {buttonSuccessMessage}
                    </ButtonSuccessMessage>
                  )}

                  {mutation.error && (
                    <ErrorMessage style={{ textAlign: 'center', marginTop: '1rem' }}>
                      {mutation.error.response?.data?.error || 'Nie udało się zapisać zarobków'}
                    </ErrorMessage>
                  )}
                </>
              )}
            </form>
          </FormCard>
        </motion.div>
      </Container>
      <Navigation />
    </AddEarningsContainer>
  )
}

export default AddEarnings