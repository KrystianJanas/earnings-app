import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiTrendingUp, FiCreditCard, FiGift, FiChevronLeft, FiChevronRight, FiUsers, FiClock } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { earningsAPI } from '../services/api'
import { Container, Card } from '../styles/theme'
import Navigation from '../components/Navigation'

const MonthlyContainer = styled.div`
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

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const MonthButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.1rem;
  }
`

const CurrentMonth = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 180px;
  text-align: center;
`

const SummaryGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing.xl};
  }
`

const SummaryCard = styled(Card)`
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

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SummaryTitle = styled.h3`
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

const SummaryAmount = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

const StatAmount = styled.div`
  font-size: 1.2rem;
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
    font-size: 0.875rem;
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
          <MonthButton onClick={goToPreviousMonth}>
            <FiChevronLeft />
          </MonthButton>
          <CurrentMonth>{monthName}</CurrentMonth>
          <MonthButton 
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
          >
            <FiChevronRight />
          </MonthButton>
        </MonthSelector>

        <motion.div
          key={`${currentYear}-${currentMonth}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SummaryGrid>
            <SummaryCard color="#6366f1">
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
                  <StatAmount color="#f59e0b">
                    {(total.tips || 0).toFixed(2)} zł
                  </StatAmount>
                  <StatLabel>
                    <FiGift />
                    Napiwki
                  </StatLabel>
                </StatItem>
              </StatsRow>

              <StatsRow>
                <StatItem>
                  <StatAmount color="#06b6d4">
                    {(total.hours || 0).toFixed(2)} h
                  </StatAmount>
                  <StatLabel>
                    <FiClock />
                    Przepracowane godziny
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
            </SummaryCard>
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
                      Gotówka: {day.cashAmount.toFixed(2)} zł | 
                      Karta: {day.cardAmount.toFixed(2)} zł
                      {day.clientsCount > 0 && ` | Klientek: ${day.clientsCount}`}
                      {day.hoursWorked > 0 && ` | Godzin: ${day.hoursWorked.toFixed(2)} h`}
                      {day.tipsAmount > 0 && ` | Napiwki: ${day.tipsAmount.toFixed(2)} zł`}
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