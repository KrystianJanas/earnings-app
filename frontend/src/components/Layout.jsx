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
  background: ${({ theme }) => theme.colors.background};

  ${media.lg`
    flex-direction: row;
  `}
`

const Main = styled.main`
  flex: 1;
  padding-top: 72px;
  padding-bottom: 80px;
  background: ${({ theme }) => theme.colors.background};

  ${media.lg`
    margin-left: 280px;
    padding-top: 0;
    padding-bottom: 0;
  `}
`

const Content = styled.div`
  max-width: 500px;
  margin: 0 auto;
  min-height: calc(100vh - 152px);

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
    max-width: 1200px;
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
