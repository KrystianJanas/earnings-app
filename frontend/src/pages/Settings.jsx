import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSettings, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container as ThemeContainer, Card, Button } from '../styles/theme';
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

const Settings = () => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  
  const isOwner = currentCompany?.userRole === 'owner';
  
  const handleNavigateToEmployees = () => {
    navigate('/employees');
  };

  return (
    <SettingsContainer>
      <ThemeContainer>
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
          {isOwner ? (
            <InfoCard>
              <FiUsers size={48} style={{ marginBottom: '1rem', color: '#8B5CF6' }} />
              <InfoText>
                Ustawienia stawek godzinowych pracowników zostały przeniesione do sekcji zarządzania pracownikami.
              </InfoText>
              <RedirectButton onClick={handleNavigateToEmployees}>
                <FiUsers size={16} />
                Przejdź do zarządzania pracownikami
                <FiArrowRight size={16} />
              </RedirectButton>
            </InfoCard>
          ) : (
            <InfoCard>
              <FiSettings size={48} style={{ marginBottom: '1rem', color: '#8B5CF6' }} />
              <InfoText>
                Ustawienia są obecnie zarządzane przez właściciela salonu.
              </InfoText>
            </InfoCard>
          )}
        </motion.div>
      </ThemeContainer>
      <Navigation />
    </SettingsContainer>
  );
};

export default Settings;