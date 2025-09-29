import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiUsers, FiEdit3, FiDollarSign, FiTrendingUp, FiCalendar, FiClock, FiBarChart2 } from 'react-icons/fi'
import { companiesAPI, employeesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Container, Card } from '../styles/theme'

const EmployeesContainer = styled.div`
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

const Employees = () => {
  const { currentCompany, user } = useAuth()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [hourlyRates, setHourlyRates] = useState({})
  const [savingRates, setSavingRates] = useState({})

  // Check if user is owner
  const isOwner = currentCompany?.userRole === 'owner'

  const { data: employees, isLoading: employeesLoading } = useQuery(
    ['employees', currentCompany?.id],
    () => companiesAPI.getEmployees(currentCompany.id).then(res => res.data),
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
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
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
        <Container>
          <Header>
            <Title>Zarządzanie pracownikami</Title>
            <Subtitle>Dostęp ograniczony do właścicieli</Subtitle>
          </Header>
          
          <NoAccessMessage>
            <FiUsers size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Tylko właściciele salonu mają dostęp do zarządzania pracownikami.</p>
          </NoAccessMessage>
        </Container>
      </EmployeesContainer>
    )
  }

  if (employeesLoading) {
    return (
      <EmployeesContainer>
        <Container>
          <Header>
            <Title>Zarządzanie pracownikami</Title>
          </Header>
          
          <LoadingCard>
            Ładowanie pracowników...
          </LoadingCard>
        </Container>
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
                      {getInitials(`${employee.firstName} ${employee.lastName}`)}
                    </EmployeeAvatar>
                    <EmployeeDetails>
                      <EmployeeName>
                        {employee.firstName} {employee.lastName}
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
                        <StatItem>
                          <StatValue color="#6366f1">
                            {(employeeStats?.totalEarnings || 0).toFixed(2)} zł
                          </StatValue>
                          <StatLabel>
                            <FiDollarSign />
                            Łączny obrót
                          </StatLabel>
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
                    )}
                  </StatsSection>
                )}
              </EmployeeCard>
            </motion.div>
          ))}
        </EmployeeList>
      </Container>
    </EmployeesContainer>
  )
}

export default Employees