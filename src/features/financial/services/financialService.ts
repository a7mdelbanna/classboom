import { supabase } from '../../../lib/supabase';
import type {
  PaymentAccount,
  PaymentAccountFormData,
  SchoolCurrencySettings,
  SchoolCurrencySettingsFormData,
  FinancialSettings,
  FinancialSettingsFormData,
  Currency,
  ExchangeRate,
  ConversionResult,
  FinancialSummary,
  AccountType
} from '../types/financial.types';

export class FinancialService {
  // Get current school ID
  private static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: school, error } = await supabase
      .from('schools')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (error) throw new Error('School not found');
    return school.id;
  }

  // ===== PAYMENT ACCOUNTS =====

  // Get all payment accounts for the school
  static async getPaymentAccounts(activeOnly = false): Promise<PaymentAccount[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('payment_accounts')
        .select('*')
        .eq('school_id', schoolId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching payment accounts:', error);
      throw error;
    }
  }

  // Get single payment account
  static async getPaymentAccount(id: string): Promise<PaymentAccount | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching payment account:', error);
      return null;
    }
  }

  // Create payment account
  static async createPaymentAccount(data: PaymentAccountFormData): Promise<PaymentAccount> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();

      // If this is set as default, unset other defaults for same currency
      if (data.is_default) {
        await supabase
          .from('payment_accounts')
          .update({ is_default: false })
          .eq('school_id', schoolId)
          .eq('currency', data.currency);
      }

      const { data: account, error } = await supabase
        .from('payment_accounts')
        .insert({
          school_id: schoolId,
          created_by: user?.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return account;
    } catch (error) {
      console.error('Error creating payment account:', error);
      throw error;
    }
  }

  // Update payment account
  static async updatePaymentAccount(id: string, data: Partial<PaymentAccountFormData>): Promise<PaymentAccount> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      // If setting as default, unset other defaults for same currency
      if (data.is_default) {
        const existingAccount = await this.getPaymentAccount(id);
        if (existingAccount) {
          await supabase
            .from('payment_accounts')
            .update({ is_default: false })
            .eq('school_id', schoolId)
            .eq('currency', existingAccount.currency)
            .neq('id', id);
        }
      }

      const { data: account, error } = await supabase
        .from('payment_accounts')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw error;
      return account;
    } catch (error) {
      console.error('Error updating payment account:', error);
      throw error;
    }
  }

  // Delete payment account
  static async deletePaymentAccount(id: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('payment_accounts')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting payment account:', error);
      throw error;
    }
  }

  // Get default account for currency
  static async getDefaultAccount(currency: string): Promise<PaymentAccount | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .eq('school_id', schoolId)
        .eq('currency', currency)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching default account:', error);
      return null;
    }
  }

  // ===== CURRENCIES =====

  // Get all available currencies
  static async getCurrencies(activeOnly = true): Promise<Currency[]> {
    try {
      let query = supabase
        .from('currencies')
        .select('*')
        .order('code');

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  // ===== SCHOOL CURRENCY SETTINGS =====

  // Get school currency settings
  static async getSchoolCurrencySettings(): Promise<SchoolCurrencySettings | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('school_currency_settings')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return default
          return {
            id: '',
            school_id: schoolId,
            base_currency: 'USD',
            accepted_currencies: ['USD'],
            currency_display: 'symbol',
            decimal_separator: '.',
            thousand_separator: ',',
            auto_update_rates: true,
            rate_update_frequency: 'daily',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching currency settings:', error);
      return null;
    }
  }

  // Create or update school currency settings
  static async updateSchoolCurrencySettings(data: SchoolCurrencySettingsFormData): Promise<SchoolCurrencySettings> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: existing } = await supabase
        .from('school_currency_settings')
        .select('id')
        .eq('school_id', schoolId)
        .single();

      if (existing) {
        // Update existing
        const { data: settings, error } = await supabase
          .from('school_currency_settings')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('school_id', schoolId)
          .select()
          .single();

        if (error) throw error;
        return settings;
      } else {
        // Create new
        const { data: settings, error } = await supabase
          .from('school_currency_settings')
          .insert({
            school_id: schoolId,
            ...data
          })
          .select()
          .single();

        if (error) throw error;
        return settings;
      }
    } catch (error) {
      console.error('Error updating currency settings:', error);
      throw error;
    }
  }

  // ===== FINANCIAL SETTINGS =====

  // Get financial settings
  static async getFinancialSettings(): Promise<FinancialSettings | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return defaults
          return {
            id: '',
            school_id: schoolId,
            tax_enabled: false,
            payment_terms_days: 30,
            late_payment_fee_enabled: false,
            invoice_prefix: 'INV',
            next_invoice_number: 1,
            partial_refund_allowed: true,
            refund_processing_days: 7,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching financial settings:', error);
      return null;
    }
  }

  // Update financial settings
  static async updateFinancialSettings(data: FinancialSettingsFormData): Promise<FinancialSettings> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: existing } = await supabase
        .from('financial_settings')
        .select('id')
        .eq('school_id', schoolId)
        .single();

      if (existing) {
        // Update existing
        const { data: settings, error } = await supabase
          .from('financial_settings')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('school_id', schoolId)
          .select()
          .single();

        if (error) throw error;
        return settings;
      } else {
        // Create new
        const { data: settings, error } = await supabase
          .from('financial_settings')
          .insert({
            school_id: schoolId,
            ...data
          })
          .select()
          .single();

        if (error) throw error;
        return settings;
      }
    } catch (error) {
      console.error('Error updating financial settings:', error);
      throw error;
    }
  }

  // ===== EXCHANGE RATES =====

  // Fetch exchange rates from Frankfurter API
  static async fetchExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<void> {
    try {
      const targets = targetCurrencies.filter(c => c !== baseCurrency).join(',');
      if (!targets) return;

      // Note: This might fail due to CORS if called from browser
      // In production, this should be done via a backend/edge function
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targets}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.warn(`Exchange rate API returned ${response.status}: ${response.statusText}`);
        // Don't throw, just log and return
        return;
      }

      const data = await response.json();
      const rateDate = data.date;

      // Save rates to database
      const rates = Object.entries(data.rates).map(([currency, rate]) => ({
        base_currency: baseCurrency,
        target_currency: currency,
        rate: rate as number,
        rate_date: rateDate,
        source: 'frankfurter'
      }));

      if (rates.length > 0) {
        const { error } = await supabase
          .from('exchange_rates')
          .upsert(rates, {
            onConflict: 'base_currency,target_currency,rate_date'
          });

        if (error) {
          console.warn('Error saving exchange rates:', error);
          // Don't throw, just log
        }
      }
    } catch (error) {
      // Log error but don't throw - exchange rates are optional
      console.warn('Could not fetch exchange rates (this is normal in development due to CORS):', error);
    }
  }

  // Get exchange rate
  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    date?: string
  ): Promise<number | null> {
    try {
      const { data, error } = await supabase.rpc('get_exchange_rate', {
        p_from_currency: fromCurrency,
        p_to_currency: toCurrency,
        p_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return null;
    }
  }

  // Convert currency amount
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: string
  ): Promise<ConversionResult | null> {
    try {
      const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);
      if (!rate) return null;

      const convertedAmount = amount * rate;
      const rateDate = date || new Date().toISOString().split('T')[0];

      return {
        from: {
          amount,
          currency: fromCurrency
        },
        to: {
          amount: Math.round(convertedAmount * 100) / 100,
          currency: toCurrency
        },
        rate,
        rate_date: rateDate
      };
    } catch (error) {
      console.error('Error converting currency:', error);
      return null;
    }
  }

  // Update exchange rates for school's currencies
  static async updateSchoolExchangeRates(): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSchoolCurrencySettings();
      if (!settings || !settings.auto_update_rates) {
        return { success: true };
      }

      // Fetch rates for base currency to all accepted currencies
      await this.fetchExchangeRates(
        settings.base_currency,
        settings.accepted_currencies
      );

      // Also fetch reverse rates
      for (const currency of settings.accepted_currencies) {
        if (currency !== settings.base_currency) {
          await this.fetchExchangeRates(currency, [settings.base_currency]);
        }
      }

      return { success: true };
    } catch (error) {
      // Log but don't throw - exchange rates are optional
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Could not update exchange rates:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // ===== FINANCIAL SUMMARY =====

  // Get financial summary
  static async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const settings = await this.getSchoolCurrencySettings();
      const accounts = await this.getPaymentAccounts();

      // Get revenue data (this would come from actual transaction tables in a real app)
      const baseCurrency = settings?.base_currency || 'USD';

      // Calculate accounts by type
      const accountsByType: Record<AccountType, number> = {
        cash: 0,
        bank: 0,
        stripe: 0,
        paypal: 0,
        other: 0
      };

      accounts.forEach(account => {
        accountsByType[account.account_type]++;
      });

      // Get active currencies
      const activeCurrencies = [...new Set(accounts.map(a => a.currency))];

      return {
        base_currency: baseCurrency,
        total_revenue: 0, // Would calculate from actual transactions
        revenue_by_currency: {}, // Would calculate from actual transactions
        total_accounts: accounts.length,
        accounts_by_type: accountsByType,
        active_currencies: activeCurrencies
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      throw error;
    }
  }

  // Format currency amount
  static formatCurrency(
    amount: number,
    currency: string,
    settings?: SchoolCurrencySettings
  ): string {
    try {
      // Use browser's Intl.NumberFormat for proper formatting
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return formatter.format(amount);
    } catch (error) {
      // Fallback to simple formatting
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  // Get next invoice number
  static async getNextInvoiceNumber(): Promise<string> {
    try {
      const settings = await this.getFinancialSettings();
      if (!settings) return 'INV-001';

      const prefix = settings.invoice_prefix || 'INV';
      const number = settings.next_invoice_number || 1;
      
      return `${prefix}-${number.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      return 'INV-001';
    }
  }

  // Increment invoice number
  static async incrementInvoiceNumber(): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      await supabase.rpc('increment_invoice_number', {
        p_school_id: schoolId
      });
    } catch (error) {
      console.error('Error incrementing invoice number:', error);
    }
  }
}

export default FinancialService;