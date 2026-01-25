import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiTrendingUp, FiCreditCard, FiGift, FiChevronLeft, FiChevronRight, FiUsers, FiClock } from 'react-icons/fi'
import { earningsAPI } from '../services/api'
import { Container, media } from '../styles/theme'

const MonthlyContainer = styled.div`
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
    margin-bottom: 4px;

    ${media.lg`
      font-size: 1.875rem;
    `}
  }
`

const MonthSelector = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const MonthSelectorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const MonthButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.25rem;
  }
`

const CurrentMonth = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 80px;
  text-align: center;
`

const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  ${media.md`
    grid-template-columns: repeat(6, 1fr);
  `}

  ${media.lg`
    grid-template-columns: repeat(12, 1fr);
  `}
`

const MonthItem = styled.button`
  padding: 10px 8px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.gradient.primary : theme.colors.surface};
  border: 1px solid ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ $isActive, theme }) =>
    $isActive ? 'white' : theme.colors.text.secondary};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ $isActive, theme }) => $isActive ? theme.shadows.button : 'none'};

  &:hover:not(:disabled) {
    background: ${({ $isActive, theme }) =>
      $isActive ? undefined : theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const MainStatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.buttonHover};
`

const MainStatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;

  ${media.lg`
    font-size: 2.75rem;
  `}
`

const MainStatLabel = styled.div`
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  ${media.md`
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  `}
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  svg {
    font-size: 0.85rem;
  }
`

const PaymentsCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SectionTitle = styled.h3`
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

const PaymentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  ${media.md`
    grid-template-columns: repeat(3, 1fr);
  `}
`

const PaymentItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 12px;
  text-align: center;
`

const PaymentValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
`

const PaymentLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
`

const DailyBreakdown = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const DayItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

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
  font-size: 0.9rem;
`

const DayDetails = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`

const DayTotal = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
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
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Monthly = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const currentMonth = selectedDate.getMonth() + 1
  const currentYear = selectedDate.getFullYear()

  const { data: monthlyData, isLoading, error } = useQuery(
    ['monthlyEarnings', currentYear, currentMonth],
    () => earningsAPI.getMonthlyEarnings(currentYear, currentMonth).then(res => res.data),
    { refetchOnMount: true }
  )

  const goToPreviousYear = () => {
    setSelectedDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))
  }

  const goToNextYear = () => {
    setSelectedDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))
  }

  const isCurrentYear = selectedDate.getFullYear() === new Date().getFullYear()
  const monthNames = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']

  if (isLoading) {
    return (
      <MonthlyContainer>
        <PageHeader>
          <h1>Przegląd miesięczny</h1>
        </PageHeader>
        <LoadingContainer>Ładowanie danych...</LoadingContainer>
      </MonthlyContainer>
    )
  }

  if (error) {
    return (
      <MonthlyContainer>
        <PageHeader>
          <h1>Przegląd miesięczny</h1>
        </PageHeader>
        <ErrorContainer>
          <p>Nie udało się załadować danych</p>
        </ErrorContainer>
      </MonthlyContainer>
    )
  }

  const { total, daily } = monthlyData || { total: {}, daily: [] }

  return (
    <MonthlyContainer>
      <PageHeader>
        <h1>Przegląd miesięczny</h1>
      </PageHeader>

      <MonthSelector>
        <MonthSelectorHeader>
          <MonthButton onClick={goToPreviousYear}>
            <FiChevronLeft />
          </MonthButton>
          <CurrentMonth>{selectedDate.getFullYear()}</CurrentMonth>
          <MonthButton onClick={goToNextYear} disabled={isCurrentYear}>
            <FiChevronRight />
          </MonthButton>
        </MonthSelectorHeader>

        <MonthsGrid>
          {monthNames.map((month, index) => {
            const monthDate = new Date(selectedDate.getFullYear(), index, 1)
            const isSelected = index === selectedDate.getMonth()
            const isDisabled = monthDate > new Date()
            
            return (
              <MonthItem
                key={index}
                $isActive={isSelected}
                disabled={isDisabled}
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), index, 1))}
              >
                {month}
              </MonthItem>
            )
          })}
        </MonthsGrid>
      </MonthSelector>

      <motion.div
        key={`${currentYear}-${currentMonth}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MainStatCard>
          <MainStatValue>{(total.earnings || 0).toFixed(2)} zł</MainStatValue>
          <MainStatLabel>Łączny obrót w miesiącu</MainStatLabel>
        </MainStatCard>

        <StatsGrid>
          <StatCard>
            <StatValue $color="#8B5CF6">{total.clients || 0}</StatValue>
            <StatLabel><FiUsers /> Klientów</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue $color="#06B6D4">{(total.hours || 0).toFixed(1)} h</StatValue>
            <StatLabel><FiClock /> Godzin</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue $color="#F59E0B">{(total.tips || 0).toFixed(0)} zł</StatValue>
            <StatLabel><FiGift /> Napiwki</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue $color="#10B981">{(total.estimatedEarnings || 0).toFixed(0)} zł</StatValue>
            <StatLabel>💰 Wypłata</StatLabel>
          </StatCard>
        </StatsGrid>

        <PaymentsCard>
          <SectionTitle>
            <FiCreditCard />
            Metody płatności
          </SectionTitle>
          <PaymentsGrid>
            <PaymentItem>
              <PaymentValue $color="#10B981">{(total.cash || 0).toFixed(0)} zł</PaymentValue>
              <PaymentLabel>💵 Gotówka</PaymentLabel>
            </PaymentItem>
            <PaymentItem>
              <PaymentValue $color="#3B82F6">{(total.card || 0).toFixed(0)} zł</PaymentValue>
              <PaymentLabel>💳 Karta</PaymentLabel>
            </PaymentItem>
            <PaymentItem>
              <PaymentValue $color="#8B5CF6">{(total.blik || 0).toFixed(0)} zł</PaymentValue>
              <PaymentLabel>📱 BLIK</PaymentLabel>
            </PaymentItem>
            <PaymentItem>
              <PaymentValue $color="#F59E0B">{(total.prepaid || 0).toFixed(0)} zł</PaymentValue>
              <PaymentLabel>💰 Przedpłata</PaymentLabel>
            </PaymentItem>
            <PaymentItem>
              <PaymentValue $color="#06B6D4">{(total.transfer || 0).toFixed(0)} zł</PaymentValue>
              <PaymentLabel>🏦 Przelew</PaymentLabel>
            </PaymentItem>
            <PaymentItem>
              <PaymentValue $color="#EC4899">{(total.free || 0).toFixed(0)} zł</PaymentValue>
              <PaymentLabel>🎁 Gratis</PaymentLabel>
            </PaymentItem>
          </PaymentsGrid>
        </PaymentsCard>

        {daily && daily.filter(day => day.totalDaily > 0).length > 0 ? (
          <DailyBreakdown>
            <SectionTitle>
              <FiCalendar />
              Zestawienie dzienne
            </SectionTitle>
            
            {daily
              .filter(day => day.totalDaily > 0)
              .map((day, index) => (
              <DayItem key={index}>
                <DayInfo>
                  <DayDate>
                    {new Date(day.date).toLocaleDateString('pl-PL', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short'
                    })}
                  </DayDate>
                  <DayDetails>
                    {day.clientsCount > 0 && `${day.clientsCount} klientek`}
                    {day.hoursWorked > 0 && ` • ${day.hoursWorked.toFixed(1)}h`}
                  </DayDetails>
                </DayInfo>
                <DayTotal>{day.totalDaily.toFixed(2)} zł</DayTotal>
              </DayItem>
            ))}
          </DailyBreakdown>
        ) : (
          <EmptyState>Brak danych za ten miesiąc</EmptyState>
        )}
      </motion.div>
    </MonthlyContainer>
  )
}

export default Monthly
