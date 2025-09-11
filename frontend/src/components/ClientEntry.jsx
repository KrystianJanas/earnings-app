import React from 'react'
import styled from 'styled-components'
import { FiDollarSign, FiCreditCard, FiTrash2, FiUser } from 'react-icons/fi'
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
  justify-content: between;
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
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const AmountInputWrapper = styled.div`
  position: relative;
  flex: 2;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 1rem;
  }

  input {
    padding-left: 35px;
  }
`

const PaymentMethodWrapper = styled.div`
  flex: 1;
`

const PaymentMethodSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
          Klientka #{index + 1}
        </ClientNumber>
        {canRemove && (
          <RemoveButton type="button" onClick={() => onRemove(index)}>
            <FiTrash2 size={14} />
          </RemoveButton>
        )}
      </ClientHeader>

      <FormRow>
        <AmountInputWrapper>
          <Label htmlFor={`client-amount-${index}`}>Kwota</Label>
          <FiDollarSign />
          <Input
            id={`client-amount-${index}`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={client.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
          />
        </AmountInputWrapper>

        <PaymentMethodWrapper>
          <Label htmlFor={`client-payment-${index}`}>Płatność</Label>
          <PaymentMethodSelect
            id={`client-payment-${index}`}
            value={client.paymentMethod || 'cash'}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
          >
            <option value="cash">Gotówka</option>
            <option value="card">Karta</option>
          </PaymentMethodSelect>
        </PaymentMethodWrapper>
      </FormRow>

      <div>
        <Label htmlFor={`client-notes-${index}`}>Notatki (opcjonalne)</Label>
        <NotesInput
          id={`client-notes-${index}`}
          type="text"
          placeholder="np. fryzura, koloryzacja..."
          value={client.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
    </ClientCard>
  )
}

export default ClientEntry