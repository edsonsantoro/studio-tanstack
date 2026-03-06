export function getVideoEmbedUrl(url?: string) {
    if (!url) return null;

    try {
        const videoUrl = new URL(url);

        // YouTube
        if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
            let videoId = '';
            if (videoUrl.hostname.includes('youtu.be')) {
                videoId = videoUrl.pathname.slice(1);
            } else {
                videoId = videoUrl.searchParams.get('v') || '';
            }

            // Handle shorts
            if (videoUrl.pathname.includes('/shorts/')) {
                videoId = videoUrl.pathname.split('/shorts/')[1].split('/')[0];
            }

            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }

        // Vimeo
        if (videoUrl.hostname.includes('vimeo.com')) {
            const videoId = videoUrl.pathname.split('/').pop();
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }

        // DailyMotion
        if (videoUrl.hostname.includes('dailymotion.com') || videoUrl.hostname.includes('dai.ly')) {
            const videoId = videoUrl.hostname.includes('dai.ly')
                ? videoUrl.pathname.slice(1)
                : videoUrl.pathname.split('/video/')[1]?.split('_')[0];
            return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : null;
        }

        // Loom
        if (videoUrl.hostname.includes('loom.com')) {
            const videoId = videoUrl.pathname.split('/share/')[1]?.split('?')[0];
            return videoId ? `https://www.loom.com/embed/${videoId}` : null;
        }

    } catch (e) {
        console.error("Invalid URL while getting embed:", url);
    }

    return null;
}
