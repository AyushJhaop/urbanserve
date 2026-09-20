import { Response } from 'express';
import { AuthRequest } from '../../types';
import { aiService } from './ai.service';
import { ApiResponse } from '../../utils/response';

export class AIController {
  async chat(req: AuthRequest, res: Response) {
    try {
      const userId = req.user ? req.user.id : 'guest-user';
      const userRole = req.user ? req.user.role : ('CUSTOMER' as any);
      const { message, conversation_id } = req.body;

      if (!message) {
        return ApiResponse.badRequest(res, 'Message text is required');
      }

      const reply = await aiService.chat(userId, userRole, message, conversation_id);
      return ApiResponse.success(res, reply, 'AI message processed');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const history = await aiService.getConversationHistory(userId);
      return ApiResponse.success(res, history, 'Conversations retrieved');
    } catch (error: any) {
      return ApiResponse.serverError(res, error.message);
    }
  }
}

export const aiController = new AIController();
