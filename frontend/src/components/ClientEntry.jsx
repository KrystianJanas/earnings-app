import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { FiCreditCard, FiTrash2, FiUser, FiPlus, FiMinus, FiSearch, FiX } from 'react-icons/fi'
import { Input, Label, Button, media } from '../styles/theme'
import { servicesAPI } from '../services/api'

const ClientCard = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  ${media.md`
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  `}
`

const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ClientNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
`

const RemoveButton = styled(Button)`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 8px 12px;
  font-size: 0.8rem;

  &:hover {
    background: ${({ theme }) => theme.colors.error}dd;
  }
`

const PaymentsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  
  ${media.md`
    margin-bottom: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.md};
  `}
`

const PaymentEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  
  ${media.md`
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `}
`

const AmountInputWrapper = styled.div`
  width: 100%;
`

const AmountInput = styled(Input)`
  width: 100%;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 14px 16px;
  text-align: center;
`

const PaymentMethodWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`

const PaymentMethodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const PaymentButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;

  ${media.md`
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  `}
`

const PaymentButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 10px;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $active, theme }) => $active 
    ? theme.colors.gradient.primary
    : theme.colors.cardBg};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text.secondary};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px;
  box-shadow: ${({ $active, theme }) => $active ? theme.shadows.button : theme.shadows.xs};

  ${media.md`
    flex-direction: row;
    padding: 12px 14px;
    font-size: 0.8rem;
    min-height: 48px;
    gap: 6px;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ $active, theme }) => $active 
      ? undefined
      : theme.colors.surfaceHover};
    transform: translateY(-1px);
  }
`

const PaymentControlsWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const PaymentControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $variant }) =>
    $variant === 'add' ? theme.colors.success : theme.colors.error};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 0.85rem;
  }
`

const TotalAmountDisplay = styled.div`
  padding: 10px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ClientSearchWrapper = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ClientSearchInput = styled(Input)`
  padding-left: 44px;
  padding-top: 14px;
  padding-bottom: 14px;
  font-size: 1rem;
  font-weight: 500;
`

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  pointer-events: none;
  margin-top: 12px;
`

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`

const SearchResultItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background-color 0.2s ease;

  &:hover, &.highlighted {
    background: ${({ theme }) => theme.colors.primaryLight};
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

const ServicesSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SelectedServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const SelectedServiceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
`

const ServiceNameText = styled.span`
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`

const ServicePriceText = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
  margin: 0 8px;
`

const RemoveServiceButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`

const ServiceSearchWrapper = styled.div`
  position: relative;
`

const ServiceSearchInput = styled(Input)`
  font-size: 0.95rem;
  padding: 10px 14px;
`

const ServiceDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  max-height: 180px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`

const ServiceOption = styled.div`
  padding: 10px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
  }

  &:last-child {
    border-bottom: none;
  }
`

const ServiceOptionPrice = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
  font-size: 0.85rem;
`

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Gotówka', icon: '💵' },
  { value: 'card', label: 'Karta', icon: '💳' },
  { value: 'blik', label: 'BLIK', icon: '📱' },
  { value: 'prepaid', label: 'Przedpłata', icon: '💰' },
  { value: 'transfer', label: 'Przelew', icon: '🏦' },
  { value: 'free', label: 'Gratis', icon: '🎁' }
]

const ClientEntry = ({ client, index, onUpdate, onRemove }) => {
  const [searchTerm, setSearchTerm] = useState(client.clientName || '')
  const [showResults, setShowResults] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef(null)
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [showServiceResults, setShowServiceResults] = useState(false)
  const serviceSearchRef = useRef(null)

  const { data: searchResults = [] } = useQuery(
    ['clientSearch', searchTerm],
    () => {
      if (!searchTerm || searchTerm.length < 2) return []
      return fetch(`/api/clients/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()).catch(() => [])
    },
    {
      enabled: searchTerm.length >= 2,
      staleTime: 5 * 60 * 1000,
    }
  )

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowResults(value.length >= 2)
    setHighlightedIndex(-1)
    
    onUpdate({
      ...client,
      clientName: value
    })
  }

  const handleClientSelect = (selectedClient) => {
    setSearchTerm(selectedClient.full_name)
    setShowResults(false)
    setHighlightedIndex(-1)
    
    onUpdate({
      ...client,
      clientName: selectedClient.full_name,
      clientId: selectedClient.id,
      clientPhone: selectedClient.phone,
      clientEmail: selectedClient.email
    })
  }

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
    
    onUpdate({
      ...client,
      payments: updatedPayments,
      amount: totalAmount
    })
  }

  const addPayment = () => {
    const updatedPayments = [...payments, { amount: 0, method: 'cash' }]
    onUpdate({
      ...client,
      payments: updatedPayments
    })
  }

  const removePayment = (paymentIndex) => {
    if (payments.length > 1) {
      const updatedPayments = payments.filter((_, i) => i !== paymentIndex)
      const totalAmount = updatedPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
      
      onUpdate({
        ...client,
        payments: updatedPayments,
        amount: totalAmount
      })
    }
  }

  // Services
  const { data: availableServices = [] } = useQuery(
    ['services'],
    () => servicesAPI.getAll().then(res => res.data),
    { staleTime: 5 * 60 * 1000 }
  )

  const filteredServices = availableServices.filter(s =>
    s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) &&
    !(client.services || []).some(cs => cs.serviceId === s.id)
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceSearchRef.current && !serviceSearchRef.current.contains(event.target)) {
        setShowServiceResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addService = (service) => {
    const newServices = [...(client.services || []), {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: parseFloat(service.price),
      overridePrice: null
    }]

    const totalFromServices = newServices.reduce(
      (sum, s) => sum + parseFloat(s.overridePrice ?? s.servicePrice), 0
    )

    const updatedPayments = [...payments]
    if (updatedPayments.length === 1) {
      updatedPayments[0] = { ...updatedPayments[0], amount: totalFromServices }
    }

    onUpdate({
      ...client,
      services: newServices,
      payments: updatedPayments,
      amount: totalFromServices
    })

    setServiceSearchTerm('')
    setShowServiceResults(false)
  }

  const removeService = (serviceIndex) => {
    const newServices = (client.services || []).filter((_, i) => i !== serviceIndex)
    const totalFromServices = newServices.reduce(
      (sum, s) => sum + parseFloat(s.overridePrice ?? s.servicePrice), 0
    )

    const updatedPayments = [...payments]
    if (updatedPayments.length === 1) {
      updatedPayments[0] = { ...updatedPayments[0], amount: totalFromServices }
    }

    onUpdate({
      ...client,
      services: newServices,
      payments: updatedPayments,
      amount: totalFromServices
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
        <RemoveButton type="button" onClick={onRemove}>
          <FiTrash2 size={14} />
        </RemoveButton>
      </ClientHeader>

      <ClientSearchWrapper ref={searchRef}>
        <Label htmlFor={`client-${index}-search`}>Imię i Nazwisko</Label>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <ClientSearchInput
          id={`client-${index}-search`}
          type="text"
          placeholder="Wpisz imię klienta..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {showResults && (
          <SearchResults>
            {searchResults.length > 0 ? (
              searchResults.map((result, resultIndex) => (
                <SearchResultItem
                  key={result.id}
                  className={highlightedIndex === resultIndex ? 'highlighted' : ''}
                  onClick={() => handleClientSelect(result)}
                >
                  <ClientName>#{result.id} - {result.full_name}</ClientName>
                  <ClientInfo>
                    {result.phone && `Tel: ${result.phone}`}
                    {result.last_visit_date && ` • Ostatnia wizyta: ${new Date(result.last_visit_date).toLocaleDateString('pl-PL')}`}
                    {result.total_visits > 0 && ` • Wizyty: ${result.total_visits}`}
                  </ClientInfo>
                </SearchResultItem>
              ))
            ) : (
              <NoResults>
                Brak wyników. Wpisz więcej liter lub dodaj nowego klienta.
              </NoResults>
            )}
          </SearchResults>
        )}
      </ClientSearchWrapper>

      <ServicesSection>
        <Label>Usługi</Label>
        {(client.services || []).length > 0 && (
          <SelectedServicesList>
            {(client.services || []).map((service, serviceIndex) => (
              <SelectedServiceRow key={serviceIndex}>
                <ServiceNameText>{service.serviceName}</ServiceNameText>
                <ServicePriceText>
                  {parseFloat(service.overridePrice ?? service.servicePrice).toFixed(2)} zł
                </ServicePriceText>
                <RemoveServiceButton type="button" onClick={() => removeService(serviceIndex)}>
                  <FiX size={14} />
                </RemoveServiceButton>
              </SelectedServiceRow>
            ))}
          </SelectedServicesList>
        )}
        <ServiceSearchWrapper ref={serviceSearchRef}>
          <ServiceSearchInput
            type="text"
            placeholder="Wyszukaj usługę..."
            value={serviceSearchTerm}
            onChange={(e) => {
              setServiceSearchTerm(e.target.value)
              setShowServiceResults(e.target.value.length > 0)
            }}
            onFocus={() => {
              if (serviceSearchTerm.length > 0 || availableServices.length > 0) {
                setShowServiceResults(true)
              }
            }}
          />
          {showServiceResults && filteredServices.length > 0 && (
            <ServiceDropdown>
              {filteredServices.map((service) => (
                <ServiceOption key={service.id} onClick={() => addService(service)}>
                  <span>{service.name}</span>
                  <ServiceOptionPrice>{parseFloat(service.price).toFixed(2)} zł</ServiceOptionPrice>
                </ServiceOption>
              ))}
            </ServiceDropdown>
          )}
        </ServiceSearchWrapper>
      </ServicesSection>

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
                    $variant="add"
                    onClick={addPayment}
                    title="Dodaj płatność"
                  >
                    <FiPlus />
                  </PaymentControlButton>
                  {payments.length > 1 && (
                    <PaymentControlButton
                      type="button"
                      $variant="remove"
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
                    $active={payment.method === method.value}
                    onClick={() => handlePaymentChange(paymentIndex, 'method', method.value)}
                  >
                    {method.icon} {method.label}
                  </PaymentButton>
                ))}
              </PaymentButtons>
            </PaymentMethodWrapper>
          </PaymentEntry>
        ))}
      </PaymentsSection>
    </ClientCard>
  )
}

export default ClientEntry
