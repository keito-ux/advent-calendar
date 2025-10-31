export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          name: string;
          bio: string;
          profile_image_url: string;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string;
          profile_image_url?: string;
          country?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string;
          profile_image_url?: string;
          country?: string;
          created_at?: string;
        };
      };
      scenes: {
        Row: {
          id: string;
          day_number: number;
          title: string;
          image_url: string;
          artist_id: string | null;
          unlock_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_number: number;
          title: string;
          image_url: string;
          artist_id?: string | null;
          unlock_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_number?: number;
          title?: string;
          image_url?: string;
          artist_id?: string | null;
          unlock_date?: string;
          created_at?: string;
        };
      };
      translations: {
        Row: {
          id: string;
          scene_id: string;
          language_code: 'en' | 'ja' | 'uk';
          text_content: string;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          language_code: 'en' | 'ja' | 'uk';
          text_content: string;
          audio_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: string;
          language_code?: 'en' | 'ja' | 'uk';
          text_content?: string;
          audio_url?: string | null;
          created_at?: string;
        };
      };
      tips: {
        Row: {
          id: string;
          artist_id: string;
          scene_id: string | null;
          amount: number;
          currency: string;
          tipper_name: string | null;
          message: string | null;
          stripe_payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          scene_id?: string | null;
          amount: number;
          currency?: string;
          tipper_name?: string | null;
          message?: string | null;
          stripe_payment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          scene_id?: string | null;
          amount?: number;
          currency?: string;
          tipper_name?: string | null;
          message?: string | null;
          stripe_payment_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

export type Artist = Database['public']['Tables']['artists']['Row'];
export type Scene = Database['public']['Tables']['scenes']['Row'];
export type Translation = Database['public']['Tables']['translations']['Row'];
export type Tip = Database['public']['Tables']['tips']['Row'];

export type Language = 'en' | 'ja' | 'uk';

export interface SceneWithDetails extends Scene {
  artist: Artist | null;
  translations: Translation[];
}
