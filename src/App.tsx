import { NhostProvider } from '@nhost/react'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import { validateEnv } from './config/env'
import { AuthProvider } from './contexts/AuthContext'
import { AppRoutes } from './routes/AppRoutes'
import './index.css'

// Validate environment variables on app start
validateEnv()

function App() {
    return (
        <NhostProvider nhost={nhost}>
            <ApolloProvider client={apolloClient}>
                <AuthProvider>
                    <BrowserRouter
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                        }}
                    >
                        <div className="min-h-screen bg-gray-50">
                            <AppRoutes />
                        </div>
                    </BrowserRouter>
                </AuthProvider>
            </ApolloProvider>
        </NhostProvider>
    )
}

export default App