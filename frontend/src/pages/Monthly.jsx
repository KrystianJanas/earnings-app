import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiTrendingUp, FiCreditCard, FiGift, FiChevronLeft, FiChevronRight, FiUsers, FiClock } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { earningsAPI } from '../services/api'
import { Container, Card, GlassCard, media, GradientText } from '../styles/theme'
import Navigation from '../components/Navigation'

const MonthlyContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.sm} 0;
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
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;

  ${media.lg`
    text-align: left;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  `}
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.5px;

  ${media.lg`
    font-size: 2rem;
  `}
`

const MonthSelector = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
`

const MonthSelectorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const MonthNavigationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`

const MonthButton = styled(motion.button)`
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  font-weight: 700;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: white;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
    transform: translateY(-3px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.3rem;
  }
`

const CurrentMonth = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  ${media.lg`
    font-size: 1.3rem;
  `}
`

const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  ${media.sm`
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    grid-template-columns: repeat(6, 1fr);
  `}
`

const MonthItem = styled(motion.button)`
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
  font-size: 0.85rem;
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
    font-size: 0.9rem;
    padding: ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    padding: 12px 16px;
    font-size: 0.95rem;
  `}
`

const SummaryGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  grid-template-columns: 1fr;
  max-width: 800px;
  margin: 0 auto ${({ theme }) => theme.spacing.md} auto;

  ${media.lg`
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  `}
`

const MainStatsCard = styled(motion(GlassCard))`
  position: relative;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%);
  backdrop-filter: ${({ theme }) => theme.blur.md};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.15);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.1) 100%);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.gradient.primary};
  }

  @media (min-width: 640px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const DetailedStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  ${media.lg`
    gap: ${({ theme }) => theme.spacing.md};
  `}
`

const SummaryCard = styled(Card)`
  position: relative;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.sm};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }

  @media (min-width: 640px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (min-width: 640px) {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`

const SummaryTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (min-width: 640px) {
    font-size: 1.1rem;
  }
`

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ color, theme }) => color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color};
  font-size: 1rem;

  svg {
    font-size: 1rem;
  }

  @media (min-width: 640px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;

    svg {
      font-size: 1.2rem;
    }
  }
`

const SummaryAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;

  @media (min-width: 640px) {
    font-size: 1.8rem;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.sm};

  @media (min-width: 640px) {
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`

const StatItem = styled.div`
  text-align: center;
  padding: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  @media (min-width: 640px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`

const StatAmount = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  margin-bottom: 2px;

  @media (min-width: 640px) {
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  svg {
    font-size: 0.75rem;
  }

  @media (min-width: 640px) {
    font-size: 0.875rem;
    gap: ${({ theme }) => theme.spacing.xs};

    svg {
      font-size: 0.875rem;
    }
  }
`

const DailyBreakdown = styled(Card)`
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const BreakdownTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const DayItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

const DayInfo = styled.div`
  flex: 1;
`

const DayDate = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`

const DayBreakdown = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const DayTotal = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: right;
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

const NoDataCard = styled(Card)`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.lg};
`

const Monthly = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const currentMonth = selectedDate.getMonth() + 1
  const currentYear = selectedDate.getFullYear()

  const { data: monthlyData, isLoading, error } = useQuery(
    ['monthlyEarnings', currentYear, currentMonth],
    () => earningsAPI.getMonthlyEarnings(currentYear, currentMonth).then(res => res.data),
    {
      refetchOnMount: true,
    }
  )

  const goToPreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1))
  }

  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && 
                        selectedDate.getFullYear() === new Date().getFullYear()

  const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
  const monthName = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`

  if (isLoading) {
    return (
      <MonthlyContainer>
        <Container>
          <Header>
            <Title>Przegląd miesięczny</Title>
          </Header>
          
          <LoadingCard>
            Ładowanie danych miesięcznych...
          </LoadingCard>
        </Container>
        <Navigation />
      </MonthlyContainer>
    )
  }

  if (error) {
    return (
      <MonthlyContainer>
        <Container>
          <Header>
            <Title>Przegląd miesięczny</Title>
          </Header>
          
          <ErrorCard>
            <p>Nie udało się załadować danych miesięcznych</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Spróbuj ponownie później
            </p>
          </ErrorCard>
        </Container>
        <Navigation />
      </MonthlyContainer>
    )
  }

  const { total, daily } = monthlyData || { total: {}, daily: [] }

  return (
    <MonthlyContainer>
      <ResponsiveContainer>
        <Header>
          <Title>Przegląd miesięczny</Title>
        </Header>

        <MonthSelector>
          <MonthSelectorHeader>
            <CurrentMonth>{monthName}</CurrentMonth>
            <MonthNavigationButtons>
              <MonthButton onClick={goToPreviousMonth} title="Poprzedni miesiąc">
                <FiChevronLeft />
              </MonthButton>
              <MonthButton 
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                title="Następny miesiąc"
              >
                <FiChevronRight />
              </MonthButton>
            </MonthNavigationButtons>
          </MonthSelectorHeader>
          
          <MonthsGrid>
            {monthNames.map((month, index) => {
              const monthDate = new Date(selectedDate.getFullYear(), index, 1)
              const isSelected = index === selectedDate.getMonth() && 
                               monthDate.getFullYear() === selectedDate.getFullYear()
              const isDisabled = monthDate > new Date()
              
              return (
                <MonthItem
                  key={index}
                  isActive={isSelected}
                  disabled={isDisabled}
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), index, 1))}
                  whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                >
                  {month.substring(0, 3)}
                </MonthItem>
              )
            })}
          </MonthsGrid>
        </MonthSelector>

        <motion.div
          key={`${currentYear}-${currentMonth}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SummaryGrid>
            <MainStatsCard>
              <SummaryHeader>
                <SummaryTitle>Łączny obrót</SummaryTitle>
                <IconWrapper color="#6366f1">
                  💰
                </IconWrapper>
              </SummaryHeader>
              <SummaryAmount>
                {(total.earnings || 0).toFixed(2)} zł
              </SummaryAmount>
              
              <StatsRow>
                <StatItem>
                  <StatAmount color="#8b5cf6">
                    {total.clients || 0}
                  </StatAmount>
                  <StatLabel>
                    <FiUsers />
                    Klientek
                  </StatLabel>
                </StatItem>

                <StatItem>
                  <StatAmount color="#06b6d4">
                    {(total.hours || 0).toFixed(2)} h
                  </StatAmount>
                  <StatLabel>
                    <FiClock />
                    Przepracowane godziny
                  </StatLabel>
                </StatItem>
              </StatsRow>

              <StatsRow>
                <StatItem>
                  <StatAmount color="#f59e0b">
                    {(total.tips || 0).toFixed(2)} zł
                  </StatAmount>
                  <StatLabel>
                    <FiGift />
                    Napiwki
                  </StatLabel>
                </StatItem>

                <StatItem>
                  <StatAmount color="#ec4899">
                    {(total.estimatedEarnings || 0).toFixed(2)} zł
                  </StatAmount>
                  <StatLabel>
                    💰
                    Prognozowana wypłata
                  </StatLabel>
                </StatItem>
              </StatsRow>
            </MainStatsCard>

            <DetailedStatsContainer>
              <SummaryCard color="#10b981">
                <SummaryHeader>
                  <SummaryTitle>Metody płatności</SummaryTitle>
                  <IconWrapper color="#10b981">
                    💳
                  </IconWrapper>
                </SummaryHeader>
                
                <StatsRow>
                  <StatItem>
                    <StatAmount color="#10b981">
                      {(total.cash || 0).toFixed(2)} zł
                    </StatAmount>
                    <StatLabel>
                      💵
                      Gotówka
                    </StatLabel>
                  </StatItem>

                  <StatItem>
                    <StatAmount color="#3b82f6">
                      {(total.card || 0).toFixed(2)} zł
                    </StatAmount>
                    <StatLabel>
                      <FiCreditCard />
                      Karta
                    </StatLabel>
                  </StatItem>

                  <StatItem>
                    <StatAmount color="#9333ea">
                      {(total.blik || 0).toFixed(2)} zł
                    </StatAmount>
                    <StatLabel>
                      📱
                      BLIK
                    </StatLabel>
                  </StatItem>
                </StatsRow>

                <StatsRow>
                  <StatItem>
                    <StatAmount color="#ea580c">
                      {(total.prepaid || 0).toFixed(2)} zł
                    </StatAmount>
                    <StatLabel>
                      💰
                      Przedpłata
                    </StatLabel>
                  </StatItem>

                  <StatItem>
                    <StatAmount color="#0891b2">
                      {(total.transfer || 0).toFixed(2)} zł
                    </StatAmount>
                    <StatLabel>
                      🏦
                      Przelew
                    </StatLabel>
                  </StatItem>

                  <StatItem>
                    <StatAmount color="#dc2626">
                      {(total.free || 0).toFixed(2)} zł
                    </StatAmount>
                    <StatLabel>
                      🎁
                      Gratis
                    </StatLabel>
                  </StatItem>
                </StatsRow>
              </SummaryCard>
            </DetailedStatsContainer>
          </SummaryGrid>

          {daily && daily.filter(day => day.totalDaily > 0).length > 0 ? (
            <DailyBreakdown>
              <BreakdownTitle>
                <FiCalendar />
                Zestawienie dzienne
              </BreakdownTitle>
              
              {daily
                .filter(day => day.totalDaily > 0) // Hide days with 0 earnings
                .map((day, index) => (
                <DayItem key={index}>
                  <DayInfo>
                    <DayDate>
                      {new Date(day.date).toLocaleDateString('pl-PL', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'short'
                      })}
                    </DayDate>
                    <DayBreakdown>
                      {[
                        day.cashAmount > 0 && `Gotówka: ${day.cashAmount.toFixed(2)} zł`,
                        day.cardAmount > 0 && `Karta: ${day.cardAmount.toFixed(2)} zł`,
                        day.blikAmount > 0 && `BLIK: ${day.blikAmount.toFixed(2)} zł`,
                        day.prepaidAmount > 0 && `Przedpłata: ${day.prepaidAmount.toFixed(2)} zł`,
                        day.transferAmount > 0 && `Przelew: ${day.transferAmount.toFixed(2)} zł`,
                        day.freeAmount > 0 && `Gratis: ${day.freeAmount.toFixed(2)} zł`
                      ].filter(Boolean).join(' | ')}
                      {(day.clientsCount > 0 || day.hoursWorked > 0 || day.tipsAmount > 0) && (
                        <>
                          <br />
                          {[
                            day.clientsCount > 0 && `Klientek: ${day.clientsCount}`,
                            day.hoursWorked > 0 && `Godzin: ${day.hoursWorked.toFixed(2)} h`,
                            day.tipsAmount > 0 && `Napiwki: ${day.tipsAmount.toFixed(2)} zł`
                          ].filter(Boolean).join(', ')}
                        </>
                      )}
                    </DayBreakdown>
                  </DayInfo>
                  <DayTotal>
                    {day.totalDaily.toFixed(2)} zł
                  </DayTotal>
                </DayItem>
              ))}
            </DailyBreakdown>
          ) : (
            <NoDataCard>
              <p>Brak zarobków zarejestrowanych w tym miesiącu</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Zacznij dodawać swój dzienny obrót, aby go tutaj zobaczyć
              </p>
            </NoDataCard>
          )}
        </motion.div>
      </ResponsiveContainer>
      <Navigation />
    </MonthlyContainer>
  )
}

export default Monthly