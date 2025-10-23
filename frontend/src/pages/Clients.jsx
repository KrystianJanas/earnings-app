import React, { useState } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUsers, FiSearch, FiX, FiCalendar, FiDollarSign, FiPhone, FiMail, FiFileText } from 'react-icons/fi'
import { clientsAPI } from '../services/api'
import { Container, Card, media } from '../styles/theme'
import Navigation from '../components/Navigation'
import Header from '../components/Header'

const ClientsContainer = styled.div`
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

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;

  ${media.lg`
    text-align: left;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  `}
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  ${media.lg`
    font-size: 1.75rem;
    justify-content: flex-start;
  `}
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;

  ${media.lg`
    font-size: 0.95rem;
  `}
`

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 40px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  height: 40px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  ${media.md`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} 2.5rem;
    font-size: 1rem;
    height: 44px;
  `}
`

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  pointer-events: none;
  display: flex;
  align-items: center;

  svg {
    font-size: 1rem;
  }
`

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const ClientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ClientCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  padding: ${({ theme }) => theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${media.md`
    padding: ${({ theme }) => theme.spacing.md};
  `}
`

const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ClientInfo = styled.div`
  flex: 1;
`

const ClientName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  margin-bottom: 4px;

  ${media.md`
    font-size: 1.1rem;
  `}
`

const ClientContact = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  ${media.md`
    font-size: 0.875rem;
  `}
`

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    font-size: 0.75rem;
  }
`

const ClientStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  ${media.md`
    gap: ${({ theme }) => theme.spacing.sm};
  `}
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  margin-bottom: 2px;

  ${media.md`
    font-size: 1.1rem;
  `}
`

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  ${media.md`
    font-size: 0.75rem;
  `}
`

const LoadingCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const EmptyState = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`

const Modal = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  z-index: 1;
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    font-size: 1.25rem;
  }
`

const ModalContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const TransactionItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
`

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const TransactionDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
`

const TransactionAmount = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`

const PaymentMethods = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`

const TransactionNotes = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid ${({ theme }) => theme.colors.border}50;
`

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)

  const { data: clients, isLoading, error } = useQuery(
    ['clients'],
    () => clientsAPI.getClients(100, 0).then(res => res.data),
    {
      refetchOnMount: true,
    }
  )

  const { data: clientDetails, isLoading: detailsLoading } = useQuery(
    ['client', selectedClient?.id],
    () => clientsAPI.getClient(selectedClient.id).then(res => res.data),
    {
      enabled: !!selectedClient,
    }
  )

  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    ['clientTransactions', selectedClient?.id],
    () => clientsAPI.getTransactionHistory(selectedClient.id, 50).then(res => res.data),
    {
      enabled: !!selectedClient,
    }
  )

  const filteredClients = clients?.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'Nigdy'
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: '💵 Gotówka',
      card: '💳 Karta',
      blik: '📱 BLIK',
      prepaid: '💰 Przedpłata',
      transfer: '🏦 Przelew',
      free: '🎁 Gratis'
    }
    return labels[method] || method
  }

  if (isLoading) {
    return (
      <ClientsContainer>
        <Header />
        <ResponsiveContainer>
          <PageHeader>
            <Title>
              <FiUsers />
              Baza klientek
            </Title>
            <Subtitle>Zarządzaj swoimi klientkami</Subtitle>
          </PageHeader>

          <LoadingCard>
            Ładowanie klientek...
          </LoadingCard>
        </ResponsiveContainer>
        <Navigation />
      </ClientsContainer>
    )
  }

  if (error) {
    return (
      <ClientsContainer>
        <Header />
        <ResponsiveContainer>
          <PageHeader>
            <Title>
              <FiUsers />
              Baza klientek
            </Title>
          </PageHeader>

          <EmptyState>
            <p>Nie udało się załadować klientek</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Spróbuj ponownie później
            </p>
          </EmptyState>
        </ResponsiveContainer>
        <Navigation />
      </ClientsContainer>
    )
  }

  return (
    <ClientsContainer>
      <Header />
      <ResponsiveContainer>
        <PageHeader>
          <Title>
            <FiUsers />
            Baza klientek
          </Title>
          <Subtitle>Masz {clients?.length || 0} klientek w bazie</Subtitle>
        </PageHeader>

        <SearchWrapper>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Szukaj po imieniu, telefonie lub email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>
              <FiX />
            </ClearButton>
          )}
        </SearchWrapper>

        {filteredClients && filteredClients.length > 0 ? (
          <ClientsList>
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ClientCard onClick={() => setSelectedClient(client)}>
                  <ClientHeader>
                    <ClientInfo>
                      <ClientName>{client.full_name}</ClientName>
                      <ClientContact>
                        {client.phone && (
                          <ContactItem>
                            <FiPhone />
                            {client.phone}
                          </ContactItem>
                        )}
                        {client.email && (
                          <ContactItem>
                            <FiMail />
                            {client.email}
                          </ContactItem>
                        )}
                      </ClientContact>
                    </ClientInfo>
                  </ClientHeader>

                  <ClientStats>
                    <StatItem>
                      <StatValue color="#6366f1">
                        {client.total_visits || 0}
                      </StatValue>
                      <StatLabel>Wizyt</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue color="#10b981">
                        {(parseFloat(client.total_spent) || 0).toFixed(2)} zł
                      </StatValue>
                      <StatLabel>Wydała</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue color="#8b5cf6">
                        {formatDate(client.last_visit_date)}
                      </StatValue>
                      <StatLabel>Ostatnia wizyta</StatLabel>
                    </StatItem>
                  </ClientStats>
                </ClientCard>
              </motion.div>
            ))}
          </ClientsList>
        ) : (
          <EmptyState>
            <FiUsers />
            <p>Nie znaleziono klientek</p>
            {searchTerm && (
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Spróbuj zmienić kryteria wyszukiwania
              </p>
            )}
          </EmptyState>
        )}
      </ResponsiveContainer>
      <Navigation />

      <AnimatePresence>
        {selectedClient && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedClient(null)}
          >
            <Modal
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>{selectedClient.full_name}</ModalTitle>
                <CloseButton onClick={() => setSelectedClient(null)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <ModalContent>
                {clientDetails && (
                  <Section>
                    <SectionTitle>
                      <FiFileText />
                      Informacje
                    </SectionTitle>
                    <ClientContact>
                      {clientDetails.phone && (
                        <ContactItem>
                          <FiPhone />
                          {clientDetails.phone}
                        </ContactItem>
                      )}
                      {clientDetails.email && (
                        <ContactItem>
                          <FiMail />
                          {clientDetails.email}
                        </ContactItem>
                      )}
                    </ClientContact>
                    {clientDetails.notes && (
                      <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <strong>Notatki:</strong> {clientDetails.notes}
                      </div>
                    )}
                  </Section>
                )}

                <Section>
                  <SectionTitle>
                    <FiDollarSign />
                    Podsumowanie
                  </SectionTitle>
                  <ClientStats>
                    <StatItem>
                      <StatValue color="#6366f1">
                        {selectedClient.total_visits || 0}
                      </StatValue>
                      <StatLabel>Wizyt</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue color="#10b981">
                        {(parseFloat(selectedClient.total_spent) || 0).toFixed(2)} zł
                      </StatValue>
                      <StatLabel>Łącznie wydała</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue color="#8b5cf6">
                        {selectedClient.total_visits > 0
                          ? ((parseFloat(selectedClient.total_spent) || 0) / selectedClient.total_visits).toFixed(2)
                          : '0.00'} zł
                      </StatValue>
                      <StatLabel>Średnio za wizytę</StatLabel>
                    </StatItem>
                  </ClientStats>
                </Section>

                <Section>
                  <SectionTitle>
                    <FiCalendar />
                    Historia wizyt ({transactions?.length || 0})
                  </SectionTitle>

                  {transactionsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      Ładowanie historii...
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <TransactionsList>
                      {transactions.map((transaction, index) => (
                        <TransactionItem key={index}>
                          <TransactionHeader>
                            <TransactionDate>
                              <FiCalendar />
                              {formatDate(transaction.date)}
                            </TransactionDate>
                            <TransactionAmount>
                              {(parseFloat(transaction.amount) || 0).toFixed(2)} zł
                            </TransactionAmount>
                          </TransactionHeader>

                          {transaction.payments && transaction.payments.length > 0 && (
                            <PaymentMethods>
                              {transaction.payments.map((payment, idx) => (
                                <span key={idx}>
                                  {getPaymentMethodLabel(payment.method)}: {(parseFloat(payment.amount) || 0).toFixed(2)} zł
                                  {idx < transaction.payments.length - 1 && ' | '}
                                </span>
                              ))}
                            </PaymentMethods>
                          )}

                          {transaction.notes && (
                            <TransactionNotes>
                              📝 {transaction.notes}
                            </TransactionNotes>
                          )}
                        </TransactionItem>
                      ))}
                    </TransactionsList>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      Brak historii wizyt
                    </div>
                  )}
                </Section>
              </ModalContent>
            </Modal>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </ClientsContainer>
  )
}

export default Clients
