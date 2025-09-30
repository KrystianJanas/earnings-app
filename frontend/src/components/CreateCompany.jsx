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
`

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`

const Input = styled.input`
  padding: 0.875rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    background: ${props => props.theme.colors.background};
    opacity: 0.6;
  }
`

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    background: ${props => props.theme.colors.background};
    opacity: 0.6;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const Button = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const PrimaryButton = styled(Button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
  }
`

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 2px solid ${props => props.theme.colors.border};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.background};
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

const CreateCompany = ({ onBack, onSuccess }) => {
  const { createCompany } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Nazwa salonu jest wymagana.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const company = await createCompany(formData)
      onSuccess?.(company)
    } catch (error) {
      console.error('Failed to create company:', error)
      setError(
        error.response?.data?.error || 
        'Wystąpił błąd podczas tworzenia salonu. Spróbuj ponownie.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Card>
        <Title>Utwórz nowy salon</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Nazwa salonu *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="np. Studio Kosmetologiczne"
              disabled={isLoading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Opis</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Krótki opis salonu..."
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="ul. Przykładowa 123, 00-000 Miasto"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+48 123 456 789"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="kontakt@salon.pl"
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="website">Strona internetowa</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://salon.pl"
              disabled={isLoading}
            />
          </FormGroup>

          <ButtonGroup>
            <SecondaryButton
              type="button"
              onClick={onBack}
              disabled={isLoading}
            >
              Powrót
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Tworzenie...' : 'Utwórz salon'}
            </PrimaryButton>
          </ButtonGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Card>
    </Container>
  )
}

export default CreateCompany