import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiSave, FiCreditCard, FiGift, FiUsers, FiClock, FiCheckCircle, FiPlus, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { format, addDays, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { earningsAPI } from '../services/api'
import { Button, Input, Label, media } from '../styles/theme'
import ClientEntry from '../components/ClientEntry'

const AddEarningsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};

  ${media.lg`
    padding: ${({ theme }) => theme.spacing.xl};
    padding-bottom: ${({ theme }) => theme.spacing.xl};
  `}
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;

  ${media.lg`
    text-align: left;
  `}
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;

  ${media.lg`
    font-size: 1.875rem;
  `}
`

const SubText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
`

const FormCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  max-width: 800px;

  ${media.lg`
    max-width: 100%;
    padding: ${({ theme }) => theme.spacing.xl};
  `}
`

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const DateSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const DateNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const DateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.25rem;
  }
`

const DateDisplay = styled.div`
  flex: 1;
  text-align: center;
  padding: 14px 20px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
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
`

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AmountInput = styled(Input)`
  font-size: 1.05rem;
  font-weight: 600;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  ${media.md`
    grid-template-columns: repeat(3, 1fr);
  `}
`

const PaymentMethodCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.gradient.primary : theme.colors.surface};
  border: 1px solid ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  color: ${({ $isActive, theme }) =>
    $isActive ? 'white' : theme.colors.text.secondary};
  box-shadow: ${({ $isActive, theme }) =>
    $isActive ? theme.shadows.button : 'none'};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ $isActive, theme }) =>
      $isActive ? undefined : theme.colors.surfaceHover};
  }
`

const PaymentIcon = styled.span`
  font-size: 1.5rem;
`

const PaymentLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
`

const PaymentAmount = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 4px;
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  ${media.md`
    grid-template-columns: repeat(4, 1fr);
  `}
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

const ClientsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const AddClientButton = styled(Button)`
  width: 100%;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`

const SubmitButton = styled(Button)`
  width: 100%;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: 16px 24px;
  font-size: 1rem;
`

const SuccessMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
`

const ErrorMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(239, 68, 68, 0.2);
`

const ToggleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const ToggleLabel = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.text.muted};
  cursor: pointer;
  font-size: 1.5rem;
  transition: color ${({ theme }) => theme.transitions.normal};
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const paymentMethods = [
  { id: 'cash', label: 'Gotówka', icon: '💵' },
  { id: 'card', label: 'Karta', icon: '💳' },
  { id: 'blik', label: 'BLIK', icon: '📱' },
  { id: 'prepaid', label: 'Przedpłata', icon: '💰' },
  { id: 'transfer', label: 'Przelew', icon: '🏦' },
  { id: 'free', label: 'Gratis', icon: '🎁' },
]

const AddEarnings = () => {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [clients, setClients] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [detailedMode, setDetailedMode] = useState(true)
  
  const [hoursWorked, setHoursWorked] = useState('')
  const [tipsAmount, setTipsAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [activePaymentMethod, setActivePaymentMethod] = useState('cash')
  const [paymentAmounts, setPaymentAmounts] = useState({
    cash: '',
    card: '',
    blik: '',
    prepaid: '',
    transfer: '',
    free: '',
  })

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const { data: existingEarning, isLoading: loadingExisting } = useQuery(
    ['earningByDate', dateStr],
    () => earningsAPI.getByDate(dateStr).then(res => res.data),
    {
      refetchOnMount: true,
      onSuccess: (data) => {
        if (data?.earning) {
          setHoursWorked(data.earning.hoursWorked?.toString() || '')
          setTipsAmount(data.earning.tipsAmount?.toString() || '')
          setNotes(data.earning.notes || '')
          setPaymentAmounts({
            cash: data.earning.cashAmount?.toString() || '',
            card: data.earning.cardAmount?.toString() || '',
            blik: data.earning.blikAmount?.toString() || '',
            prepaid: data.earning.prepaidAmount?.toString() || '',
            transfer: data.earning.transferAmount?.toString() || '',
            free: data.earning.freeAmount?.toString() || '',
          })
          if (data.transactions) {
            setClients(data.transactions.map((t, index) => ({
              id: t.id || index,
              clientId: t.clientId,
              clientName: t.clientName || '',
              paymentMethod: t.paymentMethod || 'cash',
              amount: t.amount?.toString() || '',
              isNewClient: t.isNewClient || false,
            })))
          }
        }
      }
    }
  )

  const saveMutation = useMutation(
    (data) => earningsAPI.saveEarning(data),
    {
      onSuccess: () => {
        setSuccessMessage('Dane zostały zapisane!')
        setTimeout(() => setSuccessMessage(''), 3000)
        queryClient.invalidateQueries(['earningByDate'])
        queryClient.invalidateQueries(['dashboard'])
        queryClient.invalidateQueries(['monthlyEarnings'])
      },
      onError: (error) => {
        setErrorMessage(error.response?.data?.error || 'Błąd podczas zapisywania')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }
  )

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1))
    resetForm()
  }

  const goToNextDay = () => {
    const tomorrow = addDays(new Date(), 1)
    if (addDays(selectedDate, 1) <= tomorrow) {
      setSelectedDate(prev => addDays(prev, 1))
      resetForm()
    }
  }

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate)
      resetForm()
    }
  }

  const resetForm = () => {
    setClients([])
    setHoursWorked('')
    setTipsAmount('')
    setNotes('')
    setPaymentAmounts({
      cash: '',
      card: '',
      blik: '',
      prepaid: '',
      transfer: '',
      free: '',
    })
  }

  const addClient = () => {
    setClients([
      ...clients,
      {
        id: Date.now(),
        clientId: null,
        clientName: '',
        paymentMethod: 'cash',
        amount: '',
        isNewClient: false,
      }
    ])
  }

  const updateClient = (id, updates) => {
    setClients(clients.map(client =>
      client.id === id ? { ...client, ...updates } : client
    ))
  }

  const removeClient = (id) => {
    setClients(clients.filter(client => client.id !== id))
  }

  const calculateTotals = () => {
    if (detailedMode) {
      const totals = { cash: 0, card: 0, blik: 0, prepaid: 0, transfer: 0, free: 0 }
      clients.forEach(client => {
        const amount = parseFloat(client.amount) || 0
        if (totals.hasOwnProperty(client.paymentMethod)) {
          totals[client.paymentMethod] += amount
        }
      })
      return totals
    } else {
      return {
        cash: parseFloat(paymentAmounts.cash) || 0,
        card: parseFloat(paymentAmounts.card) || 0,
        blik: parseFloat(paymentAmounts.blik) || 0,
        prepaid: parseFloat(paymentAmounts.prepaid) || 0,
        transfer: parseFloat(paymentAmounts.transfer) || 0,
        free: parseFloat(paymentAmounts.free) || 0,
      }
    }
  }

  const totals = calculateTotals()
  const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0)
  const clientsCount = detailedMode ? clients.length : 0

  const handleSubmit = () => {
    const data = {
      date: dateStr,
      hoursWorked: parseFloat(hoursWorked) || 0,
      tipsAmount: parseFloat(tipsAmount) || 0,
      notes: notes || '',
      cashAmount: totals.cash,
      cardAmount: totals.card,
      blikAmount: totals.blik,
      prepaidAmount: totals.prepaid,
      transferAmount: totals.transfer,
      freeAmount: totals.free,
      clientsCount,
      transactions: detailedMode ? clients.map(client => ({
        clientId: client.clientId,
        clientName: client.clientName,
        paymentMethod: client.paymentMethod,
        amount: parseFloat(client.amount) || 0,
        isNewClient: client.isNewClient,
      })) : [],
    }

    saveMutation.mutate(data)
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <AddEarningsContainer>
      <PageHeader>
        <Title>Dodaj obrót</Title>
        <SubText>Wprowadź dzienne dane o zarobkach</SubText>
      </PageHeader>

      <FormCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {successMessage && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheckCircle />
            {successMessage}
          </SuccessMessage>
        )}

        {errorMessage && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </ErrorMessage>
        )}

        <SectionTitle>
          <FiCalendar />
          Wybierz datę
        </SectionTitle>

        <DateSection>
          <DateNavigation>
            <DateButton onClick={goToPreviousDay}>
              <FiChevronLeft />
            </DateButton>
            
            <DateDisplay>
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: pl })}
              <DateInputWrapper>
                <input
                  type="date"
                  value={dateStr}
                  onChange={handleDateChange}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </DateInputWrapper>
              <CalendarIcon>
                <FiCalendar />
              </CalendarIcon>
            </DateDisplay>
            
            <DateButton onClick={goToNextDay} disabled={isToday}>
              <FiChevronRight />
            </DateButton>
          </DateNavigation>
        </DateSection>

        <ToggleSection>
          <ToggleLabel>Tryb szczegółowy (z klientkami)</ToggleLabel>
          <ToggleButton
            $isActive={detailedMode}
            onClick={() => setDetailedMode(!detailedMode)}
          >
            {detailedMode ? <FiToggleRight /> : <FiToggleLeft />}
          </ToggleButton>
        </ToggleSection>

        {loadingExisting ? (
          <LoadingContainer>Ładowanie danych...</LoadingContainer>
        ) : (
          <>
            <StatsRow>
              <StatCard>
                <StatValue $color="#7C3AED">{grandTotal.toFixed(2)} zł</StatValue>
                <StatLabel>Łącznie</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue $color="#8B5CF6">{clientsCount}</StatValue>
                <StatLabel><FiUsers /> Klientek</StatLabel>
              </StatCard>
              <StatCard>
                <FormGroup style={{ margin: 0 }}>
                  <AmountInput
                    type="number"
                    placeholder="0"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    step="0.5"
                  />
                  <StatLabel><FiClock /> Godzin</StatLabel>
                </FormGroup>
              </StatCard>
              <StatCard>
                <FormGroup style={{ margin: 0 }}>
                  <AmountInput
                    type="number"
                    placeholder="0"
                    value={tipsAmount}
                    onChange={(e) => setTipsAmount(e.target.value)}
                    step="0.01"
                  />
                  <StatLabel><FiGift /> Napiwki</StatLabel>
                </FormGroup>
              </StatCard>
            </StatsRow>

            {!detailedMode && (
              <>
                <SectionTitle>
                  <FiCreditCard />
                  Metody płatności
                </SectionTitle>

                <PaymentMethodsGrid>
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      type="button"
                      $isActive={activePaymentMethod === method.id}
                      onClick={() => setActivePaymentMethod(method.id)}
                    >
                      <PaymentIcon>{method.icon}</PaymentIcon>
                      <PaymentLabel>{method.label}</PaymentLabel>
                      <AmountInput
                        type="number"
                        placeholder="0.00"
                        value={paymentAmounts[method.id]}
                        onChange={(e) => {
                          e.stopPropagation()
                          setPaymentAmounts(prev => ({
                            ...prev,
                            [method.id]: e.target.value
                          }))
                        }}
                        onClick={(e) => e.stopPropagation()}
                        step="0.01"
                        style={{ width: '100%', marginTop: '8px' }}
                      />
                    </PaymentMethodCard>
                  ))}
                </PaymentMethodsGrid>
              </>
            )}

            {detailedMode && (
              <ClientsSection>
                <SectionTitle>
                  <FiUsers />
                  Klientki
                </SectionTitle>

                {clients.map((client, index) => (
                  <ClientEntry
                    key={client.id}
                    client={client}
                    index={index}
                    onUpdate={(updates) => updateClient(client.id, updates)}
                    onRemove={() => removeClient(client.id)}
                  />
                ))}

                <AddClientButton type="button" onClick={addClient} $variant="secondary">
                  <FiPlus />
                  Dodaj klientkę
                </AddClientButton>
              </ClientsSection>
            )}

            <FormGroup>
              <Label>Notatki (opcjonalnie)</Label>
              <TextArea
                placeholder="Dodatkowe informacje o dniu..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormGroup>

            <SubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isLoading}
            >
              <FiSave />
              {saveMutation.isLoading ? 'Zapisywanie...' : 'Zapisz dane'}
            </SubmitButton>
          </>
        )}
      </FormCard>
    </AddEarningsContainer>
  )
}

export default AddEarnings
