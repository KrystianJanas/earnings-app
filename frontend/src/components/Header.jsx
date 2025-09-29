import React, { useState } from 'react'
import styled from 'styled-components'
import { FiChevronDown, FiUsers, FiLogOut, FiPlus } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import CreateCompany from './CreateCompany'

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const HeaderContent = styled.div`
  max-width: 428px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CompanyInfo = styled.div`
  flex: 1;
`

const CompanyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  svg {
    font-size: 1rem;
    transition: transform 0.2s ease;
    transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`

const CompanyName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.125rem;
`

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  margin-top: 0.5rem;
  overflow: hidden;
  z-index: 1000;
`

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  background: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  svg {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.text.muted};
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

const Header = () => {
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
              isOpen={isDropdownOpen}
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
      </HeaderContent>
    </HeaderContainer>
  )
}

export default Header