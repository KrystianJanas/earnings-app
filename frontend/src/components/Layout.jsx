import React from 'react'
import styled from 'styled-components'
import Header from './Header'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import { media } from '../styles/theme'

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  ${media.lg`
    flex-direction: row;
  `}
`

const Main = styled.main`
  flex: 1;
  padding-top: 80px; /* Space for fixed header */
  padding-bottom: 80px; /* Space for fixed navigation */
  background: ${({ theme }) => theme.colors.background};

  ${media.lg`
    margin-left: 280px; /* Space for sidebar */
    padding-top: 0;
    padding-bottom: 0;
  `}
`

const Content = styled.div`
  max-width: 428px;
  margin: 0 auto;
  min-height: calc(100vh - 160px); /* Full height minus header and nav */

  ${media.sm`
    max-width: 640px;
  `}

  ${media.md`
    max-width: 768px;
  `}

  ${media.lg`
    max-width: 100%;
    min-height: 100vh;
    padding: ${({ theme }) => theme.spacing.xl};
  `}

  ${media.xl`
    max-width: 1400px;
    margin: 0 auto;
  `}
`

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <Header />
      <Main>
        <Content>
          {children}
        </Content>
      </Main>
      <Navigation />
    </LayoutContainer>
  )
}

export default Layout