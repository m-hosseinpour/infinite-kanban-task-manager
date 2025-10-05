import { createSignal, Show, Component } from 'solid-js'
import { X, Mail, Lock } from 'lucide-solid'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  t: any
  isRTL: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
}

export const AuthModal: Component<AuthModalProps> = (props) => {
  const [isSignUp, setIsSignUp] = createSignal(false)
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal('')

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = isSignUp()
        ? await props.signUp(email(), password())
        : await props.signIn(email(), password())

      if (result.error) {
        setError(result.error.message)
      } else {
        props.onClose()
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class={`${props.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl p-6 max-w-md w-full border relative`}>
          <button
            onClick={props.onClose}
            class={`absolute top-4 ${props.isRTL ? 'left-4' : 'right-4'} p-1 rounded-lg ${props.isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} transition-colors duration-150`}
          >
            <X size={20} />
          </button>

          <div class="mb-6">
            <h2 class={`text-xl font-bold ${props.isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
              {isSignUp() ? props.t().auth.signUp : props.t().auth.signIn}
            </h2>
            <p class={`text-sm ${props.isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isSignUp() ? props.t().auth.signUpDescription : props.t().auth.signInDescription}
            </p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class={`block text-sm font-medium ${props.isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {props.t().auth.email}
              </label>
              <div class="relative">
                <Mail size={18} class={`absolute ${props.isRTL ? 'right-3' : 'left-3'} top-3 ${props.isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                  class={`w-full ${props.isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    props.isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={props.t().auth.emailPlaceholder}
                />
              </div>
            </div>

            <div>
              <label class={`block text-sm font-medium ${props.isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {props.t().auth.password}
              </label>
              <div class="relative">
                <Lock size={18} class={`absolute ${props.isRTL ? 'right-3' : 'left-3'} top-3 ${props.isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                  minLength={6}
                  class={`w-full ${props.isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    props.isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={props.t().auth.passwordPlaceholder}
                />
              </div>
            </div>

            <Show when={error()}>
              <div class={`text-sm p-3 rounded-lg ${props.isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                {error()}
              </div>
            </Show>

            <button
              type="submit"
              disabled={loading()}
              class={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-150 ${
                loading()
                  ? props.isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading() ? props.t().auth.loading : (isSignUp() ? props.t().auth.signUp : props.t().auth.signIn)}
            </button>
          </form>

          <div class="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp())}
              class={`text-sm ${props.isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors duration-150`}
            >
              {isSignUp() ? props.t().auth.alreadyHaveAccount : props.t().auth.dontHaveAccount}
            </button>
          </div>
        </div>
      </div>
    </Show>
  )
}