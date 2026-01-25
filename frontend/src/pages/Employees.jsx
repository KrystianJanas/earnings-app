import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUsers, FiEdit3, FiDollarSign, FiTrendingUp, FiCalendar, FiClock, FiBarChart2, FiMail, FiX, FiSend, FiSave } from 'react-icons/fi'
import { companiesAPI, employeesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Label, media } from '../styles/theme'

const EmployeesContainer = styled.div`
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

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }

    ${media.lg`
      font-size: 1.875rem;
    `}
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.95rem;
  }
`

const EmployeeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EmployeeCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.primary : theme.colors.border};
  box-shadow: ${({ $isSelected, theme }) => 
    $isSelected ? `0 0 0 3px ${theme.colors.primary}30` : theme.shadows.card};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const EmployeeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const EmployeeAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`

const EmployeeDetails = styled.div`
  flex: 1;
`

const EmployeeName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  margin-bottom: 2px;
`

const EmployeeRole = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
`

const HourlyRateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const HourlyRateInput = styled(Input)`
  width: 80px;
  text-align: right;
  padding: 8px 12px;
  font-size: 0.9rem;
`

const SaveButton = styled(Button)`
  padding: 8px 12px;
  font-size: 0.85rem;
`

const StatsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  ${media.md`
    grid-template-columns: repeat(4, 1fr);
  `}
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.1rem;
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

const InviteSection = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`

const InviteTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const InviteText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const InviteForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 400px;
  margin: 0 auto;
`

const InviteInput = styled(Input)`
  flex: 1;
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.error};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 8px;
  }
`

const SuccessMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.2);
`

const ErrorMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
`

const Employees = () => {
  const { currentCompany } = useAuth()
  const queryClient = useQueryClient()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [hourlyRates, setHourlyRates] = useState({})
  const [inviteEmail, setInviteEmail] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: employeesData, isLoading, error } = useQuery(
    ['employees', currentCompany?.id],
    () => employeesAPI.getAll(currentCompany?.id).then(res => res.data),
    {
      enabled: !!currentCompany?.id,
      refetchOnMount: true,
      onSuccess: (data) => {
        const rates = {}
        data?.employees?.forEach(emp => {
          rates[emp.id] = emp.hourlyRate?.toString() || ''
        })
        setHourlyRates(rates)
      }
    }
  )

  const updateRateMutation = useMutation(
    ({ employeeId, hourlyRate }) => employeesAPI.updateHourlyRate(currentCompany?.id, employeeId, hourlyRate),
    {
      onSuccess: () => {
        setSuccessMessage('Stawka została zaktualizowana')
        setTimeout(() => setSuccessMessage(''), 3000)
        queryClient.invalidateQueries(['employees'])
      },
      onError: () => {
        setErrorMessage('Błąd podczas aktualizacji stawki')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }
  )

  const inviteMutation = useMutation(
    (email) => employeesAPI.invite(currentCompany?.id, email),
    {
      onSuccess: () => {
        setSuccessMessage('Zaproszenie zostało wysłane')
        setInviteEmail('')
        setTimeout(() => setSuccessMessage(''), 3000)
      },
      onError: () => {
        setErrorMessage('Błąd podczas wysyłania zaproszenia')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }
  )

  const handleRateChange = (employeeId, value) => {
    setHourlyRates(prev => ({
      ...prev,
      [employeeId]: value
    }))
  }

  const handleSaveRate = (employeeId) => {
    const rate = parseFloat(hourlyRates[employeeId]) || 0
    updateRateMutation.mutate({ employeeId, hourlyRate: rate })
  }

  const handleInvite = (e) => {
    e.preventDefault()
    if (inviteEmail.trim()) {
      inviteMutation.mutate(inviteEmail.trim())
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (isLoading) {
    return (
      <EmployeesContainer>
        <PageHeader>
          <h1><FiUsers /> Pracownicy</h1>
        </PageHeader>
        <LoadingContainer>Ładowanie pracowników...</LoadingContainer>
      </EmployeesContainer>
    )
  }

  if (error) {
    return (
      <EmployeesContainer>
        <PageHeader>
          <h1><FiUsers /> Pracownicy</h1>
        </PageHeader>
        <ErrorContainer>
          <p>Nie udało się załadować listy pracowników</p>
        </ErrorContainer>
      </EmployeesContainer>
    )
  }

  const employees = employeesData?.employees || []

  return (
    <EmployeesContainer>
      <PageHeader>
        <h1><FiUsers /> Pracownicy</h1>
        <p>Zarządzaj pracownikami i stawkami godzinowymi</p>
      </PageHeader>

      {successMessage && (
        <SuccessMessage
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
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

      {employees.length === 0 ? (
        <EmptyState>
          <FiUsers />
          <h3>Brak pracowników</h3>
          <p>Zaproś pierwszego pracownika do salonu</p>
        </EmptyState>
      ) : (
        <EmployeeList>
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              $isSelected={selectedEmployee === employee.id}
              onClick={() => setSelectedEmployee(
                selectedEmployee === employee.id ? null : employee.id
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmployeeHeader>
                <EmployeeInfo>
                  <EmployeeAvatar>
                    {getInitials(employee.firstName, employee.lastName)}
                  </EmployeeAvatar>
                  <EmployeeDetails>
                    <EmployeeName>
                      {employee.firstName} {employee.lastName}
                    </EmployeeName>
                    <EmployeeRole>
                      {employee.role === 'owner' ? 'Właściciel' : 'Pracownik'}
                    </EmployeeRole>
                  </EmployeeDetails>
                </EmployeeInfo>
                
                <HourlyRateContainer>
                  <HourlyRateInput
                    type="number"
                    value={hourlyRates[employee.id] || ''}
                    onChange={(e) => handleRateChange(employee.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                    step="0.5"
                  />
                  <span style={{ color: '#666' }}>zł/h</span>
                  <SaveButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveRate(employee.id)
                    }}
                    disabled={updateRateMutation.isLoading}
                  >
                    <FiSave size={14} />
                  </SaveButton>
                </HourlyRateContainer>
              </EmployeeHeader>

              <AnimatePresence>
                {selectedEmployee === employee.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StatsSection>
                      <StatsGrid>
                        <StatCard>
                          <StatValue $color="#7C3AED">
                            {(employee.stats?.totalEarnings || 0).toFixed(0)} zł
                          </StatValue>
                          <StatLabel><FiDollarSign /> Obrót</StatLabel>
                        </StatCard>
                        <StatCard>
                          <StatValue $color="#8B5CF6">
                            {employee.stats?.clientsCount || 0}
                          </StatValue>
                          <StatLabel><FiUsers /> Klientek</StatLabel>
                        </StatCard>
                        <StatCard>
                          <StatValue $color="#06B6D4">
                            {(employee.stats?.hoursWorked || 0).toFixed(1)} h
                          </StatValue>
                          <StatLabel><FiClock /> Godzin</StatLabel>
                        </StatCard>
                        <StatCard>
                          <StatValue $color="#10B981">
                            {(employee.stats?.estimatedPay || 0).toFixed(0)} zł
                          </StatValue>
                          <StatLabel><FiTrendingUp /> Wypłata</StatLabel>
                        </StatCard>
                      </StatsGrid>
                    </StatsSection>
                  </motion.div>
                )}
              </AnimatePresence>
            </EmployeeCard>
          ))}
        </EmployeeList>
      )}

      <InviteSection>
        <InviteTitle>Zaproś nowego pracownika</InviteTitle>
        <InviteText>
          Wyślij zaproszenie na adres e-mail, aby dodać nowego pracownika do salonu
        </InviteText>
        <InviteForm onSubmit={handleInvite}>
          <InviteInput
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
          <Button type="submit" disabled={inviteMutation.isLoading}>
            <FiSend />
            {inviteMutation.isLoading ? 'Wysyłanie...' : 'Wyślij'}
          </Button>
        </InviteForm>
      </InviteSection>
    </EmployeesContainer>
  )
}

export default Employees
