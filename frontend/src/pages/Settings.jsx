import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSettings, FiUsers, FiArrowRight, FiMail, FiLock, FiUser, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { useMutation } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container as ThemeContainer, Card, Button, Input, Label } from '../styles/theme';
import Navigation from '../components/Navigation';

const SettingsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-bottom: 100px;
  background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const InfoCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
`;

const RedirectButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0 auto;
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SectionCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const EmailDisplay = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled(Input)`
  padding-right: 2.5rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SaveButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const ResponsiveContainer = styled(ThemeContainer)`
  @media (min-width: 1024px) {
    max-width: 800px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
  }

  @media (min-width: 1280px) {
    max-width: 900px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
  }
`;

const Settings = () => {
  const { currentCompany, user } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const isOwner = currentCompany?.userRole === 'owner';
  
  const handleNavigateToEmployees = () => {
    navigate('/employees');
  };

  // Placeholder mutations - we'll need to implement these API endpoints
  const updateProfileMutation = useMutation(
    async (data) => {
      // TODO: Implement profile update API
      console.log('Updating profile:', data);
      return Promise.resolve();
    },
    {
      onSuccess: () => {
        setProfileMessage('Profil został zaktualizowany');
        setTimeout(() => setProfileMessage(''), 3000);
      },
      onError: () => {
        setProfileMessage('Błąd podczas aktualizacji profilu');
        setTimeout(() => setProfileMessage(''), 3000);
      }
    }
  );

  const changePasswordMutation = useMutation(
    async (data) => {
      // TODO: Implement password change API
      console.log('Changing password:', data);
      return Promise.resolve();
    },
    {
      onSuccess: () => {
        setPasswordMessage('Hasło zostało zmienione');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
      },
      onError: () => {
        setPasswordMessage('Błąd podczas zmiany hasła');
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    }
  );

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      updateProfileMutation.mutate({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Nowe hasła nie są identyczne');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('Nowe hasło musi mieć co najmniej 6 znaków');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  return (
    <SettingsContainer>
      <ResponsiveContainer>
        <Header>
          <Title>
            <FiSettings size={24} color="#8B5CF6" />
            Ustawienia
          </Title>
        </Header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Account Information Section */}
          <SectionCard>
            <SectionTitle>
              <FiMail size={20} />
              Informacje o koncie
            </SectionTitle>
            
            <FormGroup>
              <Label>Adres e-mail</Label>
              <EmailDisplay>
                <FiMail size={16} />
                {user?.email || 'Brak adresu e-mail'}
              </EmailDisplay>
            </FormGroup>
          </SectionCard>

          {/* Profile Section */}
          <SectionCard>
            <SectionTitle>
              <FiUser size={20} />
              Profil
            </SectionTitle>
            
            {profileMessage && (
              profileMessage.includes('Błąd') ? (
                <ErrorMessage>{profileMessage}</ErrorMessage>
              ) : (
                <SuccessMessage>{profileMessage}</SuccessMessage>
              )
            )}
            
            <SettingsForm onSubmit={handleProfileSubmit}>
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
              
              <SaveButton 
                type="submit" 
                disabled={updateProfileMutation.isLoading}
              >
                <FiSave size={16} />
                {updateProfileMutation.isLoading ? 'Zapisywanie...' : 'Zapisz profil'}
              </SaveButton>
            </SettingsForm>
          </SectionCard>

          {/* Password Section */}
          <SectionCard>
            <SectionTitle>
              <FiLock size={20} />
              Zmiana hasła
            </SectionTitle>
            
            {passwordMessage && (
              passwordMessage.includes('Błąd') ? (
                <ErrorMessage>{passwordMessage}</ErrorMessage>
              ) : (
                <SuccessMessage>{passwordMessage}</SuccessMessage>
              )
            )}
            
            <SettingsForm onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword">Aktualne hasło</Label>
                <PasswordInputWrapper>
                  <PasswordInput
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Wpisz aktualne hasło"
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </PasswordToggle>
                </PasswordInputWrapper>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">Nowe hasło</Label>
                <PasswordInputWrapper>
                  <PasswordInput
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Wpisz nowe hasło"
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </PasswordToggle>
                </PasswordInputWrapper>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <PasswordInputWrapper>
                  <PasswordInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Potwierdź nowe hasło"
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </PasswordToggle>
                </PasswordInputWrapper>
              </FormGroup>
              
              <SaveButton 
                type="submit" 
                disabled={changePasswordMutation.isLoading}
              >
                <FiLock size={16} />
                {changePasswordMutation.isLoading ? 'Zmienianie...' : 'Zmień hasło'}
              </SaveButton>
            </SettingsForm>
          </SectionCard>

          {/* Employee Management Link for Owners */}
          {isOwner && (
            <InfoCard>
              <FiUsers size={48} style={{ marginBottom: '1rem', color: '#8B5CF6' }} />
              <InfoText>
                Zarządzaj pracownikami, ustalaj stawki godzinowe i przeglądaj statystyki w sekcji zarządzania pracownikami.
              </InfoText>
              <RedirectButton onClick={handleNavigateToEmployees}>
                <FiUsers size={16} />
                Przejdź do zarządzania pracownikami
                <FiArrowRight size={16} />
              </RedirectButton>
            </InfoCard>
          )}
        </motion.div>
      </ResponsiveContainer>
      <Navigation />
    </SettingsContainer>
  );
};

export default Settings;