import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiSettings, FiUsers, FiArrowRight, FiMail, FiLock, FiUser, FiSave, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi'
import { useMutation } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, media } from '../styles/theme'

const SettingsContainer = styled.div`
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

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }

    ${media.lg`
      font-size: 1.875rem;
    `}
  }
`

const MaxWidth = styled.div`
  max-width: 600px;

  ${media.lg`
    max-width: 700px;
  `}
`

const SectionCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.colors.primary};
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

const EmailDisplay = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;

  svg {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`

const PasswordInputWrapper = styled.div`
  position: relative;
`

const PasswordToggle = styled.button`
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

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.2);
`

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
`

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.gradient.soft};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`

const InfoIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
`

const ThemeToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const ThemeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
  }
`

const ThemeToggle = styled.button`
  position: relative;
  width: 56px;
  height: 30px;
  border-radius: 15px;
  background: ${({ $isDark, theme }) => 
    $isDark ? theme.colors.primary : theme.colors.border};
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $isDark }) => $isDark ? '29px' : '3px'};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: left 0.3s ease;
  }
`

const Settings = () => {
  const { currentCompany, user } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  
  const isOwner = currentCompany?.userRole === 'owner'

  const updateProfileMutation = useMutation(
    async (data) => {
      console.log('Updating profile:', data)
      return Promise.resolve()
    },
    {
      onSuccess: () => {
        setProfileMessage('Profil został zaktualizowany')
        setTimeout(() => setProfileMessage(''), 3000)
      },
      onError: () => {
        setProfileMessage('error:Błąd podczas aktualizacji profilu')
        setTimeout(() => setProfileMessage(''), 3000)
      }
    }
  )

  const changePasswordMutation = useMutation(
    async (data) => {
      console.log('Changing password:', data)
      return Promise.resolve()
    },
    {
      onSuccess: () => {
        setPasswordMessage('Hasło zostało zmienione')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordMessage(''), 3000)
      },
      onError: () => {
        setPasswordMessage('error:Błąd podczas zmiany hasła')
        setTimeout(() => setPasswordMessage(''), 3000)
      }
    }
  )

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    if (firstName.trim() && lastName.trim()) {
      updateProfileMutation.mutate({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMessage('error:Nowe hasła nie są identyczne')
      setTimeout(() => setPasswordMessage(''), 3000)
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage('error:Nowe hasło musi mieć co najmniej 6 znaków')
      setTimeout(() => setPasswordMessage(''), 3000)
      return
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    })
  }

  return (
    <SettingsContainer>
      <PageHeader>
        <h1>
          <FiSettings />
          Ustawienia
        </h1>
      </PageHeader>

      <MaxWidth>
        <SectionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionTitle>
            <FiMail />
            Informacje o koncie
          </SectionTitle>
          
          <FormGroup>
            <Label>Adres e-mail</Label>
            <EmailDisplay>
              <FiMail size={18} />
              {user?.email || 'Brak adresu e-mail'}
            </EmailDisplay>
          </FormGroup>
        </SectionCard>

        <SectionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <SectionTitle>
            {isDarkMode ? <FiMoon /> : <FiSun />}
            Wygląd
          </SectionTitle>
          
          <ThemeToggleWrapper>
            <ThemeLabel>
              {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
              <span>{isDarkMode ? 'Ciemny motyw' : 'Jasny motyw'}</span>
            </ThemeLabel>
            <ThemeToggle 
              $isDark={isDarkMode} 
              onClick={toggleTheme}
              type="button"
              aria-label="Przełącz motyw"
            />
          </ThemeToggleWrapper>
        </SectionCard>

        <SectionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SectionTitle>
            <FiUser />
            Profil
          </SectionTitle>
          
          {profileMessage && (
            profileMessage.startsWith('error:') ? (
              <ErrorMessage>{profileMessage.replace('error:', '')}</ErrorMessage>
            ) : (
              <SuccessMessage>{profileMessage}</SuccessMessage>
            )
          )}
          
          <Form onSubmit={handleProfileSubmit}>
            <FormGroup>
              <Label htmlFor="firstName">Imię</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Wpisz swoje imię"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Wpisz swoje nazwisko"
                required
              />
            </FormGroup>
            
            <Button type="submit" disabled={updateProfileMutation.isLoading}>
              <FiSave />
              {updateProfileMutation.isLoading ? 'Zapisywanie...' : 'Zapisz profil'}
            </Button>
          </Form>
        </SectionCard>

        <SectionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SectionTitle>
            <FiLock />
            Zmiana hasła
          </SectionTitle>
          
          {passwordMessage && (
            passwordMessage.startsWith('error:') ? (
              <ErrorMessage>{passwordMessage.replace('error:', '')}</ErrorMessage>
            ) : (
              <SuccessMessage>{passwordMessage}</SuccessMessage>
            )
          )}
          
          <Form onSubmit={handlePasswordSubmit}>
            <FormGroup>
              <Label htmlFor="currentPassword">Aktualne hasło</Label>
              <PasswordInputWrapper>
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Wpisz aktualne hasło"
                  required
                  style={{ paddingRight: '52px' }}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </PasswordInputWrapper>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="newPassword">Nowe hasło</Label>
              <PasswordInputWrapper>
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Wpisz nowe hasło"
                  required
                  style={{ paddingRight: '52px' }}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </PasswordInputWrapper>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
              <PasswordInputWrapper>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Potwierdź nowe hasło"
                  required
                  style={{ paddingRight: '52px' }}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </PasswordInputWrapper>
            </FormGroup>
            
            <Button type="submit" disabled={changePasswordMutation.isLoading}>
              <FiLock />
              {changePasswordMutation.isLoading ? 'Zmienianie...' : 'Zmień hasło'}
            </Button>
          </Form>
        </SectionCard>

        {isOwner && (
          <InfoCard>
            <InfoIcon>
              <FiUsers />
            </InfoIcon>
            <InfoText>
              Zarządzaj pracownikami, ustalaj stawki godzinowe i przeglądaj statystyki.
            </InfoText>
            <Button onClick={() => navigate('/employees')}>
              <FiUsers />
              Zarządzanie pracownikami
              <FiArrowRight />
            </Button>
          </InfoCard>
        )}
      </MaxWidth>
    </SettingsContainer>
  )
}

export default Settings
