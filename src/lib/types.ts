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
      user_calendars: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          share_code: string;
          is_public: boolean;
          username: string | null;
          theme: string | null;
          background_image: string | null;
          price: number | null;
          currency: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title?: string;
          description?: string | null;
          share_code?: string;
          is_public?: boolean;
          username?: string | null;
          theme?: string | null;
          background_image?: string | null;
          price?: number | null;
          currency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string | null;
          share_code?: string;
          is_public?: boolean;
          username?: string | null;
          theme?: string | null;
          background_image?: string | null;
          price?: number | null;
          currency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_calendar_days: {
        Row: {
          id: string;
          calendar_id: string;
          day_number: number;
          title: string | null;
          message: string | null;
          image_url: string | null;
          model_url: string | null;
          like_count: number;
          price: number | null;
          currency: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_id: string;
          day_number: number;
          title?: string | null;
          message?: string | null;
          image_url?: string | null;
          model_url?: string | null;
          like_count?: number;
          price?: number | null;
          currency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          calendar_id?: string;
          day_number?: number;
          title?: string | null;
          message?: string | null;
          image_url?: string | null;
          model_url?: string | null;
          like_count?: number;
          price?: number | null;
          currency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          twitter_url: string | null;
          instagram_url: string | null;
          website_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          website_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          website_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          scene_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          scene_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Artist = Database['public']['Tables']['artists']['Row'];
export type Scene = Database['public']['Tables']['scenes']['Row'];
export type Translation = Database['public']['Tables']['translations']['Row'];
export type Tip = Database['public']['Tables']['tips']['Row'];
export type UserCalendar = Database['public']['Tables']['user_calendars']['Row'];
export type UserCalendarDay = Database['public']['Tables']['user_calendar_days']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

export type Language = 'en' | 'ja' | 'uk';

export interface SceneWithDetails extends Scene {
  artist: Artist | null;
  translations: Translation[];
}

export interface CalendarDayWithDetails extends UserCalendarDay {
  calendar?: UserCalendar;
  likes?: Like[];
  comments?: Comment[];
  isLiked?: boolean;
}
