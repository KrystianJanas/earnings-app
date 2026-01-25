import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUsers, FiSearch, FiX, FiCalendar, FiDollarSign, FiPhone, FiMail, FiFileText, FiPlus, FiEdit3, FiTrash2, FiSave, FiEye, FiEyeOff } from 'react-icons/fi'
import { clientsAPI } from '../services/api'
import { Button, Input, Label, media } from '../styles/theme'

const ClientsContainer = styled.div`
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
    display: flex;
    align-items: center;
    gap: 12px;

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

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AddClientButton = styled(Button)`
  background: ${({ theme }) => theme.colors.success};
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.success}dd;
  }
`

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SearchInput = styled(Input)`
  padding-left: 44px;
`

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  pointer-events: none;
`

const ClearButton = styled.button`
  position: absolute;
  right: 16px;
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
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ClientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const ClientCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ClientInfo = styled.div`
  flex: 1;
`

const ClientName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  margin-bottom: 4px;
`

const ClientContact = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`

const ClientStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
`

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`

const ClientActions = styled.div`
  display: flex;
  gap: 8px;
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

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.xl};
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
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

const Clients = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
  })

  const { data: clientsData, isLoading, error } = useQuery(
    ['clients'],
    () => clientsAPI.getAll().then(res => res.data),
    { refetchOnMount: true }
  )

  const addClientMutation = useMutation(
    (data) => clientsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients'])
        setShowAddModal(false)
        resetForm()
      }
    }
  )

  const updateClientMutation = useMutation(
    ({ id, data }) => clientsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients'])
        setShowEditModal(false)
        setSelectedClient(null)
        resetForm()
      }
    }
  )

  const deleteClientMutation = useMutation(
    (id) => clientsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients'])
      }
    }
  )

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      notes: '',
    })
  }

  const handleEdit = (client, e) => {
    e.stopPropagation()
    setSelectedClient(client)
    setFormData({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
    })
    setShowEditModal(true)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      deleteClientMutation.mutate(id)
    }
  }

  const handleSubmitAdd = (e) => {
    e.preventDefault()
    addClientMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
    })
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    updateClientMutation.mutate({
      id: selectedClient.id,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
      }
    })
  }

  const clients = clientsData?.clients || []
  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <ClientsContainer>
        <PageHeader>
          <h1><FiUsers /> Klienci</h1>
        </PageHeader>
        <LoadingContainer>Ładowanie klientów...</LoadingContainer>
      </ClientsContainer>
    )
  }

  if (error) {
    return (
      <ClientsContainer>
        <PageHeader>
          <h1><FiUsers /> Klienci</h1>
        </PageHeader>
        <ErrorContainer>
          <p>Nie udało się załadować listy klientów</p>
        </ErrorContainer>
      </ClientsContainer>
    )
  }

  return (
    <ClientsContainer>
      <PageHeader>
        <h1><FiUsers /> Klienci</h1>
        <p>Zarządzaj swoimi klientami</p>
      </PageHeader>

      <HeaderActions>
        <AddClientButton onClick={() => setShowAddModal(true)}>
          <FiPlus />
          Dodaj klienta
        </AddClientButton>
      </HeaderActions>

      <SearchWrapper>
        <SearchIcon>
          <FiSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Szukaj klienta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <ClearButton onClick={() => setSearchQuery('')}>
            <FiX />
          </ClearButton>
        )}
      </SearchWrapper>

      {filteredClients.length === 0 ? (
        <EmptyState>
          <FiUsers />
          <h3>Brak klientów</h3>
          <p>Dodaj swojego pierwszego klienta, aby rozpocząć</p>
        </EmptyState>
      ) : (
        <ClientsList>
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ClientHeader>
                <ClientInfo>
                  <ClientName>
                    {client.firstName} {client.lastName}
                  </ClientName>
                  <ClientContact>
                    {client.phone && (
                      <span><FiPhone size={14} /> {client.phone}</span>
                    )}
                    {client.email && (
                      <span><FiMail size={14} /> {client.email}</span>
                    )}
                  </ClientContact>
                </ClientInfo>
                <ClientActions>
                  <ActionButton onClick={(e) => handleEdit(client, e)}>
                    <FiEdit3 size={16} />
                  </ActionButton>
                  <ActionButton onClick={(e) => handleDelete(client.id, e)}>
                    <FiTrash2 size={16} />
                  </ActionButton>
                </ClientActions>
              </ClientHeader>

              <ClientStats>
                <StatItem>
                  <StatValue $color="#8B5CF6">{client.totalVisits || 0}</StatValue>
                  <StatLabel>Wizyty</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue $color="#10B981">{(client.totalSpent || 0).toFixed(0)} zł</StatValue>
                  <StatLabel>Wydane</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue $color="#F59E0B">
                    {client.lastVisit 
                      ? new Date(client.lastVisit).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
                      : '-'
                    }
                  </StatValue>
                  <StatLabel>Ostatnia wizyta</StatLabel>
                </StatItem>
              </ClientStats>
            </ClientCard>
          ))}
        </ClientsList>
      )}

      <AnimatePresence>
        {showAddModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Dodaj klienta</ModalTitle>
                <CloseButton onClick={() => setShowAddModal(false)}>
                  <FiX size={20} />
                </CloseButton>
              </ModalHeader>
              
              <Form onSubmit={handleSubmitAdd}>
                <FormGroup>
                  <Label>Imię</Label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Imię klienta"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Nazwisko</Label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Nazwisko klienta"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Telefon</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+48 123 456 789"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Notatki</Label>
                  <TextArea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Dodatkowe informacje o klientce..."
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button type="button" $variant="secondary" onClick={() => setShowAddModal(false)}>
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={addClientMutation.isLoading}>
                    <FiSave />
                    {addClientMutation.isLoading ? 'Zapisywanie...' : 'Zapisz'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && selectedClient && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Edytuj klienta</ModalTitle>
                <CloseButton onClick={() => setShowEditModal(false)}>
                  <FiX size={20} />
                </CloseButton>
              </ModalHeader>
              
              <Form onSubmit={handleSubmitEdit}>
                <FormGroup>
                  <Label>Imię</Label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Imię klienta"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Nazwisko</Label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Nazwisko klienta"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Telefon</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+48 123 456 789"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Notatki</Label>
                  <TextArea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Dodatkowe informacje o klientce..."
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button type="button" $variant="secondary" onClick={() => setShowEditModal(false)}>
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={updateClientMutation.isLoading}>
                    <FiSave />
                    {updateClientMutation.isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </ClientsContainer>
  )
}

export default Clients
