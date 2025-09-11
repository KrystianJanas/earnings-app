import React from 'react'
import styled from 'styled-components'
import { FiCreditCard, FiTrash2, FiUser } from 'react-icons/fi'
import { Input, Label, Button } from '../styles/theme'

const ClientCard = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (min-width: 640px) {
    flex-direction: row;
  }
`

const AmountInputWrapper = styled.div`
  flex: 1;

  @media (min-width: 640px) {
    flex: 2;
  }
`

const AmountInput = styled(Input)`
  width: 100%;
  font-size: 1.1rem;
  font-weight: 500;
`

const PaymentMethodWrapper = styled.div`
  flex: 1;
`

const PaymentButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const PaymentButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const NotesInput = styled(Input)`
  font-size: 0.9rem;
`

const ClientEntry = ({ client, index, onChange, onRemove, canRemove }) => {
  const handleChange = (field, value) => {
    onChange(index, {
      ...client,
      [field]: value
    })
  }

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

      <FormRow>
        <AmountInputWrapper>
          <Label htmlFor={`client-amount-${index}`}>Kwota (zł)</Label>
          <AmountInput
            id={`client-amount-${index}`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={client.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
          />
        </AmountInputWrapper>

        <PaymentMethodWrapper>
          <Label>Płatność</Label>
          <PaymentButtons>
            <PaymentButton
              type="button"
              active={client.paymentMethod === 'cash'}
              onClick={() => handleChange('paymentMethod', 'cash')}
            >
              💵 Gotówka
            </PaymentButton>
            <PaymentButton
              type="button"
              active={client.paymentMethod === 'card'}
              onClick={() => handleChange('paymentMethod', 'card')}
            >
              <FiCreditCard /> Karta
            </PaymentButton>
          </PaymentButtons>
        </PaymentMethodWrapper>
      </FormRow>

      <div>
        <Label htmlFor={`client-notes-${index}`}>Notatki (opcjonalne)</Label>
        <NotesInput
          id={`client-notes-${index}`}
          type="text"
          placeholder="np. manicure, pedicure..."
          value={client.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
    </ClientCard>
  )
}

export default ClientEntry