import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiUsers, FiEdit3, FiDollarSign, FiTrendingUp, FiCalendar, FiClock, FiBarChart2, FiMail, FiX, FiSend } from 'react-icons/fi'
import { companiesAPI, employeesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Container, Card, Button } from '../styles/theme'
import Navigation from '../components/Navigation'

const EmployeesContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};
`

const ResponsiveContainer = styled(Container)`
  @media (min-width: 1024px) {
    max-width: 1200px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
  }

  @media (min-width: 1280px) {
    max-width: 1400px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
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

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`

const EmployeeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EmployeeCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  ${({ isSelected }) => isSelected && `
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  `}
`

const EmployeeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const EmployeeAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
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
  font-size: 0.875rem;
`

const HourlyRateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`

const HourlyRateInput = styled.input`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0.5rem;
  font-size: 0.875rem;
  width: 80px;
  text-align: right;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const SaveButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const StatsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`

const StatValue = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  margin-bottom: 2px;
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  svg {
    font-size: 0.875rem;
  }
`

const PeriodSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const PeriodButton = styled.button`
  background: ${({ isActive, theme }) => isActive ? theme.colors.primary : theme.colors.surface};
  color: ${({ isActive, theme }) => isActive ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ isActive, theme }) => isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) => isActive ? theme.colors.primaryDark : theme.colors.background};
  }
`

const NoAccessMessage = styled(Card)`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.lg};
`

const LoadingCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const InvitationSection = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const InviteForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const EmailInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`

const InviteButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
`

const PendingInvitesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PendingInviteCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InviteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const InviteEmail = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`

const InviteDate = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
`

const PaymentBreakdown = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const BreakdownTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`

const PaymentMethodItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border}50;
`

const PaymentMethodLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-align: center;
`

const PaymentMethodAmount = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Employees = () => {
  const { currentCompany, user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [hourlyRates, setHourlyRates] = useState({})
  const [savingRates, setSavingRates] = useState({})
  const [inviteEmail, setInviteEmail] = useState('')
  const [cancellingInvites, setCancellingInvites] = useState({})
  const [expandedStats, setExpandedStats] = useState(false)

  // Check if user is owner
  const isOwner = currentCompany?.userRole === 'owner'

  const { data: employees, isLoading: employeesLoading } = useQuery(
    ['employees', currentCompany?.id],
    () => companiesAPI.getEmployees(currentCompany.id).then(res => res.data),
    {
      enabled: !!currentCompany?.id && isOwner,
    }
  )

  const { data: invitations, isLoading: invitationsLoading } = useQuery(
    ['invitations', currentCompany?.id],
    () => companiesAPI.getInvitations(currentCompany.id).then(res => res.data),
    {
      enabled: !!currentCompany?.id && isOwner,
    }
  )

  const { data: employeeStats, isLoading: statsLoading } = useQuery(
    ['employeeStats', selectedEmployee?.userId, selectedPeriod],
    () => employeesAPI.getEmployeeStats(selectedEmployee.userId, selectedPeriod).then(res => res.data),
    {
      enabled: !!selectedEmployee && isOwner,
    }
  )

  const inviteEmployeeMutation = useMutation(
    (email) => companiesAPI.createInvitation(currentCompany.id, { email, role: 'employee' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invitations', currentCompany?.id])
        setInviteEmail('')
      },
      onError: (error) => {
        console.error('Failed to send invitation:', error)
      }
    }
  )

  const cancelInvitationMutation = useMutation(
    (invitationId) => companiesAPI.cancelInvitation(currentCompany.id, invitationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['invitations', currentCompany?.id])
      },
      onError: (error) => {
        console.error('Failed to cancel invitation:', error)
      }
    }
  )

  const handleHourlyRateChange = (employeeId, value) => {
    setHourlyRates(prev => ({
      ...prev,
      [employeeId]: value
    }))
  }

  const saveHourlyRate = async (employee) => {
    const newRate = hourlyRates[employee.id] || employee.hourlyRate || 0
    
    setSavingRates(prev => ({ ...prev, [employee.id]: true }))
    
    try {
      await employeesAPI.updateHourlyRate(employee.userId, newRate)
      queryClient.invalidateQueries(['employees', currentCompany?.id])
      console.log('Hourly rate saved successfully')
    } catch (error) {
      console.error('Failed to save hourly rate:', error)
    } finally {
      setSavingRates(prev => ({ ...prev, [employee.id]: false }))
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Właściciel'
      case 'employee':
        return 'Pracownik'
      default:
        return 'Brak roli'
    }
  }

  const getInitials = (name) => {
    if (!name || name.trim() === '' || name === 'undefined undefined') {
      return '??'
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  const getEmployeeName = (employee) => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
    if (!fullName || fullName === 'undefined undefined' || fullName === 'null null') {
      return employee.email || 'Pracownik'
    }
    return fullName
  }

  const handleInviteSubmit = (e) => {
    e.preventDefault()
    if (inviteEmail.trim() && !inviteEmployeeMutation.isLoading) {
      inviteEmployeeMutation.mutate(inviteEmail.trim())
    }
  }

  const handleCancelInvitation = (invitationId) => {
    setCancellingInvites(prev => ({ ...prev, [invitationId]: true }))
    cancelInvitationMutation.mutate(invitationId, {
      onSettled: () => {
        setCancellingInvites(prev => ({ ...prev, [invitationId]: false }))
      }
    })
  }

  const calculateProfit = (stats) => {
    if (!stats || !selectedEmployee) return 0
    const totalRevenue = stats.totalEarnings || 0
    const hourlyRate = hourlyRates[selectedEmployee.id] || selectedEmployee.hourlyRate || 0
    const hoursWorked = stats.hoursWorked || 0
    const estimatedPayout = hourlyRate * hoursWorked
    return Math.max(0, totalRevenue - estimatedPayout)
  }

  if (!isOwner) {
    return (
      <EmployeesContainer>
        <ResponsiveContainer>
          <Header>
            <Title>Zarządzanie pracownikami</Title>
            <Subtitle>Dostęp ograniczony do właścicieli</Subtitle>
          </Header>
          
          <NoAccessMessage>
            <FiUsers size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Tylko właściciele salonu mają dostęp do zarządzania pracownikami.</p>
          </NoAccessMessage>
        </ResponsiveContainer>
        <Navigation />
      </EmployeesContainer>
    )
  }

  if (employeesLoading) {
    return (
      <EmployeesContainer>
        <ResponsiveContainer>
          <Header>
            <Title>Zarządzanie pracownikami</Title>
          </Header>
          
          <LoadingCard>
            Ładowanie pracowników...
          </LoadingCard>
        </ResponsiveContainer>
        <Navigation />
      </EmployeesContainer>
    )
  }

  return (
    <EmployeesContainer>
      <Container>
        <Header>
          <Title>Zarządzanie pracownikami</Title>
          <Subtitle>Zarządzaj stawkami i przeglądaj statystyki</Subtitle>
        </Header>

        <InvitationSection>
          <SectionTitle>
            <FiMail size={20} />
            Zaproś pracownika
          </SectionTitle>
          
          <InviteForm onSubmit={handleInviteSubmit}>
            <EmailInput
              type="email"
              placeholder="Wpisz adres e-mail pracownika..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <InviteButton 
              type="submit"
              disabled={!inviteEmail.trim() || inviteEmployeeMutation.isLoading}
            >
              <FiSend size={16} />
              {inviteEmployeeMutation.isLoading ? 'Wysyłanie...' : 'Wyślij zaproszenie'}
            </InviteButton>
          </InviteForm>

          {invitations && invitations.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: '1.5rem' }}>
                Oczekujące zaproszenia
              </SectionTitle>
              <PendingInvitesList>
                {invitations.map((invitation) => (
                  <PendingInviteCard key={invitation.id}>
                    <InviteInfo>
                      <FiMail size={16} color="#6366f1" />
                      <div>
                        <InviteEmail>{invitation.email}</InviteEmail>
                        <InviteDate>
                          Wysłane {new Date(invitation.createdAt).toLocaleDateString('pl-PL')}
                        </InviteDate>
                      </div>
                    </InviteInfo>
                    <CancelButton
                      onClick={() => handleCancelInvitation(invitation.id)}
                      disabled={cancellingInvites[invitation.id]}
                    >
                      <FiX size={12} />
                      {cancellingInvites[invitation.id] ? 'Anulowanie...' : 'Anuluj'}
                    </CancelButton>
                  </PendingInviteCard>
                ))}
              </PendingInvitesList>
            </>
          )}
        </InvitationSection>

        <HelpText>
          💡 Naciśnij na pracownika, aby zobaczyć jego szczegółowy obrót i statystyki
        </HelpText>

        <EmployeeList>
          {employees?.map((employee) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmployeeCard
                isSelected={selectedEmployee?.id === employee.id}
                onClick={() => setSelectedEmployee(employee)}
              >
                <EmployeeHeader>
                  <EmployeeInfo>
                    <EmployeeAvatar>
                      {getInitials(getEmployeeName(employee))}
                    </EmployeeAvatar>
                    <EmployeeDetails>
                      <EmployeeName>
                        {getEmployeeName(employee)}
                      </EmployeeName>
                      <EmployeeRole>
                        {getRoleLabel(employee.role)}
                      </EmployeeRole>
                    </EmployeeDetails>
                  </EmployeeInfo>

                  <HourlyRateContainer>
                    <HourlyRateInput
                      type="number"
                      step="0.50"
                      min="0"
                      placeholder="0.00"
                      value={hourlyRates[employee.id] ?? employee.hourlyRate ?? ''}
                      onChange={(e) => handleHourlyRateChange(employee.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>zł/h</span>
                    <SaveButton
                      onClick={(e) => {
                        e.stopPropagation()
                        saveHourlyRate(employee)
                      }}
                      disabled={savingRates[employee.id]}
                    >
                      {savingRates[employee.id] ? 'Zapisywanie...' : 'Zapisz'}
                    </SaveButton>
                  </HourlyRateContainer>
                </EmployeeHeader>

                {selectedEmployee?.id === employee.id && (
                  <StatsSection>
                    <PeriodSelector>
                      <PeriodButton
                        isActive={selectedPeriod === 'day'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPeriod('day')
                        }}
                      >
                        Dzisiaj
                      </PeriodButton>
                      <PeriodButton
                        isActive={selectedPeriod === 'week'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPeriod('week')
                        }}
                      >
                        Tydzień
                      </PeriodButton>
                      <PeriodButton
                        isActive={selectedPeriod === 'month'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPeriod('month')
                        }}
                      >
                        Miesiąc
                      </PeriodButton>
                    </PeriodSelector>

                    {statsLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#a3a3a3' }}>
                        Ładowanie statystyk...
                      </div>
                    ) : (
                      <StatsGrid>
                        <StatItem 
                          onClick={() => setExpandedStats(!expandedStats)}
                          style={{ cursor: 'pointer', position: 'relative' }}
                        >
                          <StatValue color="#6366f1">
                            {(employeeStats?.totalEarnings || 0).toFixed(2)} zł
                          </StatValue>
                          <StatLabel>
                            <FiDollarSign />
                            Łączny obrót {expandedStats ? '▼' : '▶'}
                          </StatLabel>
                          {employeeStats?.freeAmount > 0 && (
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: '#dc2626', 
                              marginTop: '0.25rem',
                              opacity: 0.8 
                            }}>
                              w tym gratis: {employeeStats.freeAmount.toFixed(2)} zł
                            </div>
                          )}
                        </StatItem>

                        <StatItem>
                          <StatValue color="#10b981">
                            {calculateProfit(employeeStats).toFixed(2)} zł
                          </StatValue>
                          <StatLabel>
                            <FiTrendingUp />
                            Zysk salonu
                          </StatLabel>
                        </StatItem>

                        <StatItem>
                          <StatValue color="#8b5cf6">
                            {employeeStats?.clientsCount || 0}
                          </StatValue>
                          <StatLabel>
                            <FiUsers />
                            Klientek
                          </StatLabel>
                        </StatItem>

                        <StatItem>
                          <StatValue color="#06b6d4">
                            {(employeeStats?.hoursWorked || 0).toFixed(2)} h
                          </StatValue>
                          <StatLabel>
                            <FiClock />
                            Godzin
                          </StatLabel>
                        </StatItem>

                        <StatItem>
                          <StatValue color="#f59e0b">
                            {(employeeStats?.estimatedPayout || 0).toFixed(2)} zł
                          </StatValue>
                          <StatLabel>
                            <FiBarChart2 />
                            Prognozowana wypłata
                          </StatLabel>
                        </StatItem>

                        <StatItem>
                          <StatValue color="#ec4899">
                            {((employeeStats?.hoursWorked || 0) > 0 ? (employeeStats?.totalEarnings || 0) / (employeeStats?.hoursWorked || 1) : 0).toFixed(2)} zł/h
                          </StatValue>
                          <StatLabel>
                            <FiCalendar />
                            Śr. za godzinę
                          </StatLabel>
                        </StatItem>
                      </StatsGrid>
                      
                      {expandedStats && employeeStats && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PaymentBreakdown>
                            <BreakdownTitle>Szczegółowy podział płatności</BreakdownTitle>
                            <PaymentMethodsGrid>
                              {employeeStats.cashAmount > 0 && (
                                <PaymentMethodItem>
                                  <PaymentMethodLabel>💵 Gotówka</PaymentMethodLabel>
                                  <PaymentMethodAmount>{employeeStats.cashAmount.toFixed(2)} zł</PaymentMethodAmount>
                                </PaymentMethodItem>
                              )}
                              {employeeStats.cardAmount > 0 && (
                                <PaymentMethodItem>
                                  <PaymentMethodLabel>💳 Karta</PaymentMethodLabel>
                                  <PaymentMethodAmount>{employeeStats.cardAmount.toFixed(2)} zł</PaymentMethodAmount>
                                </PaymentMethodItem>
                              )}
                              {employeeStats.blikAmount > 0 && (
                                <PaymentMethodItem>
                                  <PaymentMethodLabel>📱 BLIK</PaymentMethodLabel>
                                  <PaymentMethodAmount>{employeeStats.blikAmount.toFixed(2)} zł</PaymentMethodAmount>
                                </PaymentMethodItem>
                              )}
                              {employeeStats.prepaidAmount > 0 && (
                                <PaymentMethodItem>
                                  <PaymentMethodLabel>💰 Przedpłata</PaymentMethodLabel>
                                  <PaymentMethodAmount>{employeeStats.prepaidAmount.toFixed(2)} zł</PaymentMethodAmount>
                                </PaymentMethodItem>
                              )}
                              {employeeStats.transferAmount > 0 && (
                                <PaymentMethodItem>
                                  <PaymentMethodLabel>🏦 Przelew</PaymentMethodLabel>
                                  <PaymentMethodAmount>{employeeStats.transferAmount.toFixed(2)} zł</PaymentMethodAmount>
                                </PaymentMethodItem>
                              )}
                              {employeeStats.freeAmount > 0 && (
                                <PaymentMethodItem>
                                  <PaymentMethodLabel>🎁 Gratis</PaymentMethodLabel>
                                  <PaymentMethodAmount style={{ color: '#dc2626' }}>{employeeStats.freeAmount.toFixed(2)} zł</PaymentMethodAmount>
                                </PaymentMethodItem>
                              )}
                            </PaymentMethodsGrid>
                          </PaymentBreakdown>
                        </motion.div>
                      )}
                    )}
                  </StatsSection>
                )}
              </EmployeeCard>
            </motion.div>
          ))}
        </EmployeeList>
      </Container>
      <Navigation />
    </EmployeesContainer>
  )
}

export default Employees