import { Response } from 'express';

export const createChat = async (res: Response, name: string) => {
  try {
    const client = res.locals.client;
    const { data: { user }, error: userError } = await client.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message ? userError.message : 'Failed to get user');
    }

    const { data, error } = await client.from('chats')
      .insert({ name, user_id: user.id })
      .select('id');

    if (error) {
      throw new Error(error.message);
    }
    
    return data[0];
  } catch (error: any) {
    console.error("supabase error", error);
  }  
}