import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiLogOut, FiPlus, FiCheck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import CreateCompany from './CreateCompany'
import { media } from '../styles/theme'

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 16px;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  ${media.lg`
    display: none;
  `}
`

const HeaderContent = styled.div`
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const PeriodSelectorWrapper = styled.div`
  flex-shrink: 0;
`

const CompanyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all ${({ theme }) => theme.transitions.normal};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const CompanyDetails = styled.div`
  flex: 1;
  text-align: left;
  min-width: 0;
`

const CompanyName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;
`

const ChevronIcon = styled(FiChevronDown)`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
`

const Dropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 16px;
  right: 16px;
  max-width: 500px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  z-index: 1000;
`

const DropdownSection = styled.div`
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`

const SectionTitle = styled.div`
  padding: 8px 16px 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-align: left;
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  svg {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`

const CompanyMenuItem = styled(DropdownItem)`
  justify-content: space-between;
`

const CompanyMenuInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const CompanyMenuName = styled.div`
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CompanyMenuRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`

const ActiveIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 0.85rem;
  }
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
            <CompanyButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <CompanyDetails>
                <CompanyName>{currentCompany.name}</CompanyName>
                <UserRole>{getRoleLabel(currentCompany.userRole)}</UserRole>
              </CompanyDetails>
              <ChevronIcon $isOpen={isDropdownOpen} />
            </CompanyButton>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <Overlay onClick={() => setIsDropdownOpen(false)} />
                  <Dropdown
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {companies.length > 1 && (
                      <DropdownSection>
                        <SectionTitle>Przełącz salon</SectionTitle>
                        {companies.map((company) => (
                          <CompanyMenuItem
                            key={company.id}
                            onClick={() => handleCompanySwitch(company.id)}
                          >
                            <CompanyMenuInfo>
                              <CompanyMenuName>{company.name}</CompanyMenuName>
                              <CompanyMenuRole>{getRoleLabel(company.userRole)}</CompanyMenuRole>
                            </CompanyMenuInfo>
                            {company.id === currentCompany.id && (
                              <ActiveIndicator>
                                <FiCheck />
                              </ActiveIndicator>
                            )}
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
            </AnimatePresence>
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
