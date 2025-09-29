import React, { useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../context/AuthContext'

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
  color: ${props => props.theme.colors.textSecondary};
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
  color: ${props => props.theme.colors.textSecondary};
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

const CompanySelector = ({ onCreateNew }) => {
  const { companies, switchCompany, needsCompanySetup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
            {companies.map((company) => (
              <CompanyButton
                key={company.id}
                onClick={() => handleCompanySelect(company.id)}
                disabled={isLoading}
              >
                <CompanyName>{company.name}</CompanyName>
                <CompanyRole>{getRoleLabel(company.userRole)}</CompanyRole>
              </CompanyButton>
            ))}
          </CompanyList>
        )}

        <Divider />
        
        <CreateButton onClick={onCreateNew} disabled={isLoading}>
          Utwórz nowy salon
        </CreateButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </Container>
  )
}

export default CompanySelector