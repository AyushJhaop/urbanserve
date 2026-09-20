import { memStore } from '../../config/database';
import { bookingsService } from '../bookings/bookings.service';
import { UserRole } from '../../types';
import { randomUUID } from 'crypto';
import logger from '../../utils/logger';

export class AIService {
  // Process conversational message from user
  async chat(userId: string, userRole: UserRole, userMessage: string, conversationId?: string) {
    // 1. Get or create conversation container
    let conversation = memStore.ai_conversations.find((c) => c.id === conversationId && c.user_id === userId);
    if (!conversation) {
      conversation = {
        id: randomUUID(),
        user_id: userId,
        session_id: randomUUID(),
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      };
      memStore.ai_conversations.push(conversation);
    }

    // 2. Persist user message
    memStore.ai_messages.push({
      id: randomUUID(),
      conversation_id: conversation.id,
      sender_type: 'USER',
      message_content: userMessage,
      intent: null,
      metadata: null,
      created_at: new Date(),
    });

    // 3. Intelligent Intent & Entity Resolution (FAQ, SERVICE_DISCOVERY, STATUS_CHECK, QUICK_SERVICE, ESCALATION)
    const lower = userMessage.toLowerCase();
    let intent = 'FAQ';
    let aiResponse = '';
    let suggestedActions: any[] = [];

    if (lower.includes('status') || lower.includes('my booking') || lower.includes('where is') || lower.includes('track')) {
      intent = 'STATUS_CHECK';
      // Access application data strictly through authorized service boundary (FR-AI-009, FR-AI-010)
      const userBookings = await bookingsService.getBookings(userId, userRole);
      const activeBooking = userBookings.find((b) => !['COMPLETED', 'CANCELLED'].includes(b.status)) || userBookings[0];

      if (activeBooking) {
        aiResponse = `I checked your bookings! Your booking for **${activeBooking.service_name}** (#${activeBooking.booking_number}) is currently **${activeBooking.status.replace(/_/g, ' ')}**. Assigned professional: **${activeBooking.professional_name}**. Scheduled for ${activeBooking.scheduled_date || 'Today'} at ${activeBooking.scheduled_time || 'scheduled time'}.`;
        suggestedActions = [
          { label: 'View Booking Details', action: 'NAVIGATE', url: `/bookings` },
          { label: 'Live Support', action: 'ESCALATE' },
        ];
      } else {
        aiResponse = `You don't currently have any active bookings. Would you like me to help you schedule a home service today?`;
        suggestedActions = [
          { label: 'Browse Popular Services', action: 'NAVIGATE', url: '/services' },
          { label: 'Request Quick Service', action: 'QUICK_SERVICE' },
        ];
      }
    } else if (lower.includes('leak') || lower.includes('pipe') || lower.includes('plumb') || lower.includes('drain') || lower.includes('water')) {
      intent = 'SERVICE_DISCOVERY';
      const services = memStore.services.filter((s) => s.category_id === 2); // Plumbing
      aiResponse = `It sounds like you need plumbing assistance! We have **${services.length} plumbing services** available immediately with top-rated local professionals. For urgent leaks, our **Quick Service** guarantees a pro assigned in under 5 minutes!`;
      suggestedActions = services.slice(0, 3).map((s) => ({
        label: `Book ${s.name} ($${s.base_price})`,
        action: 'BOOK',
        service_id: s.id,
      }));
    } else if (lower.includes('clean') || lower.includes('maid') || lower.includes('dust') || lower.includes('mop')) {
      intent = 'SERVICE_DISCOVERY';
      const services = memStore.services.filter((s) => s.category_id === 1); // Cleaning
      aiResponse = `Looking for sparkling clean spaces? Our verified cleaners offer deep house sanitization, kitchen degreasing, and express cleans using eco-friendly products.`;
      suggestedActions = services.slice(0, 3).map((s) => ({
        label: `${s.name} ($${s.base_price})`,
        action: 'BOOK',
        service_id: s.id,
      }));
    } else if (lower.includes('electric') || lower.includes('power') || lower.includes('spark') || lower.includes('switch') || lower.includes('fan')) {
      intent = 'SERVICE_DISCOVERY';
      const services = memStore.services.filter((s) => s.category_id === 3); // Electrical
      aiResponse = `Need electrical help? Safety is our priority. All UrbanServe electricians are licensed and background-checked for breaker repairs, fixture installs, and emergency hazards.`;
      suggestedActions = services.slice(0, 3).map((s) => ({
        label: `${s.name} ($${s.base_price})`,
        action: 'BOOK',
        service_id: s.id,
      }));
    } else if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('asap') || lower.includes('quick')) {
      intent = 'QUICK_SERVICE';
      aiResponse = `🚨 Need immediate help? UrbanServe Quick-Service connects you with available professionals nearby within a 5-minute response window. Would you like to launch an urgent dispatch?`;
      suggestedActions = [
        { label: '⚡ Launch Urgent Dispatch', action: 'QUICK_SERVICE', url: '/services' },
        { label: 'Call Support Helpline', action: 'ESCALATE' },
      ];
    } else if (lower.includes('cancel') || lower.includes('reschedule') || lower.includes('refund')) {
      intent = 'CANCELLATION';
      aiResponse = `You can cancel or reschedule any scheduled booking without penalty up to 2 hours before the appointment. Simply visit your Bookings page and click 'Reschedule' or 'Cancel'. If a payment was made, your refund will be processed in 3-5 business days.`;
      suggestedActions = [
        { label: 'Go to My Bookings', action: 'NAVIGATE', url: '/bookings' },
      ];
    } else if (lower.includes('human') || lower.includes('agent') || lower.includes('help') || lower.includes('complaint') || lower.includes('dispute')) {
      intent = 'ESCALATION';
      conversation.status = 'ESCALATED';
      aiResponse = `I've flagged this conversation for our dedicated human support desk. An UrbanServe support specialist has been notified and will assist you shortly. You can also file a direct ticket via the Disputes portal.`;
      suggestedActions = [
        { label: 'File a Support Ticket', action: 'NAVIGATE', url: '/bookings' },
      ];
    } else {
      intent = 'FAQ';
      aiResponse = `Hello! I'm UrbanServe's AI Assistant. I can help you find verified local professionals for cleaning, plumbing, electrical, carpentry, or painting. I can also track your active bookings or dispatch urgent quick-services. How can I assist you today?`;
      suggestedActions = [
        { label: 'Find a Plumber', action: 'SEARCH', query: 'Plumbing' },
        { label: 'Book House Cleaning', action: 'SEARCH', query: 'Cleaning' },
        { label: 'Check Booking Status', action: 'STATUS' },
      ];
    }

    // 4. Save AI message
    const aiMsg = {
      id: randomUUID(),
      conversation_id: conversation.id,
      sender_type: 'AI',
      message_content: aiResponse,
      intent,
      metadata: { suggested_actions: suggestedActions },
      created_at: new Date(),
    };
    memStore.ai_messages.push(aiMsg);

    logger.info(`AI processed intent ${intent} for user ${userId}`);

    return {
      conversation_id: conversation.id,
      message: aiResponse,
      intent,
      suggested_actions: suggestedActions,
      status: conversation.status,
    };
  }

  // Get conversation history
  async getConversationHistory(userId: string) {
    const userConvs = memStore.ai_conversations.filter((c) => c.user_id === userId);
    return userConvs.map((conv) => {
      const messages = memStore.ai_messages.filter((m) => m.conversation_id === conv.id);
      return {
        ...conv,
        messages,
      };
    });
  }
}

export const aiService = new AIService();
