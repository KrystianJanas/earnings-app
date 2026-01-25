import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCreditCard, FiGift, FiUsers, FiClock, FiTrendingUp, FiDollarSign } from 'react-icons/fi'
import { earningsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Container, media } from '../styles/theme'

const DashboardContainer = styled.div`
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

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  `}
`

const WelcomeText = styled.h1`
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

const PeriodSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};

  ${media.lg`
    gap: 12px;
    padding: ${({ theme }) => theme.spacing.md};
  `}
`

const PeriodButton = styled.button`
  padding: 10px 16px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.gradient.primary : 'transparent'};
  border: ${({ $isActive, theme }) =>
    $isActive ? 'none' : `1px solid ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ $isActive, theme }) =>
    $isActive ? 'white' : theme.colors.text.secondary};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ $isActive, theme }) =>
    $isActive ? theme.shadows.button : 'none'};

  &:hover {
    background: ${({ $isActive, theme }) =>
      $isActive ? undefined : theme.colors.surface};
    color: ${({ $isActive, theme }) =>
      $isActive ? 'white' : theme.colors.text.primary};
  }

  ${media.lg`
    padding: 12px 20px;
    font-size: 0.9rem;
  `}
`

const MainStatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.buttonHover};

  ${media.lg`
    padding: ${({ theme }) => theme.spacing.xl};
  `}
`

const MainStatLabel = styled.div`
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const MainStatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;

  ${media.lg`
    font-size: 3rem;
  `}
`

const MainStatSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  ${media.md`
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  `}

  ${media.lg`
    grid-template-columns: repeat(4, 1fr);
  `}
`

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    border-color: ${({ theme }) => theme.colors.border};
  }
`

const StatIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 1.25rem;
  color: ${({ $color }) => $color};
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;

  ${media.lg`
    font-size: 1.5rem;
  `}
`

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  ${media.md`
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  `}

  ${media.lg`
    grid-template-columns: repeat(4, 1fr);
  `}
`

const PaymentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`

const PaymentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color}12;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`

const PaymentInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const PaymentValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

const PaymentLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.error};
`

const Dashboard = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const { data: dashboardData, isLoading, error } = useQuery(
    ['dashboard', selectedPeriod],
    () => earningsAPI.getDashboard(selectedPeriod).then(res => res.data),
    { refetchOnMount: true }
  )

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'day': return 'dzisiaj'
      case 'week': return 'w tym tygodniu'
      case 'prev-month':
        const prevMonth = new Date()
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        return `w ${prevMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`
      case 'year': return `w ${new Date().getFullYear()} roku`
      case 'all': return 'od początku'
      default: return `w ${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`
    }
  }

  const periodOptions = [
    { value: 'day', label: 'Dzisiaj' },
    { value: 'week', label: 'Tydzień' },
    { value: 'month', label: 'Miesiąc' },
    { value: 'prev-month', label: 'Poprzedni' },
    { value: 'year', label: 'Rok' },
    { value: 'all', label: 'Wszystko' },
  ]

  if (isLoading) {
    return (
      <DashboardContainer>
        <PageHeader>
          <WelcomeText>Witaj, {user?.firstName}!</WelcomeText>
          <SubText>Ładowanie danych...</SubText>
        </PageHeader>
        <LoadingContainer>Ładowanie Twoich zarobków...</LoadingContainer>
      </DashboardContainer>
    )
  }

  if (error) {
    return (
      <DashboardContainer>
        <PageHeader>
          <WelcomeText>Witaj, {user?.firstName}!</WelcomeText>
        </PageHeader>
        <ErrorContainer>
          <p>Nie udało się załadować danych o zarobkach</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Spróbuj ponownie później
          </p>
        </ErrorContainer>
      </DashboardContainer>
    )
  }

  const earnings = dashboardData?.data || {}

  const paymentMethods = [
    { label: 'Gotówka', value: earnings.cashAmount || 0, icon: '💵', color: '#10B981' },
    { label: 'Karta', value: earnings.cardAmount || 0, icon: <FiCreditCard />, color: '#3B82F6' },
    { label: 'BLIK', value: earnings.blikAmount || 0, icon: '📱', color: '#8B5CF6' },
    { label: 'Przedpłata', value: earnings.prepaidAmount || 0, icon: '💰', color: '#F59E0B' },
    { label: 'Przelew', value: earnings.transferAmount || 0, icon: '🏦', color: '#06B6D4' },
    { label: 'Gratis', value: earnings.freeAmount || 0, icon: '🎁', color: '#EC4899' },
    { label: 'Napiwki', value: earnings.tipsAmount || 0, icon: <FiGift />, color: '#F59E0B' },
  ]

  return (
    <DashboardContainer>
      <PageHeader>
        <WelcomeText>Witaj, {user?.firstName}!</WelcomeText>
        <SubText>Oto przegląd zarobków {getPeriodLabel()}</SubText>
      </PageHeader>

      <PeriodSelector>
        {periodOptions.map((option) => (
          <PeriodButton
            key={option.value}
            $isActive={selectedPeriod === option.value}
            onClick={() => setSelectedPeriod(option.value)}
          >
            {option.label}
          </PeriodButton>
        ))}
      </PeriodSelector>

      <MainStatCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MainStatLabel>
          <FiTrendingUp />
          Łączny obrót
        </MainStatLabel>
        <MainStatValue>
          {(earnings.totalEarnings || 0).toFixed(2)} zł
        </MainStatValue>
        <MainStatSubtext>Obrót {getPeriodLabel()}</MainStatSubtext>
      </MainStatCard>

      <SectionTitle>
        <FiDollarSign />
        Statystyki
      </SectionTitle>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <StatIconWrapper $color="#06B6D4">
            <FiClock />
          </StatIconWrapper>
          <StatValue>{(earnings.hoursWorked || 0).toFixed(1)} h</StatValue>
          <StatLabel>Przepracowane godziny</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <StatIconWrapper $color="#8B5CF6">
            <FiUsers />
          </StatIconWrapper>
          <StatValue>{earnings.clientsCount || 0}</StatValue>
          <StatLabel>Klientów</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <StatIconWrapper $color="#10B981">
            💰
          </StatIconWrapper>
          <StatValue>{(earnings.estimatedEarnings || 0).toFixed(0)} zł</StatValue>
          <StatLabel>Prognozowana wypłata</StatLabel>
        </StatCard>
      </StatsGrid>

      <SectionTitle>
        <FiCreditCard />
        Metody płatności
      </SectionTitle>

      <PaymentMethodsGrid>
        {paymentMethods.map((method, index) => (
          <PaymentCard
            key={method.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <PaymentIcon $color={method.color}>
              {method.icon}
            </PaymentIcon>
            <PaymentInfo>
              <PaymentValue>{method.value.toFixed(2)} zł</PaymentValue>
              <PaymentLabel>{method.label}</PaymentLabel>
            </PaymentInfo>
          </PaymentCard>
        ))}
      </PaymentMethodsGrid>
    </DashboardContainer>
  )
}

export default Dashboard
