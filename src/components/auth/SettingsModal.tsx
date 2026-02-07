import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function SettingsModal() {
  const {
    user,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    updateUserProfile,
    updateUserPassword,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 个人信息表单
  const [profileForm, setProfileForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
  });

  // 密码修改表单
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      updateUserProfile(profileForm);
      addToast({
        message: '个人信息已更新',
        type: 'success',
      });
    } catch (error) {
      addToast({
        message: '更新失败，请重试',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 验证密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        message: '两次输入的密码不一致',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      addToast({
        message: '密码长度至少为6位',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
      const success = await updateUserPassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
      );

      if (success) {
        addToast({
          message: '密码修改成功',
          type: 'success',
        });
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        addToast({
          message: '旧密码错误',
          type: 'error',
        });
      }
    } catch (error) {
      addToast({
        message: '修改失败，请重试',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSettingsModalOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setIsSettingsModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-[#2D2D2D] p-6 relative">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">账号设置</h2>
                <p className="text-white/80 text-sm">
                  管理你的个人信息和账号安全
                </p>
              </div>
            </div>
          </div>

          {/* 标签切换 */}
          <div className="flex gap-2 p-1 bg-[#F9F7F2] rounded-xl mx-6 mt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-[#2D2D2D] shadow-sm'
                  : 'text-[#8C837A] hover:text-[#2D2D2D]'
              }`}
            >
              个人信息
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-[#2D2D2D] shadow-sm'
                  : 'text-[#8C837A] hover:text-[#2D2D2D]'
              }`}
            >
              修改密码
            </button>
          </div>

          {/* 表单区域 */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* 昵称 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                    昵称
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C837A]"
                    />
                    <input
                      type="text"
                      value={profileForm.nickname}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, nickname: e.target.value })
                      }
                      placeholder="请输入昵称"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F2] border border-[#EFECE6] rounded-xl text-[#2D2D2D] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D2D2D] transition-all"
                    />
                  </div>
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C837A]"
                    />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F2] border border-[#EFECE6] rounded-xl text-[#2D2D2D] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D2D2D] transition-all"
                    />
                  </div>
                </div>

                {/* 保存按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#2D2D2D] text-white font-medium rounded-xl hover:bg-[#2D2D2D]/90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '保存中...' : '保存修改'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* 旧密码 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                    旧密码
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C837A]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                      }
                      placeholder="请输入旧密码"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F9F7F2] border border-[#EFECE6] rounded-xl text-[#2D2D2D] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D2D2D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C837A] hover:text-[#2D2D2D]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 新密码 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                    新密码
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C837A]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="至少6位字符"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F9F7F2] border border-[#EFECE6] rounded-xl text-[#2D2D2D] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D2D2D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C837A] hover:text-[#2D2D2D]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 确认密码 */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C837A]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="再次输入新密码"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F2] border border-[#EFECE6] rounded-xl text-[#2D2D2D] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#2D2D2D] transition-all"
                    />
                  </div>
                </div>

                {/* 修改按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#2D2D2D] text-white font-medium rounded-xl hover:bg-[#2D2D2D]/90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '修改中...' : '修改密码'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
