import { Response } from 'express';
import { createSupabaseClient } from '../../supabase/createSupabaseClient';

interface UpdateUpdatedAtParams {
  updatedAt: Date;
  chatId: string;
}

export const updateUpdatedAt = async (res: Response, param: UpdateUpdatedAtParams) => {
  const client = createSupabaseClient(res.locals.token);
  const { updatedAt, chatId } = param as UpdateUpdatedAtParams;
  try {
    const { error } = await client.from('chats').update({
      updated_at: updatedAt,
    })
    .eq('id', chatId)

    if (error) {
      throw error;
    }

    return res.json({ message: 'Chat updated at updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update chat' });
  }  
}