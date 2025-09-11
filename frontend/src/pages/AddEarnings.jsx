import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiSave, FiCreditCard, FiGift, FiUsers, FiClock, FiCheckCircle, FiPlus, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { format } from 'date-fns'
import { earningsAPI } from '../services/api'
import { Card, Button, Input, Label } from '../styles/theme'
import Navigation from '../components/Navigation'
import ClientEntry from '../components/ClientEntry'

const AddEarningsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg} 0;
    padding-bottom: 100px;
  }
`

const Container = styled.div`
  max-width: 428px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  width: calc(100% - ${({ theme }) => theme.spacing.sm} * 2);
  box-sizing: border-box;

  @media (min-width: 768px) {
    max-width: 800px;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    width: calc(100% - ${({ theme }) => theme.spacing.lg} * 2);
  }
`

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const SubText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`

const FormCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    max-width: 600px;
    margin: 0 auto ${({ theme }) => theme.spacing.md} auto;
  }
`

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;
  box-sizing: border-box;
`

const DateInputWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  input {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-right: 40px;
  }

  svg {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 1.1rem;
    z-index: 1;
  }
`

const AmountInputWrapper = styled.div`
  position: relative;
`

const AmountInput = styled(Input)`
  font-size: 1.1rem;
  font-weight: 500;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
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
    max-width: 600px;
    margin: 0 auto ${({ theme }) => theme.spacing.md} auto;
  }
`;

const ButtonSuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.success}20;
  border: 1px solid ${({ theme }) => theme.colors.success}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 12px;
  animation: fadeInOut 3s ease-in-out;
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  
  svg {
    color: ${({ theme }) => theme.colors.success};
  }
`

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
`

const ModeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: 640px) {
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (min-width: 768px) {
    max-width: 600px;
    margin: 0 auto ${({ theme }) => theme.spacing.lg} auto;
  }
`

const ModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;

  @media (min-width: 640px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: 0.9rem;
    flex: initial;
  }

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ClientsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ClientsSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 500;
`

const AddClientButton = styled(Button)`
  background: ${({ theme }) => theme.colors.success};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.colors.success}dd;
  }
`

const GlobalFieldsSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AddEarnings = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [successMessage, setSuccessMessage] = useState('')
  const [buttonSuccessMessage, setButtonSuccessMessage] = useState('')
  const [entryMode, setEntryMode] = useState('detailed') // 'summary' or 'detailed'
  const [clients, setClients] = useState([{ amount: 0, paymentMethod: 'cash', notes: '' }])
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
      onSuccess: (data) => {
        // If there's existing data, use its mode, otherwise keep 'detailed' as default
        if (data.entryMode) {
          setEntryMode(data.entryMode)
        }
        // Only change to detailed mode if no existing entry mode is specified
        else if (!data.entryMode && (data.cashAmount === 0 && data.cardAmount === 0 && data.clientsCount === 0)) {
          setEntryMode('detailed')
        }
        
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
      setSuccessMessage('Zarobki zostały pomyślnie zapisane!')
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
    setClients([...clients, { amount: 0, paymentMethod: 'cash', notes: '' }])
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

  const switchMode = (mode) => {
    setEntryMode(mode)
    if (mode === 'detailed' && clients.length === 0) {
      setClients([{ amount: 0, paymentMethod: 'cash', notes: '' }])
    }
  }

  // Calculate totals from clients in detailed mode
  const clientTotals = clients.reduce((totals, client) => {
    const amount = parseFloat(client.amount) || 0
    if (client.paymentMethod === 'cash') {
      totals.cash += amount
    } else {
      totals.card += amount
    }
    totals.total += amount
    return totals
  }, { cash: 0, card: 0, total: 0 })

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
      submitData.clients = clients.filter(client => parseFloat(client.amount) > 0)
    } else {
      submitData.cashAmount = parseFloat(data.cashAmount) || 0
      submitData.cardAmount = parseFloat(data.cardAmount) || 0
      submitData.clientsCount = parseInt(data.clientsCount) || 0
    }

    mutation.mutate(submitData)
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    setSuccessMessage('')
  }

  const cashAmount = parseFloat(watch('cashAmount') || 0)
  const cardAmount = parseFloat(watch('cardAmount') || 0)
  const totalEarnings = cashAmount + cardAmount

  return (
    <AddEarningsContainer>
      <Container>
        <Header>
          <Title>Dodaj zarobki</Title>
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
                <Label htmlFor="date">Data</Label>
                <DateInputWrapper>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                  <FiCalendar />
                </DateInputWrapper>
              </FormGroup>

              {/* Mode Toggle */}
              <ModeToggle>
                <ModeButton 
                  type="button"
                  active={entryMode === 'detailed'}
                  onClick={() => switchMode('detailed')}
                >
                  <FiToggleRight />
                  Szczegółowo po kliencie
                </ModeButton>
                <ModeButton 
                  type="button"
                  active={entryMode === 'summary'}
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
                            <strong>Łączne zarobki: {(parseFloat(watch('cashAmount') || 0) + parseFloat(watch('cardAmount') || 0)).toFixed(2)} zł</strong>
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
                      {clientTotals.total > 0 && (
                        <ClientsSummary>
                          <div>
                            <strong>Klientek: {clients.filter(c => parseFloat(c.amount) > 0).length}</strong>
                          </div>
                          <div>
                            <strong>Łącznie: {clientTotals.total.toFixed(2)} zł</strong>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                              Gotówka: {clientTotals.cash.toFixed(2)} zł | Karta: {clientTotals.card.toFixed(2)} zł
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
                    fullWidth
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? (
                      'Zapisywanie...'
                    ) : (
                      <>
                        <FiSave style={{ marginRight: '0.5rem' }} />
                        Zapisz zarobki
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