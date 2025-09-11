import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiSave, FiDollarSign, FiCreditCard, FiGift, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { earningsAPI } from '../services/api'
import { Container, Card, Button, Input, Label } from '../styles/theme'
import Navigation from '../components/Navigation'

const AddEarningsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};
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
`

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const DateInputWrapper = styled.div`
  position: relative;

  svg {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 1.1rem;
  }
`

const AmountInputWrapper = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 1.1rem;
  }

  input {
    padding-left: 40px;
  }
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

const AddEarnings = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [successMessage, setSuccessMessage] = useState('')
  const [buttonSuccessMessage, setButtonSuccessMessage] = useState('')
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
        setValue('cashAmount', data.cashAmount > 0 ? data.cashAmount.toString() : '')
        setValue('cardAmount', data.cardAmount > 0 ? data.cardAmount.toString() : '')
        setValue('tipsAmount', data.tipsAmount > 0 ? data.tipsAmount.toString() : '')
        setValue('clientsCount', data.clientsCount > 0 ? data.clientsCount.toString() : '')
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

  const onSubmit = (data) => {
    setSuccessMessage('')
    setButtonSuccessMessage('')
    mutation.mutate({
      date: selectedDate,
      cashAmount: parseFloat(data.cashAmount) || 0,
      cardAmount: parseFloat(data.cardAmount) || 0,
      tipsAmount: parseFloat(data.tipsAmount) || 0,
      clientsCount: parseInt(data.clientsCount) || 0,
      hoursWorked: parseFloat(data.hoursWorked) || 0,
      notes: data.notes || ''
    })
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

              {isLoading ? (
                <LoadingText>Ładowanie istniejących danych...</LoadingText>
              ) : (
                <>
                  <FormGroup>
                    <Label htmlFor="cashAmount">Kwota gotówką</Label>
                    <AmountInputWrapper>
                      <FiDollarSign />
                      <AmountInput
                        id="cashAmount"
                        type="number"
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
                    <Label htmlFor="cardAmount">Kwota kartą</Label>
                    <AmountInputWrapper>
                      <FiCreditCard />
                      <AmountInput
                        id="cardAmount"
                        type="number"
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

                  {totalEarnings > 0 && (
                    <FormGroup>
                      <div style={{ 
                        padding: '12px',
                        background: '#6366f120',
                        border: '1px solid #6366f140',
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <strong>Łączne zarobki: {totalEarnings.toFixed(2)} zł</strong>
                      </div>
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label htmlFor="tipsAmount">Napiwki (opcjonalne)</Label>
                    <AmountInputWrapper>
                      <FiGift />
                      <AmountInput
                        id="tipsAmount"
                        type="number"
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
                    <Label htmlFor="clientsCount">Liczba klientek</Label>
                    <AmountInputWrapper>
                      <FiUsers />
                      <AmountInput
                        id="clientsCount"
                        type="number"
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

                  <FormGroup>
                    <Label htmlFor="hoursWorked">Liczba przepracowanych godzin</Label>
                    <AmountInputWrapper>
                      <FiClock />
                      <AmountInput
                        id="hoursWorked"
                        type="number"
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