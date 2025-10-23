import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCreditCard, FiGift, FiUsers, FiClock, FiChevronDown } from 'react-icons/fi'
import { earningsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Container, Card, media } from '../styles/theme'
import Navigation from '../components/Navigation'

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};

  ${media.lg`
    padding: ${({ theme }) => theme.spacing.lg} 0;
    padding-bottom: ${({ theme }) => theme.spacing.lg};
  `}
`

const ResponsiveContainer = styled(Container)`
  ${media.lg`
    max-width: 100%;
    padding: 0 ${({ theme }) => theme.spacing.md};
  `}

  ${media.xl`
    max-width: 1400px;
    padding: 0 ${({ theme }) => theme.spacing.lg};
  `}
`

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;

  ${media.lg`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  `}
`

const HeaderContent = styled.div`
  ${media.lg`
    text-align: left;
  `}
`

const WelcomeText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  ${media.lg`
    font-size: 1.75rem;
  `}
`

const SubText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;

  ${media.lg`
    font-size: 0.95rem;
  `}
`

const PeriodSelector = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: center;

  ${media.lg`
    margin-bottom: 0;
  `}
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
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.cardBg};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  ${media.lg`
    padding: 10px 36px 10px 16px;
    font-size: 0.9rem;
    background: ${({ theme }) => theme.colors.cardBg};
    border: 1px solid ${({ theme }) => theme.colors.border};
  `}
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

const AllCardsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: 1fr;
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg} auto;

  ${media.md`
    gap: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    max-width: 100%;
    margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
    gap: ${({ theme }) => theme.spacing.sm};
    grid-template-columns: 1fr;
  `}
`

const EarningsCard = styled(Card)`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100px;

  ${media.lg`
    min-height: 80px;
    padding: ${({ theme }) => theme.spacing.md};
  `}

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
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  `}
`

const EarningsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};

  ${media.lg`
    font-size: 1rem;
  `}
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

  ${media.lg`
    width: 36px;
    height: 36px;

    svg {
      font-size: 1.1rem;
    }
  `}
`

const EarningsAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  ${media.md`
    font-size: 2.5rem;
  `}

  ${media.lg`
    font-size: 2rem;
    margin-bottom: 4px;
  `}
`

const EarningsLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;

  ${media.lg`
    font-size: 0.8rem;
  `}
`

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.md};
    padding-bottom: ${({ theme }) => theme.spacing.md};
  `}
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${media.md`
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    grid-template-columns: ${({ columns }) => columns ? `repeat(${columns}, 1fr)` : 'repeat(3, 1fr)'};
    gap: ${({ theme }) => theme.spacing.sm};
    justify-items: ${({ columns }) => columns === 4 ? 'center' : 'stretch'};

    & > * {
      ${({ columns }) => columns === 4 ? 'width: 100%; max-width: 250px;' : ''}
    }
  `}

  ${media.xl`
    gap: ${({ theme }) => theme.spacing.md};
  `}
`

const StatCard = styled(Card)`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100px;

  ${media.lg`
    min-height: 85px;
    padding: ${({ theme }) => theme.spacing.sm};
  `}

  ${media.xl`
    padding: ${({ theme }) => theme.spacing.md};
  `}
`

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const StatAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  ${media.lg`
    font-size: 1.25rem;
    margin-bottom: 4px;
  `}

  ${media.xl`
    font-size: 1.5rem;
  `}
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

  ${media.lg`
    font-size: 0.75rem;
    gap: 4px;

    svg {
      font-size: 0.9rem;
    }
  `}

  ${media.xl`
    font-size: 0.875rem;
  `}
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
      // refetchInterval: 60000, // Disabled automatic refresh to reduce API calls
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
      <ResponsiveContainer>
        <Header>
          <HeaderContent>
            <WelcomeText>Witaj ponownie, {user?.firstName}!</WelcomeText>
            <SubText>Oto przegląd zarobków {getPeriodLabel()}</SubText>
          </HeaderContent>

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
        </Header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sekcja 1: Łączny obrót */}
          <Section>
            <AllCardsGrid>
              <EarningsCard color="#6366f1">
                <EarningsHeader>
                  <IconWrapper color="#6366f1">
                    💰
                  </IconWrapper>
                  <EarningsTitle>Łączny obrót</EarningsTitle>
                </EarningsHeader>
                <EarningsAmount>
                  {(earnings.totalEarnings || 0).toFixed(2)} zł
                </EarningsAmount>
                <EarningsLabel>Obrót {getPeriodLabel()}</EarningsLabel>
              </EarningsCard>
            </AllCardsGrid>
          </Section>

          {/* Sekcja 2: Statystyki pracy */}
          <Section>
            <StatsGrid columns={3}>
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
                <StatAmount color="#8b5cf6">
                  {earnings.clientsCount || 0}
                </StatAmount>
                <StatLabel>
                  <FiUsers />
                  Klientek
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#ef4444">
                  {(earnings.estimatedEarnings || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  💰
                  Prognozowana wypłata
                </StatLabel>
              </StatCard>
            </StatsGrid>
          </Section>

          {/* Sekcja 3: Metody płatności */}
          <Section>
            <StatsGrid columns={4}>
              <StatCard>
                <StatAmount color="#10b981">
                  {(earnings.cashAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  💵
                  Gotówka
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#3b82f6">
                  {(earnings.cardAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  <FiCreditCard />
                  Karta
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#9333ea">
                  {(earnings.blikAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  📱
                  BLIK
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#ea580c">
                  {(earnings.prepaidAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  💰
                  Przedpłata
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#0891b2">
                  {(earnings.transferAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  🏦
                  Przelew
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#dc2626">
                  {(earnings.freeAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  🎁
                  Gratis
                </StatLabel>
              </StatCard>

              <StatCard>
                <StatAmount color="#f59e0b">
                  {(earnings.tipsAmount || 0).toFixed(2)} zł
                </StatAmount>
                <StatLabel>
                  <FiGift />
                  Napiwki
                </StatLabel>
              </StatCard>
            </StatsGrid>
          </Section>
        </motion.div>
      </ResponsiveContainer>
      <Navigation />
    </DashboardContainer>
  )
}

export default Dashboard