import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiChevronDown, FiUsers, FiLogOut, FiPlus } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import CreateCompany from './CreateCompany'
import { media } from '../styles/theme'

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 2px solid ${({ theme }) => theme.colors.borderLight};
  padding: 0.75rem 1rem;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  ${media.lg`
    display: none;
  `}
`

const HeaderContent = styled.div`
  max-width: 428px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  ${media.sm`
    max-width: 640px;
  `}

  ${media.md`
    max-width: 768px;
  `}
`

const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const PeriodSelectorWrapper = styled.div`
  flex-shrink: 0;
`

const PeriodSelect = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 6px 24px 6px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
  font-weight: 500;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.cardBg};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
`

const CompanyButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}15 0%, ${({ theme }) => theme.colors.secondary}10 100%);
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.625rem 0.875rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}25 0%, ${({ theme }) => theme.colors.secondary}15 100%);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
    transition: transform 0.2s ease;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`

const CompanyName = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`

const UserRole = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;
`

const Dropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  margin-top: 0.5rem;
  overflow: hidden;
  z-index: 1000;
`

const DropdownItem = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-align: left;
  font-size: 0.9rem;

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}15 0%, ${({ theme }) => theme.colors.secondary}08 100%);
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  }

  svg {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const DropdownSection = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

const SectionTitle = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CompanyMenuItem = styled(DropdownItem)`
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
`

const CompanyMenuName = styled.div`
  font-weight: 600;
`

const CompanyMenuRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`

const Header = ({ periodSelector }) => {
  const { currentCompany, companies, switchCompany, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCreateCompany, setShowCreateCompany] = useState(false)

  const handleCompanySwitch = async (companyId) => {
    if (companyId !== currentCompany?.id) {
      await switchCompany(companyId)
    }
    setIsDropdownOpen(false)
  }

  const handleCreateCompany = () => {
    setShowCreateCompany(true)
    setIsDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
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

  if (!currentCompany) {
    return null
  }

  if (showCreateCompany) {
    return (
      <CreateCompany 
        onBack={() => setShowCreateCompany(false)}
        onSuccess={() => setShowCreateCompany(false)}
      />
    )
  }

  return (
    <HeaderContainer>
      <HeaderContent>
        <CompanyInfo>
          <div style={{ position: 'relative' }}>
            <CompanyButton
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              $isOpen={isDropdownOpen}
            >
              <div>
                <CompanyName>{currentCompany.name}</CompanyName>
                <UserRole>{getRoleLabel(currentCompany.userRole)}</UserRole>
              </div>
              <FiChevronDown />
            </CompanyButton>

            {isDropdownOpen && (
              <>
                <Overlay onClick={() => setIsDropdownOpen(false)} />
                <Dropdown>
                  {companies.length > 1 && (
                    <DropdownSection>
                      <SectionTitle>Przełącz salon</SectionTitle>
                      {companies.map((company) => (
                          <CompanyMenuItem
                            key={company.id}
                            onClick={() => handleCompanySwitch(company.id)}
                          >
                            <CompanyMenuName>{company.name}</CompanyMenuName>
                            <CompanyMenuRole>{getRoleLabel(company.userRole)}</CompanyMenuRole>
                          </CompanyMenuItem>
                      ))}
                    </DropdownSection>
                  )}

                  <DropdownSection>
                    <DropdownItem onClick={handleCreateCompany}>
                      <FiPlus />
                      Utwórz nowy salon
                    </DropdownItem>
                  </DropdownSection>

                  <DropdownSection>
                    <DropdownItem onClick={handleLogout}>
                      <FiLogOut />
                      Wyloguj się
                    </DropdownItem>
                  </DropdownSection>
                </Dropdown>
              </>
            )}
          </div>
        </CompanyInfo>

        {periodSelector && (
          <PeriodSelectorWrapper>
            {periodSelector}
          </PeriodSelectorWrapper>
        )}
      </HeaderContent>
    </HeaderContainer>
  )
}

export default Header