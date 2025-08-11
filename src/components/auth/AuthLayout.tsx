import { useState } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

type AuthMode = 'login' | 'signup'

export function AuthLayout() {
    const [mode, setMode] = useState<AuthMode>('login')

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
                    <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
                    <div className="absolute bottom-32 left-32 w-40 h-40 bg-white rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full"></div>
                </div>

                <div className="relative z-10 text-white">
                    <div className="flex items-center mb-8">
                        <div className="bg-white/20 p-3 rounded-2xl mr-4">
                            <MessageCircle className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-bold">Chatbot App</h1>
                    </div>

                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Your AI-Powered
                        <br />
                        Conversation Partner
                    </h2>

                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                        Experience intelligent conversations with our advanced AI chatbot.
                        Get instant responses, creative assistance, and engaging discussions.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-3 text-yellow-300" />
                            <span className="text-blue-100">Intelligent responses powered by advanced AI</span>
                        </div>
                        <div className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-3 text-yellow-300" />
                            <span className="text-blue-100">Real-time conversations with instant feedback</span>
                        </div>
                        <div className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-3 text-yellow-300" />
                            <span className="text-blue-100">Secure and private chat environment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Forms */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {mode === 'login' ? (
                        <LoginForm onSwitchToSignup={() => setMode('signup')} />
                    ) : (
                        <SignupForm onSwitchToLogin={() => setMode('login')} />
                    )}
                </div>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden absolute top-8 left-8 flex items-center text-gray-900">
                <div className="bg-blue-600 p-2 rounded-xl mr-3">
                    <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Chatbot App</span>
            </div>
        </div>
    )
}