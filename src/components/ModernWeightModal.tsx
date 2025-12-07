import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3 } from 'lucide-react';

interface ModernWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  currentWeight: number;
  fromLabel: string;
  toLabel: string;
}

export function ModernWeightModal({ isOpen, onClose, onSave, currentWeight, fromLabel, toLabel }: ModernWeightModalProps) {
  const [weight, setWeight] = useState(String(currentWeight));

  useEffect(() => {
    setWeight(String(currentWeight));
  }, [currentWeight, isOpen]);

  const handleSave = () => {
    const newWeight = parseInt(weight);
    if (!isNaN(newWeight) && newWeight > 0) {
      onSave(newWeight);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 pointer-events-auto border border-purple-500/30 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-transparent pointer-events-none" />
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">Edit Edge Weight</h3>
                    <p className="text-purple-300 text-sm">{fromLabel} → {toLabel}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="relative mb-8">
                <label className="block text-purple-300 mb-3">
                  Enter new weight value:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-6 py-4 bg-black/30 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none transition-all text-white text-xl text-center backdrop-blur-sm"
                    autoFocus
                    min="1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl pointer-events-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl transition-all border border-white/10"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-purple-500/50 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative">Save Changes</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
