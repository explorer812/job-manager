import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { LoginForm, RegisterForm } from '../../types';

export function LoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginModalMode,
    setLoginModalMode,
    login,
    register,
    addToast,
  } = useStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 登录表单
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  // 注册表单
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(loginForm.email, loginForm.password);

    if (success) {
      addToast({
        message: '登录成功！',
        type: 'success',
      });
      setIsLoginModalOpen(false);
      setLoginForm({ email: '', password: '' });
    } else {
      addToast({
        message: '邮箱或密码错误',
        type: 'error',
      });
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证密码
    if (registerForm.password !== registerForm.confirmPassword) {
      addToast({
        message: '两次输入的密码不一致',
        type: 'error',
      });
      return;
    }

    if (registerForm.password.length < 6) {
      addToast({
        message: '密码长度至少为6位',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    const success = await register(
      registerForm.nickname,
      registerForm.email,
      registerForm.password
    );

    if (success) {
      addToast({
        message: '注册成功！',
        type: 'success',
      });
      setIsLoginModalOpen(false);
      setRegisterForm({ nickname: '', email: '', password: '', confirmPassword: '' });
    } else {
      addToast({
        message: '该邮箱已被注册',
        type: 'error',
      });
    }

    setIsLoading(false);
  };

  if (!isLoginModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setIsLoginModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-[#B5EAD7] to-[#C7CEEA] p-6 relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {loginModalMode === 'login' ? '欢迎回来' : '创建账号'}
                </h2>
                <p className="text-white/80 text-sm">
                  {loginModalMode === 'login'
                    ? '登录以同步你的求职数据'
                    : '注册开启你的求职之旅'}
                </p>
              </div>
            </div>
          </div>

          {/* 表单区域 */}
          <div className="p-6">
            {/* 切换标签 */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setLoginModalMode('login')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  loginModalMode === 'login'
                    ? 'bg-white text-[#2D3748] shadow-sm'
                    : 'text-[#718096] hover:text-[#2D3748]'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setLoginModalMode('register')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  loginModalMode === 'register'
                    ? 'bg-white text-[#2D3748] shadow-sm'
                    : 'text-[#718096] hover:text-[#2D3748]'
                }`}
              >
                注册
              </button>
            </div>

            {loginModalMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* 邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 transition-all"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                    密码
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      placeholder="请输入密码"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#2D3748]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#B5EAD7] to-[#C7CEEA] text-[#2D3748] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '登录中...' : '登录'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* 昵称 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                    昵称
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    />
                    <input
                      type="text"
                      value={registerForm.nickname}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, nickname: e.target.value })
                      }
                      placeholder="请输入昵称"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 transition-all"
                    />
                  </div>
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 transition-all"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                    密码
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, password: e.target.value })
                      }
                      placeholder="至少6位字符"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#2D3748]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 确认密码 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="再次输入密码"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#B5EAD7] focus:ring-2 focus:ring-[#B5EAD7]/20 transition-all"
                    />
                  </div>
                </div>

                {/* 注册按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#B5EAD7] to-[#C7CEEA] text-[#2D3748] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '注册中...' : '注册'}
                </button>
              </form>
            )}

            {/* 底部提示 */}
            <p className="text-center text-xs text-[#718096] mt-4">
              {loginModalMode === 'login' ? (
                <>
                  还没有账号？
                  <button
                    onClick={() => setLoginModalMode('register')}
                    className="text-[#B5EAD7] hover:underline ml-1"
                  >
                    立即注册
                  </button>
                </>
              ) : (
                <>
                  已有账号？
                  <button
                    onClick={() => setLoginModalMode('login')}
                    className="text-[#B5EAD7] hover:underline ml-1"
                  >
                    立即登录
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
