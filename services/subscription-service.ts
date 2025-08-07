import ApiService from './api-service';

export interface Subscription {
  id: number;
  userId: number;
  dietPlanId: number;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELED';
  pricePerCycle: number;
  billingCycle: string;
  createdAt: string;
}

export interface SubscriptionRequest {
  dietPlanId: number;
  pricePerCycle: number;
  billingCycle: string;
}

class SubscriptionService {
  static async createSubscription(dietPlanId: number, pricePerCycle: number, billingCycle: string): Promise<Subscription | null> {
    const request: SubscriptionRequest = {
      dietPlanId,
      pricePerCycle,
      billingCycle,
    };
    
    try {
      const response = await ApiService.createSubscription(request);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  static async getActiveSubscription(): Promise<Subscription | null> {
    try {
      const response = await ApiService.getActiveSubscription();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting active subscription:', error);
      return null;
    }
  }

  static async cancelSubscription(): Promise<Subscription | null> {
    try {
      const response = await ApiService.cancelSubscription();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return null;
    }
  }

  static async pauseSubscription(): Promise<Subscription | null> {
    try {
      const response = await ApiService.pauseSubscription();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      return null;
    }
  }

  static async resumeSubscription(): Promise<Subscription | null> {
    try {
      const response = await ApiService.resumeSubscription();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return null;
    }
  }

  static formatBillingCycle(billingCycle: string): string {
    switch (billingCycle.toUpperCase()) {
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return 'Monthly';
      case 'QUARTERLY':
        return 'Quarterly';
      case 'YEARLY':
        return 'Yearly';
      default:
        return billingCycle;
    }
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export default SubscriptionService;
