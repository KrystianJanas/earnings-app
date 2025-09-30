import React, { useState } from 'react'
import styled from 'styled-components'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FiMail, FiCheck, FiX, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { invitationsAPI } from '../services/api'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  text-align: center;
`

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 2rem;
  font-size: 1rem;
`

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`

const CompanyButton = styled.button`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CompanyName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`

const CompanyRole = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: 1.5rem 0;
`

const CreateButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.errorLight};
  border-radius: 8px;
  font-size: 0.875rem;
`

const InvitationsSection = styled.div`
  margin: 1.5rem 0;
`

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const InvitationCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`

const InvitationInfo = styled.div`
  margin-bottom: 1rem;
`

const CompanyInfo = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.25rem;
`

const InvitationDate = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`

const InvitationActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const AcceptButton = styled(ActionButton)`
  background: ${props => props.theme.colors.success};
  color: white;

  &:hover:not(:disabled) {
    background: #059669;
  }
`

const DeclineButton = styled(ActionButton)`
  background: transparent;
  color: ${props => props.theme.colors.error};
  border: 1px solid ${props => props.theme.colors.error};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.error};
    color: white;
  }
`

const LogoutButton = styled.button`
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.text.secondary};
  }
`

const CompanySelector = ({ onCreateNew }) => {
  const { companies, switchCompany, needsCompanySetup, logout } = useAuth()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [processingInvitations, setProcessingInvitations] = useState({})

  console.log('🔍 CompanySelector render:', { 
    companies, 
    companiesLength: companies?.length, 
    needsCompanySetup 
  })

  const { data: invitations, isLoading: invitationsLoading } = useQuery(
    'myInvitations',
    () => invitationsAPI.getMyInvitations().then(res => res.data),
    {
      enabled: !needsCompanySetup // Only load if user has access to app
    }
  )

  const acceptInvitationMutation = useMutation(
    (token) => invitationsAPI.acceptInvitation(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myInvitations')
        // Reload company data to include newly joined company
        window.location.reload()
      },
      onError: (error) => {
        setError('Nie udało się zaakceptować zaproszenia.')
        console.error('Failed to accept invitation:', error)
      }
    }
  )

  const declineInvitationMutation = useMutation(
    (token) => invitationsAPI.declineInvitation(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myInvitations')
      },
      onError: (error) => {
        setError('Nie udało się odrzucić zaproszenia.')
        console.error('Failed to decline invitation:', error)
      }
    }
  )

  const handleCompanySelect = async (companyId) => {
    setIsLoading(true)
    setError('')
    
    try {
      const success = await switchCompany(companyId)
      if (!success) {
        setError('Nie udało się przełączyć firmy. Spróbuj ponownie.')
      }
    } catch (error) {
      setError('Wystąpił błąd podczas przełączania firmy.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptInvitation = (token) => {
    setProcessingInvitations(prev => ({ ...prev, [token]: 'accepting' }))
    acceptInvitationMutation.mutate(token, {
      onSettled: () => {
        setProcessingInvitations(prev => ({ ...prev, [token]: null }))
      }
    })
  }

  const handleDeclineInvitation = (token) => {
    setProcessingInvitations(prev => ({ ...prev, [token]: 'declining' }))
    declineInvitationMutation.mutate(token, {
      onSettled: () => {
        setProcessingInvitations(prev => ({ ...prev, [token]: null }))
      }
    })
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Właściciel'
      case 'employee':
        return 'Pracownik'
      default:
        return 'Brak roli'
    }
  }

  if (needsCompanySetup) {
    return (
      <Container>
        <Card>
          <Title>Witaj w Paulinka Aplikacja!</Title>
          <Subtitle>
            Aby rozpocząć, musisz utworzyć salon lub dołączyć do istniejącego.
          </Subtitle>
          <CreateButton onClick={onCreateNew} disabled={isLoading}>
            Utwórz nowy salon
          </CreateButton>
          
          <LogoutButton onClick={logout}>
            <FiLogOut size={16} />
            Wyloguj się
          </LogoutButton>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <Card>
        <Title>Wybierz salon</Title>
        <Subtitle>
          Wybierz salon, w którym chcesz pracować, lub utwórz nowy.
        </Subtitle>
        
        {companies.length > 0 && (
          <CompanyList>
            {companies.map((company) => {
              console.log('🏢 Company data:', { 
                name: company.name, 
                userRole: company.userRole, 
                roleLabel: getRoleLabel(company.userRole),
                fullCompany: company 
              });
              return (
                <CompanyButton
                  key={company.id}
                  onClick={() => handleCompanySelect(company.id)}
                  disabled={isLoading}
                >
                  <CompanyName>{company.name}</CompanyName>
                  <CompanyRole>{getRoleLabel(company.userRole)}</CompanyRole>
                </CompanyButton>
              );
            })}
          </CompanyList>
        )}

        {invitations && invitations.length > 0 && (
          <InvitationsSection>
            <SectionTitle>
              <FiMail size={16} />
              Zaproszenia do salonów
            </SectionTitle>
            {invitations.map((invitation) => (
              <InvitationCard key={invitation.token}>
                <InvitationInfo>
                  <CompanyInfo>{invitation.companyName}</CompanyInfo>
                  <InvitationDate>
                    Zaprosił(a): {invitation.inviterName} • {new Date(invitation.createdAt).toLocaleDateString('pl-PL')}
                  </InvitationDate>
                </InvitationInfo>
                <InvitationActions>
                  <AcceptButton
                    onClick={() => handleAcceptInvitation(invitation.token)}
                    disabled={processingInvitations[invitation.token] === 'accepting'}
                  >
                    <FiCheck size={16} />
                    {processingInvitations[invitation.token] === 'accepting' ? 'Akceptowanie...' : 'Akceptuj'}
                  </AcceptButton>
                  <DeclineButton
                    onClick={() => handleDeclineInvitation(invitation.token)}
                    disabled={processingInvitations[invitation.token] === 'declining'}
                  >
                    <FiX size={16} />
                    {processingInvitations[invitation.token] === 'declining' ? 'Odrzucanie...' : 'Odrzuć'}
                  </DeclineButton>
                </InvitationActions>
              </InvitationCard>
            ))}
          </InvitationsSection>
        )}

        <Divider />
        
        <CreateButton onClick={onCreateNew} disabled={isLoading}>
          Utwórz nowy salon
        </CreateButton>
        
        <LogoutButton onClick={logout}>
          <FiLogOut size={16} />
          Wyloguj się
        </LogoutButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </Container>
  )
}

export default CompanySelector