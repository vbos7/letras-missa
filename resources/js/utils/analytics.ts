import axios from 'axios';

interface TrackEventParams {
    event_type:
        | 'page_view'
        | 'game_started'
        | 'game_finished'
        | 'support_click';
    game_mode?:
        | 'words'
        | 'questions'
        | 'secret_word'
        | 'factions'
        | 'category_item';
    language?: 'pt' | 'en' | 'es' | 'fr';
    players_count?: number;
    two_impostors?: boolean;
    metadata?: Record<string, unknown>;
}

const sessionId = `${Date.now()}-${Math.random()}`;

export const trackEvent = async (params: TrackEventParams): Promise<void> => {
    try {
        await axios.post('/api/analytics/track', {
            ...params,
            session_id: sessionId,
            page: window.location.href,
        });
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
};
