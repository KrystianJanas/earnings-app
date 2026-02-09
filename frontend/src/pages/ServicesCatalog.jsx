import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiList, FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiRefreshCw, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi'
import { servicesAPI } from '../services/api'
import { Button, Input, Label, media } from '../styles/theme'

const Container = styled.div`
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
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }

    ${media.lg`
      font-size: 1.875rem;
    `}
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.95rem;
  }
`

const Message = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 500;
  text-align: center;
  background: ${({ $type, theme }) => $type === 'error' ? theme.colors.errorLight : theme.colors.successLight};
  color: ${({ $type, theme }) => $type === 'error' ? theme.colors.error : theme.colors.success};
`

const AddForm = styled.form`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-end;
  flex-wrap: wrap;
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 150px;
`

const PriceInput = styled(Input)`
  max-width: 150px;
`

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const ServiceCard = styled(motion.div)`
  background: ${({ theme, $inactive }) => $inactive ? theme.colors.surface : theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme, $inactive }) => $inactive ? theme.colors.borderLight : theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  opacity: ${({ $inactive }) => $inactive ? 0.6 : 1};
`

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const ServiceInfo = styled.div`
  flex: 1;
`

const ServiceName = styled.div`
  font-weight: 600;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.text.primary};
`

const ServicePrice = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
  margin-top: 4px;
`

const InactiveLabel = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-left: 8px;
  font-weight: 500;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 8px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const EditForm = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  flex-wrap: wrap;
`

const EditInput = styled(Input)`
  flex: 1;
  min-width: 120px;
`

const EditPriceInput = styled(Input)`
  width: 120px;
`

const HistoryToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px 0;
  margin-top: ${({ theme }) => theme.spacing.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const HistoryList = styled(motion.div)`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  }
`

const HistoryPrice = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 8px;
  }
`

const ServicesCatalog = () => {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [expandedHistory, setExpandedHistory] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: services = [], isLoading } = useQuery(
    ['services'],
    () => servicesAPI.getAll().then(res => res.data),
    { refetchOnMount: true }
  )

  const { data: priceHistory = [] } = useQuery(
    ['priceHistory', expandedHistory],
    () => servicesAPI.getPriceHistory(expandedHistory).then(res => res.data),
    { enabled: !!expandedHistory }
  )

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const showError = (msg) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(''), 3000)
  }

  const createMutation = useMutation(
    (data) => servicesAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services'])
        setNewName('')
        setNewPrice('')
        showSuccess('Usługa została dodana')
      },
      onError: (error) => {
        showError(error.response?.data?.error || 'Błąd podczas dodawania usługi')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => servicesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services'])
        queryClient.invalidateQueries(['priceHistory'])
        setEditingId(null)
        showSuccess('Usługa została zaktualizowana')
      },
      onError: (error) => {
        showError(error.response?.data?.error || 'Błąd podczas aktualizacji')
      }
    }
  )

  const deactivateMutation = useMutation(
    (id) => servicesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services'])
        showSuccess('Usługa została dezaktywowana')
      }
    }
  )

  const activateMutation = useMutation(
    (id) => servicesAPI.activate(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services'])
        showSuccess('Usługa została aktywowana')
      }
    }
  )

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim() || !newPrice) return
    createMutation.mutate({
      name: newName.trim(),
      price: parseFloat(newPrice)
    })
  }

  const startEdit = (service) => {
    setEditingId(service.id)
    setEditName(service.name)
    setEditPrice(service.price.toString())
  }

  const handleUpdate = () => {
    if (!editName.trim() || !editPrice) return
    updateMutation.mutate({
      id: editingId,
      data: {
        name: editName.trim(),
        price: parseFloat(editPrice)
      }
    })
  }

  const toggleHistory = (serviceId) => {
    setExpandedHistory(expandedHistory === serviceId ? null : serviceId)
  }

  if (isLoading) {
    return (
      <Container>
        <PageHeader>
          <h1><FiList /> Katalog usług</h1>
        </PageHeader>
        <LoadingContainer>Ładowanie usług...</LoadingContainer>
      </Container>
    )
  }

  return (
    <Container>
      <PageHeader>
        <h1><FiList /> Katalog usług</h1>
        <p>Zarządzaj usługami i cenami</p>
      </PageHeader>

      <AnimatePresence>
        {successMessage && (
          <Message
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {successMessage}
          </Message>
        )}
        {errorMessage && (
          <Message
            $type="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {errorMessage}
          </Message>
        )}
      </AnimatePresence>

      <AddForm onSubmit={handleAdd}>
        <FormField>
          <Label>Nazwa usługi</Label>
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="np. Manicure"
            required
          />
        </FormField>
        <FormField>
          <Label>Cena (zł)</Label>
          <PriceInput
            type="number"
            step="0.01"
            min="0"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </FormField>
        <Button type="submit" disabled={createMutation.isLoading}>
          <FiPlus />
          {createMutation.isLoading ? 'Dodawanie...' : 'Dodaj usługę'}
        </Button>
      </AddForm>

      {services.length === 0 ? (
        <EmptyState>
          <FiList />
          <h3>Brak usług</h3>
          <p>Dodaj pierwszą usługę, aby rozpocząć</p>
        </EmptyState>
      ) : (
        <ServicesList>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              $inactive={!service.is_active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ServiceHeader>
                <ServiceInfo>
                  <ServiceName>
                    {service.name}
                    {!service.is_active && <InactiveLabel>Nieaktywna</InactiveLabel>}
                  </ServiceName>
                  <ServicePrice>{parseFloat(service.price).toFixed(2)} zł</ServicePrice>
                </ServiceInfo>
                <Actions>
                  <ActionButton onClick={() => startEdit(service)} title="Edytuj">
                    <FiEdit3 size={16} />
                  </ActionButton>
                  {service.is_active ? (
                    <ActionButton onClick={() => deactivateMutation.mutate(service.id)} title="Dezaktywuj">
                      <FiTrash2 size={16} />
                    </ActionButton>
                  ) : (
                    <ActionButton onClick={() => activateMutation.mutate(service.id)} title="Aktywuj">
                      <FiRefreshCw size={16} />
                    </ActionButton>
                  )}
                </Actions>
              </ServiceHeader>

              {editingId === service.id && (
                <EditForm>
                  <EditInput
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nazwa usługi"
                  />
                  <EditPriceInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Cena"
                  />
                  <ActionButton onClick={handleUpdate} title="Zapisz">
                    <FiCheck size={16} />
                  </ActionButton>
                  <ActionButton onClick={() => setEditingId(null)} title="Anuluj">
                    <FiX size={16} />
                  </ActionButton>
                </EditForm>
              )}

              <HistoryToggle onClick={() => toggleHistory(service.id)}>
                {expandedHistory === service.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                Historia cen
              </HistoryToggle>

              <AnimatePresence>
                {expandedHistory === service.id && (
                  <HistoryList
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {priceHistory.length > 0 ? (
                      priceHistory.map((entry) => (
                        <HistoryItem key={entry.id}>
                          <span>
                            {new Date(entry.changed_at).toLocaleDateString('pl-PL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <HistoryPrice>{parseFloat(entry.price).toFixed(2)} zł</HistoryPrice>
                        </HistoryItem>
                      ))
                    ) : (
                      <HistoryItem>
                        <span>Brak historii zmian cen</span>
                      </HistoryItem>
                    )}
                  </HistoryList>
                )}
              </AnimatePresence>
            </ServiceCard>
          ))}
        </ServicesList>
      )}
    </Container>
  )
}

export default ServicesCatalog
