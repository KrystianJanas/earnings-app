import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiDollarSign, FiCreditCard, FiGift, FiUsers, FiClock, FiChevronDown } from 'react-icons/fi'
import { earningsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Container, Card } from '../styles/theme'
import Navigation from '../components/Navigation'

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};
`

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const WelcomeText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const SubText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`

const PeriodSelector = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: center;
`

const PeriodSelect = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  position: relative;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const SelectWrapper = styled.div`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid ${({ theme }) => theme.colors.text.secondary};
    pointer-events: none;
  }
`

const EarningsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EarningsCard = styled(Card)`
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }
`

const EarningsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const EarningsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ color, theme }) => color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color};

  svg {
    font-size: 1.2rem;
  }
`

const EarningsAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const EarningsLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`

const StatCard = styled(Card)`
  text-align: center;
`

const StatAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  svg {
    font-size: 1rem;
  }
`

const LoadingCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ErrorCard = styled(Card)`
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.lg};
`

const Dashboard = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const { data: dashboardData, isLoading, error } = useQuery(
    ['dashboard', selectedPeriod],
    () => earningsAPI.getDashboard(selectedPeriod).then(res => res.data),
    {
      refetchOnMount: true,
      refetchInterval: 60000, // Refresh every minute
    }
  )

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'day':
        return 'dzisiaj'
      case 'week':
        return 'w tym tygodniu'
      case 'prev-month':
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        return `w ${prevMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`
      case 'year':
        return `w ${new Date().getFullYear()} roku`
      case 'all':
        return 'od początku'
      default:
        return `w ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`
    }
  }

  if (isLoading) {
    return (
      <DashboardContainer>
        <Container>
          <Header>
            <WelcomeText>Witaj ponownie, {user?.firstName}!</WelcomeText>
            <SubText>Oto przegląd Twoich zarobków</SubText>
          </Header>
          
          <LoadingCard>
            Ładowanie Twoich zarobków...
          </LoadingCard>
        </Container>
        <Navigation />
      </DashboardContainer>
    )
  }

  if (error) {
    return (
      <DashboardContainer>
        <Container>
          <Header>
            <WelcomeText>Witaj ponownie, {user?.firstName}!</WelcomeText>
            <SubText>Oto przegląd Twoich zarobków</SubText>
          </Header>
          
          <ErrorCard>
            <p>Nie udało się załadować danych o zarobkach</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Spróbuj ponownie później
            </p>
          </ErrorCard>
        </Container>
        <Navigation />
      </DashboardContainer>
    )
  }

  const earnings = dashboardData?.data || {}

  return (
    <DashboardContainer>
      <Container>
        <Header>
          <WelcomeText>Witaj ponownie, {user?.firstName}!</WelcomeText>
          <SubText>Oto przegląd zarobków {getPeriodLabel()}</SubText>
        </Header>
        
        <PeriodSelector>
          <SelectWrapper>
            <PeriodSelect 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="day">Dzisiaj</option>
              <option value="week">Ten tydzień</option>
              <option value="month">Ten miesiąc</option>
              <option value="prev-month">Poprzedni miesiąc</option>
              <option value="year">Ten rok</option>
              <option value="all">Od początku</option>
            </PeriodSelect>
          </SelectWrapper>
        </PeriodSelector>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EarningsGrid>
            <EarningsCard color="#6366f1">
              <EarningsHeader>
                <EarningsTitle>Łączne zarobki</EarningsTitle>
                <IconWrapper color="#6366f1">
                  <FiDollarSign />
                </IconWrapper>
              </EarningsHeader>
              <EarningsAmount>
                {(earnings.totalEarnings || 0).toFixed(2)} zł
              </EarningsAmount>
              <EarningsLabel>Zarobki w tym miesiącu</EarningsLabel>
            </EarningsCard>

            <StatsGrid>
              <StatCard>
                <StatAmount color="#10b981">
                  {(earnings.cashAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  <FiDollarSign />
                  Płatności gotówką
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#3b82f6">
                  {(earnings.cardAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  <FiCreditCard />
                  Płatności kartą
                </StatLabel>
              </StatCard>
            </StatsGrid>

            <StatsGrid>
              <StatCard>
                <StatAmount color="#f59e0b">
                  {(earnings.tipsAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  <FiGift />
                  Napiwki
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#8b5cf6">
                  {earnings.clientsCount || 0}
                </StatAmount>
                <StatLabel>
                  <FiUsers />
                  Klientek
                </StatLabel>
              </StatCard>
            </StatsGrid>

            <StatsGrid>
              <StatCard>
                <StatAmount color="#06b6d4">
                  {(earnings.hoursWorked || 0).toFixed(2)} h
                </StatAmount>
                <StatLabel>
                  <FiClock />
                  Przepracowane godziny
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#ef4444">
                  {(earnings.estimatedEarnings || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  <FiDollarSign />
                  Szacunkowy zarobek
                </StatLabel>
              </StatCard>
            </StatsGrid>
          </EarningsGrid>
        </motion.div>
      </Container>
      <Navigation />
    </DashboardContainer>
  )
}

export default Dashboard