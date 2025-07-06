import { motion } from 'framer-motion';
import { 
  HiOutlineCreditCard,
  HiOutlineLibrary,
  HiOutlineCash,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import type { PaymentAccount, Currency } from '../types/financial.types';

interface PaymentAccountListProps {
  accounts: PaymentAccount[];
  currencies: Currency[];
  onEdit: (account: PaymentAccount) => void;
  onDelete: (accountId: string) => void;
}

export default function PaymentAccountList({ 
  accounts, 
  currencies, 
  onEdit, 
  onDelete 
}: PaymentAccountListProps) {
  const getAccountIcon = (type: PaymentAccount['account_type']) => {
    switch (type) {
      case 'bank':
        return HiOutlineLibrary;
      case 'stripe':
      case 'paypal':
        return HiOutlineCreditCard;
      default:
        return HiOutlineCash;
    }
  };

  const getAccountColor = (type: PaymentAccount['account_type']) => {
    switch (type) {
      case 'bank':
        return 'blue';
      case 'cash':
        return 'green';
      case 'stripe':
        return 'purple';
      case 'paypal':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    const currency = account.currency;
    if (!acc[currency]) {
      acc[currency] = [];
    }
    acc[currency].push(account);
    return acc;
  }, {} as Record<string, PaymentAccount[]>);

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <HiOutlineCash className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No payment accounts
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new payment account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedAccounts).map(([currency, currencyAccounts]) => {
        const currencyInfo = currencies.find(c => c.code === currency);
        
        return (
          <div key={currency} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {currencyInfo?.name || currency} ({currencyInfo?.symbol || currency})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currencyAccounts.map((account, index) => {
                const Icon = getAccountIcon(account.account_type);
                const color = getAccountColor(account.account_type);
                
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer"
                    onClick={() => onEdit(account)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        {account.is_default && (
                          <HiOutlineCheckCircle className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(account);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <HiOutlinePencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(account.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {account.account_name}
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
                          {account.account_type.toUpperCase()}
                        </span>
                      </div>

                      {account.account_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Account</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ****{account.account_number.slice(-4)}
                          </span>
                        </div>
                      )}

                      {account.bank_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Bank</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.bank_name}
                          </span>
                        </div>
                      )}

                      {account.stripe_account_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Stripe ID</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.stripe_account_id.slice(0, 8)}...
                          </span>
                        </div>
                      )}

                      {account.paypal_email && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">PayPal</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {account.paypal_email}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                        <span className={`text-sm font-medium ${
                          account.is_active 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {account.description && (
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {account.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}