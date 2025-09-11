import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSave, FiSettings } from 'react-icons/fi';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { Container as ThemeContainer, Card, Button, Input, Label } from '../styles/theme';

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

const FormCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencyInput = styled(Input)`
  padding-right: 45px;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  right: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  pointer-events: none;
`;

const SuccessMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const Settings = () => {
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setHourlyRate(response.data.hourlyRate.toFixed(2));
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Błąd podczas ładowania ustawień' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const rate = parseFloat(hourlyRate) || 0;
      await api.put('/settings', { hourlyRate: rate });
      setMessage({ type: 'success', text: 'Ustawienia zostały zapisane' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Błąd podczas zapisywania ustawień' });
    } finally {
      setLoading(false);
    }
  };

  const handleHourlyRateChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setHourlyRate(value);
    }
  };

  const handleBlur = () => {
    if (hourlyRate && !isNaN(parseFloat(hourlyRate))) {
      setHourlyRate(parseFloat(hourlyRate).toFixed(2));
    }
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

        {message.text && (
          message.type === 'success' ? (
            <SuccessMessage>{message.text}</SuccessMessage>
          ) : (
            <ErrorMessage>{message.text}</ErrorMessage>
          )
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FormCard>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="hourlyRate">Stawka godzinowa</Label>
                <InputContainer>
                  <CurrencyInput
                    id="hourlyRate"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={hourlyRate}
                    onChange={handleHourlyRateChange}
                    onBlur={handleBlur}
                    placeholder="30.00"
                  />
                  <CurrencySymbol>zł</CurrencySymbol>
                </InputContainer>
              </FormGroup>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                <FiSave style={{ marginRight: '0.5rem' }} />
                {loading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
              </Button>
            </form>
          </FormCard>
        </motion.div>
      </ThemeContainer>
      <Navigation />
    </SettingsContainer>
  );
};

export default Settings;