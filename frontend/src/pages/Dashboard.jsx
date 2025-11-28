import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCreditCard, FiGift, FiUsers, FiClock, FiChevronDown } from 'react-icons/fi'
import { earningsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Container, Card, GlassCard, media, GradientText } from '../styles/theme'
import Navigation from '../components/Navigation'
import Header from '../components/Header'

const DashboardContainer = styled(motion.div)`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  padding-bottom: 100px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.backgroundSecondary} 100%);

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

const DashboardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: center;

  ${media.lg`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  `}
`

const DashboardHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  ${media.lg`
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  `}
`

const HeaderTextContent = styled.div`
  ${media.lg`
    text-align: left;
  `}
`

const WelcomeText = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;

  ${media.lg`
    font-size: 1.75rem;
  `}
`

const SubText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;

  ${media.lg`
    font-size: 0.95rem;
  `}
`

const PeriodSelector = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
`

const PeriodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  ${media.sm`
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    grid-template-columns: repeat(6, 1fr);
  `}
`

const PeriodButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ isActive, theme }) =>
    isActive 
      ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%)'};
  border: 2px solid ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ isActive, theme }) =>
    isActive ? 'white' : theme.colors.text.primary};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-transform: capitalize;

  &:hover {
    background: ${({ isActive, theme }) =>
      isActive 
        ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)'};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
    transform: translateY(-2px);
  }

  ${media.sm`
    font-size: 0.85rem;
    padding: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    padding: 12px 16px;
    font-size: 0.9rem;
  `}
`

const AllCardsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  grid-template-columns: 1fr;
  max-width: 100%;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;

  ${media.md`
    gap: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    max-width: 100%;
    gap: ${({ theme }) => theme.spacing.md};
    grid-template-columns: 1fr;
  `}
`

const EarningsCard = styled(motion(GlassCard))`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100px;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%);
  backdrop-filter: ${({ theme }) => theme.blur.sm};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 60px rgba(139, 92, 246, 0.3);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%);
  }

  ${media.lg`
    min-height: 110px;
    padding: ${({ theme }) => theme.spacing.lg};
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ color }) => color};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`

const EarningsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  width: 100%;

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  `}
`

const EarningsTitle = styled.h3`
  font-size: 0.95rem;
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
  font-size: 1.2rem;
  box-shadow: 0 0 20px ${({ color }) => color}30;
  transition: all ${({ theme }) => theme.transitions.normal};

  svg {
    font-size: 1.2rem;
  }

  ${media.lg`
    width: 48px;
    height: 48px;

    svg {
      font-size: 1.3rem;
    }
  `}
`

const EarningsAmount = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;

  ${media.md`
    font-size: 2rem;
  `}

  ${media.lg`
    font-size: 2.25rem;
    margin-bottom: 8px;
  `}
`

const EarningsLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;

  ${media.lg`
    font-size: 0.8rem;
  `}
`

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    padding-bottom: ${({ theme }) => theme.spacing.xl};
  `}
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  ${media.md`
    gap: ${({ theme }) => theme.spacing.md};
    grid-template-columns: ${({ columns }) => {
      if (columns === 3) return 'repeat(3, 1fr)';
      return '1fr 1fr';
    }};
  `}

  ${media.lg`
    display: flex;
    flex-wrap: wrap;
    justify-content: ${({ columns }) => columns === 4 ? 'center' : 'flex-start'};
    gap: ${({ theme }) => theme.spacing.sm};

    & > * {
      flex: 0 0 ${({ columns }) => {
        if (columns === 4) return 'calc(25% - 12px)';
        if (columns === 3) return 'calc(33.333% - 12px)';
        return 'calc(50% - 12px)';
      }};
      min-width: ${({ columns }) => columns === 4 ? '200px' : 'auto'};
      max-width: ${({ columns }) => columns === 4 ? '280px' : 'none'};
    }
  `}

  ${media.xl`
    gap: ${({ theme }) => theme.spacing.md};

    & > * {
      flex: 0 0 ${({ columns }) => {
        if (columns === 4) return 'calc(25% - 18px)';
        if (columns === 3) return 'calc(33.333% - 18px)';
        return 'calc(50% - 18px)';
      }};
    }
  `}
`

const StatCard = styled(motion(Card))`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100px;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 50px rgba(139, 92, 246, 0.25);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%);
  }

  ${media.lg`
    min-height: 120px;
    padding: ${({ theme }) => theme.spacing.md};
  `}

  ${media.xl`
    padding: ${({ theme }) => theme.spacing.lg};
  `}

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%);
    transition: all ${({ theme }) => theme.transitions.normal};
  }
`

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const StatAmount = styled.div`
  font-size: 1.3rem;
  font-weight: 800;
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  margin-bottom: 8px;
  text-shadow: 0 0 20px ${({ color, theme }) => color}30;

  ${media.md`
    font-size: 1.5rem;
  `}

  ${media.lg`
    font-size: 1.75rem;
    margin-bottom: 12px;
  `}

  ${media.xl`
    font-size: 2rem;
  `}
`

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  svg {
    font-size: 0.9rem;
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

  const periodOptions = [
    { value: 'day', label: 'Dzisiaj' },
    { value: 'week', label: 'Ten tydzień' },
    { value: 'month', label: 'Ten miesiąc' },
    { value: 'prev-month', label: 'Poprzedni' },
    { value: 'year', label: 'Ten rok' },
    { value: 'all', label: 'Od początku' },
  ]

  return (
    <DashboardContainer>
      <ResponsiveContainer>
        <div style={{ marginBottom: '1rem' }}>
          <DashboardHeaderContent>
            <HeaderTextContent>
              <WelcomeText>Witaj ponownie, {user?.firstName}!</WelcomeText>
              <SubText>Oto przegląd zarobków {getPeriodLabel()}</SubText>
            </HeaderTextContent>
          </DashboardHeaderContent>
        </div>

        <PeriodSelector>
          <PeriodsGrid>
            {periodOptions.map((option) => (
              <PeriodButton
                key={option.value}
                isActive={selectedPeriod === option.value}
                onClick={() => setSelectedPeriod(option.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {option.label}
              </PeriodButton>
            ))}
          </PeriodsGrid>
        </PeriodSelector>

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