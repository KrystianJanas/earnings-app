import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { FiCreditCard, FiTrash2, FiUser, FiPlus, FiMinus, FiSearch } from 'react-icons/fi'
import { Input, Label, Button } from '../styles/theme'

const ClientCard = styled.div`
  padding: 10px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (min-width: 640px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  @media (min-width: 640px) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`

const ClientNumber = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
`

const RemoveButton = styled(Button)`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: 0.8rem;
  margin-left: auto;

  &:hover {
    background: ${({ theme }) => theme.colors.error}dd;
  }
`

const PaymentsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  @media (min-width: 640px) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`

const PaymentEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  padding: 10px;
  background: ${({ theme }) => theme.colors.background}80;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border}50;

  @media (min-width: 640px) {
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`

const AmountInputWrapper = styled.div`
  width: 100%;
`

const AmountInput = styled(Input)`
  width: 100%;
  font-size: 0.9rem;
  font-weight: 500;
  height: 36px;

  @media (min-width: 640px) {
    font-size: 1rem;
    height: 40px;
  }
`

const PaymentMethodWrapper = styled.div`
  width: 100%;
`

const PaymentMethodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`

const PaymentButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: 4px;
  overflow: visible;
  width: 100%;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
    margin-top: ${({ theme }) => theme.spacing.xs};
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const PaymentButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 38px;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 640px) {
    padding: 12px 8px;
    font-size: 0.85rem;
    gap: 5px;
    min-height: 48px;
  }

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const PaymentControlsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
`

const PaymentControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme, variant }) =>
    variant === 'add' ? theme.colors.success : theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, variant }) =>
    variant === 'add' ? theme.colors.success : theme.colors.error};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 0.75rem;
  }
`

const TotalAmountDisplay = styled.div`
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ClientSearchWrapper = styled.div`
  position: relative;
  margin-bottom: 8px;

  @media (min-width: 640px) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`

const ClientSearchInput = styled(Input)`
  padding-left: 2.5rem;
  font-weight: 500;
  height: 36px;
  font-size: 0.9rem;

  @media (min-width: 640px) {
    height: 40px;
    font-size: 1rem;
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 30px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;

  @media (min-width: 640px) {
    font-size: 1rem;
    left: ${({ theme }) => theme.spacing.sm};
    height: 40px;
  }
`

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`

const SearchResultItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}20;
  transition: background-color 0.2s ease;

  &:hover, &.highlighted {
    background: ${({ theme }) => theme.colors.primary}10;
  }

  &:last-child {
    border-bottom: none;
  }
`

const ClientName = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
`

const ClientInfo = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`

const NoResults = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  text-align: center;
`

const NotesInput = styled(Input)`
  font-size: 0.9rem;
  height: 36px;

  @media (min-width: 640px) {
    font-size: 1rem;
    height: 40px;
  }
`

const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 Gotówka', icon: '💵' },
  { value: 'card', label: '💳 Karta', icon: <FiCreditCard /> },
  { value: 'blik', label: '📱 BLIK', icon: '📱' },
  { value: 'prepaid', label: '💰 Przedpłata', icon: '💰' },
  { value: 'transfer', label: '🏦 Przelew', icon: '🏦' },
  { value: 'free', label: '🎁 Gratis', icon: '🎁' }
]

const ClientEntry = ({ client, index, onChange, onRemove, canRemove }) => {
  const [searchTerm, setSearchTerm] = useState(client.clientName || '')
  const [showResults, setShowResults] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  // Search for clients
  const { data: searchResults = [] } = useQuery(
    ['clientSearch', searchTerm],
    () => {
      if (!searchTerm || searchTerm.length < 2) return []
      // This will be implemented when we add the API endpoint
      return fetch(`/api/clients/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()).catch(() => [])
    },
    {
      enabled: searchTerm.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowResults(value.length >= 2)
    setHighlightedIndex(-1)
    
    // Update client name in parent component
    onChange(index, {
      ...client,
      clientName: value
    })
  }

  // Handle client selection from search results
  const handleClientSelect = (selectedClient) => {
    setSearchTerm(selectedClient.full_name)
    setShowResults(false)
    setHighlightedIndex(-1)
    
    onChange(index, {
      ...client,
      clientName: selectedClient.full_name,
      clientId: selectedClient.id,
      clientPhone: selectedClient.phone,
      clientEmail: selectedClient.email
    })
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          handleClientSelect(searchResults[highlightedIndex])
        }
        break
      case 'Escape':
        setShowResults(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initialize payments structure for backward compatibility
  const payments = client.payments || (client.paymentMethod ? 
    [{ amount: client.amount || 0, method: client.paymentMethod }] : 
    [{ amount: 0, method: 'cash' }]
  )

  const handlePaymentChange = (paymentIndex, field, value) => {
    const updatedPayments = [...payments]
    updatedPayments[paymentIndex] = {
      ...updatedPayments[paymentIndex],
      [field]: value
    }
    
    const totalAmount = updatedPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
    
    onChange(index, {
      ...client,
      payments: updatedPayments,
      amount: totalAmount // Keep total for backward compatibility
    })
  }

  const addPayment = () => {
    const updatedPayments = [...payments, { amount: 0, method: 'cash' }]
    onChange(index, {
      ...client,
      payments: updatedPayments
    })
  }

  const removePayment = (paymentIndex) => {
    if (payments.length > 1) {
      const updatedPayments = payments.filter((_, i) => i !== paymentIndex)
      const totalAmount = updatedPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
      
      onChange(index, {
        ...client,
        payments: updatedPayments,
        amount: totalAmount
      })
    }
  }

  const handleNotesChange = (value) => {
    onChange(index, {
      ...client,
      notes: value
    })
  }

  const totalAmount = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)

  return (
    <ClientCard>
      <ClientHeader>
        <ClientNumber>
          <FiUser size={16} />
          Klient #{index + 1}
        </ClientNumber>
        {canRemove && (
          <RemoveButton type="button" onClick={() => onRemove(index)}>
            <FiTrash2 size={14} />
          </RemoveButton>
        )}
      </ClientHeader>

      <ClientSearchWrapper ref={searchRef}>
        <Label htmlFor={`client-${index}-search`}>Imię i Nazwisko</Label>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <ClientSearchInput
          id={`client-${index}-search`}
          type="text"
          placeholder="Wpisz imię klientki..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {showResults && (
          <SearchResults ref={resultsRef}>
            {searchResults.length > 0 ? (
              searchResults.map((result, resultIndex) => (
                <SearchResultItem
                  key={result.id}
                  className={highlightedIndex === resultIndex ? 'highlighted' : ''}
                  onClick={() => handleClientSelect(result)}
                >
                  <ClientName>{result.full_name}</ClientName>
                  <ClientInfo>
                    {result.phone && `Tel: ${result.phone}`}
                    {result.last_visit_date && ` • Ostatnia wizyta: ${new Date(result.last_visit_date).toLocaleDateString('pl-PL')}`}
                    {result.total_visits > 0 && ` • Wizyty: ${result.total_visits}`}
                  </ClientInfo>
                </SearchResultItem>
              ))
            ) : (
              <NoResults>
                Brak wyników. Wpisz więcej liter lub dodaj nową klientkę.
              </NoResults>
            )}
          </SearchResults>
        )}
      </ClientSearchWrapper>

      {totalAmount > 0 && (
        <TotalAmountDisplay>
          Łączna kwota: {totalAmount.toFixed(2)} zł
        </TotalAmountDisplay>
      )}

      <PaymentsSection>
        <Label>Płatności</Label>
        {payments.map((payment, paymentIndex) => (
          <PaymentEntry key={paymentIndex}>
            <AmountInputWrapper>
              <Label htmlFor={`client-${index}-payment-${paymentIndex}-amount`}>Kwota (zł)</Label>
              <AmountInput
                id={`client-${index}-payment-${paymentIndex}-amount`}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={payment.amount || ''}
                onChange={(e) => handlePaymentChange(paymentIndex, 'amount', parseFloat(e.target.value) || 0)}
              />
            </AmountInputWrapper>

            <PaymentMethodWrapper>
              <PaymentMethodHeader>
                <Label style={{ marginBottom: 0 }}>Metoda płatności</Label>
                <PaymentControlsWrapper>
                  <PaymentControlButton
                    type="button"
                    variant="add"
                    onClick={addPayment}
                    title="Dodaj płatność"
                  >
                    <FiPlus />
                  </PaymentControlButton>
                  {payments.length > 1 && (
                    <PaymentControlButton
                      type="button"
                      variant="remove"
                      onClick={() => removePayment(paymentIndex)}
                      title="Usuń płatność"
                    >
                      <FiMinus />
                    </PaymentControlButton>
                  )}
                </PaymentControlsWrapper>
              </PaymentMethodHeader>
              <PaymentButtons>
                {PAYMENT_METHODS.map((method) => (
                  <PaymentButton
                    key={method.value}
                    type="button"
                    active={payment.method === method.value}
                    onClick={() => handlePaymentChange(paymentIndex, 'method', method.value)}
                  >
                    {method.icon} {
                      method.value === 'cash' ? 'Gotówka' :
                      method.value === 'card' ? 'Karta' :
                      method.value === 'blik' ? 'BLIK' :
                      method.value === 'prepaid' ? 'Przedpłata' :
                      method.value === 'transfer' ? 'Przelew' :
                      method.value === 'free' ? 'Gratis' : method.label.split(' ')[1]
                    }
                  </PaymentButton>
                ))}
              </PaymentButtons>
            </PaymentMethodWrapper>
          </PaymentEntry>
        ))}
      </PaymentsSection>

      <div>
        <Label htmlFor={`client-notes-${index}`}>Notatki (opcjonalne)</Label>
        <NotesInput
          id={`client-notes-${index}`}
          type="text"
          placeholder="np. manicure, pedicure..."
          value={client.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
      </div>
    </ClientCard>
  )
}

export default ClientEntry